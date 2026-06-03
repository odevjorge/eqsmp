# Surveyor Map Framework — Guia de API (EQSMP)

Referência de como usar a API do **Surveyor** (`surveyor` 1.2.4) neste pack. Surveyor é o
*backend* de dados de mapa usado pelo **Antique Atlas 4**: ele guarda terreno explorado,
estruturas, e **landmarks** (POIs/waypoints) — e expõe tudo via API.

Fonte: https://github.com/sisby-folk/surveyor (branch `1.20`, LGPLv3).
Guia oficial de frontends: `FRONTENDS.md` no repo.

---

## 1. Realidade no Forge (LEIA PRIMEIRO)

Surveyor e Antique Atlas 4 são mods **Fabric**. Neste pack Forge eles rodam através do
**Sinytra Connector** + **Forgified Fabric API** (ambos instalados). Consequências práticas:

- As classes do mod mantêm o nome (`folk.sisby.surveyor.*`).
- Os **tipos do Minecraft** nas assinaturas são **remapeados Yarn → Mojmap** pelo Connector
  em runtime. Ou seja: o código-fonte usa nomes Yarn (`Identifier`, `Text`, `World`...),
  mas quando você chama de um mod Forge (ex.: **KubeJS**) você passa os tipos **Mojmap**:

  | Surveyor (Yarn, no source)            | Você usa (Mojmap, KubeJS/Forge)                                  |
  |---------------------------------------|------------------------------------------------------------------|
  | `net.minecraft.util.Identifier`       | `net.minecraft.resources.ResourceLocation`                       |
  | `net.minecraft.text.Text`             | `net.minecraft.network.chat.Component`                           |
  | `net.minecraft.world.World`           | `net.minecraft.world.level.Level` (passe um `ServerLevel`)       |
  | `net.minecraft.util.math.BlockPos`    | `net.minecraft.core.BlockPos`                                    |
  | `net.minecraft.item.ItemStack`        | `net.minecraft.world.item.ItemStack`                             |
  | `net.minecraft.util.math.BlockBox`    | `net.minecraft.world.level.levelgen.structure.BoundingBox`       |

> **Antes de construir algo:** confirme que o KubeJS consegue carregar as classes do
> Surveyor (igual fizemos no `sin_difficulty`). Ponha no topo de um `server_script`:
> ```js
> try { Java.loadClass('folk.sisby.surveyor.WorldSummary'); console.info('[Surveyor] API OK') }
> catch (e) { console.error('[Surveyor] API indisponível: ' + e) }
> ```
> e cheque `eqsmp/logs/kubejs/server.log` após `kubejs reload server_scripts`.

---

## 2. Modelo de dados

- **`WorldSummary`** — todos os dados de mapa de **uma dimensão** (terreno, estruturas, landmarks).
  Ponto de entrada: `WorldSummary.of(level)`.
- **`WorldLandmarks`** — a coleção de landmarks daquela dimensão. `worldSummary.landmarks()`
  (pode ser `null` se o sistema estiver `DISABLED`).
- **`Landmark`** — um POI/waypoint. É um `record` identificado por **(owner: UUID, id: ResourceLocation)**
  + um mapa de **componentes** (posição, nome, cor, etc.).
  - `owner = WorldLandmarks.GLOBAL` → landmark **global** (POI do servidor, visível a todos).
    `GLOBAL = 99999999-9999-9999-9999-999999999999`.
  - `owner = UUID de um jogador` → **waypoint** daquele jogador.

### Componentes disponíveis (`LandmarkComponentTypes`)

Cada um é um `LandmarkComponentType<T>`:

| Componente | Tipo (Mojmap)            | Uso                                                        |
|------------|--------------------------|------------------------------------------------------------|
| `POS`      | `BlockPos`               | Posição do marcador (quase sempre obrigatório p/ renderizar)|
| `NAME`     | `Component`              | Nome exibido                                               |
| `LORE`     | `List<Component>`        | Linhas de descrição                                        |
| `COLOR`    | `Integer` (`0xRRGGBB`)   | Cor do marcador                                            |
| `TIME`     | `Long` (game tick)       | Carimbo de tempo (ex.: morte)                              |
| `SEED`     | `Integer`                | Seed (uso de addons)                                       |
| `BOX`      | `BoundingBox`            | Área/região                                                |
| `STACK`    | `ItemStack`              | Ícone via item                                             |
| `CHUNKS`   | `Map<RegionPos, BitSet>` | Conjunto de chunks (uso de addons)                         |

---

## 3. API de Landmarks (o que você vai usar)

### Criar (`Landmark`, estáticos)
```
Landmark create(UUID owner, ResourceLocation id, UnaryOperator<Builder> changes)
Landmark global(ResourceLocation id, UnaryOperator<Builder> changes)        // owner = GLOBAL
Landmark createIncremental(WorldLandmarks lm, UUID owner, ResourceLocation prefix, UnaryOperator<Builder> changes)
Landmark globalIncremental(WorldLandmarks lm, ResourceLocation prefix, UnaryOperator<Builder> changes)
```
O `Builder` tem `.add(type, value)` (encadeável).

### Gerenciar (`WorldLandmarks`)
```
void    put(Landmark landmark)            // adiciona + salva + sincroniza p/ clientes (use este no servidor)
void    put(UUID sender, Landmark landmark)
void    putLocal(Landmark landmark)       // adiciona SEM sincronizar
void    remove(UUID owner, ResourceLocation id)
void    removeLocal(UUID owner, ResourceLocation id)
void    removeAll(Predicate<Landmark> predicate)
boolean contains(UUID owner, ResourceLocation id)
Landmark get(UUID owner, ResourceLocation id)   // null se não existe
```
Ler componentes de um landmark: `landmark.components().get(LandmarkComponentTypes.NAME)`.

### Exemplo KubeJS — POI global (server_script)
```js
const $WorldSummary = Java.loadClass('folk.sisby.surveyor.WorldSummary')
const $WorldLandmarks = Java.loadClass('folk.sisby.surveyor.landmark.WorldLandmarks')
const $Landmark = Java.loadClass('folk.sisby.surveyor.landmark.Landmark')
const $C = Java.loadClass('folk.sisby.surveyor.landmark.component.LandmarkComponentTypes')
const $RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
const $Component = Java.loadClass('net.minecraft.network.chat.Component')

// level = um ServerLevel (ex.: event.server.overworld(), ou entity.level no servidor)
function addPoi(level, path, blockPos, name, colorRGB) {
  const ws = $WorldSummary.of(level)
  const lm = ws ? ws.landmarks() : null
  if (!lm) return false // sistema de landmarks desabilitado nessa dimensão
  const id = new $RL('eqsmp', path)
  lm.put($Landmark.global(id, b => b
    .add($C.POS, blockPos)
    .add($C.NAME, $Component.literal(name))
    .add($C.COLOR, colorRGB)
  ))
  return true
}

function removePoi(level, path) {
  const ws = $WorldSummary.of(level)
  const lm = ws ? ws.landmarks() : null
  if (lm) lm.remove($WorldLandmarks.GLOBAL, new $RL('eqsmp', path))
}

// uso:
// addPoi(event.server.overworld(), 'spawn', BlockPos.containing(0, 64, 0), 'Spawn', 0x33AAFF)
```
> `b => b.add(...).add(...)` casa com o `UnaryOperator<Builder>` esperado (o Rhino converte a
> função JS na interface funcional automaticamente). Use um **namespace próprio** (`eqsmp:...`)
> nos IDs pra não colidir com os landmarks do próprio Surveyor.

---

## 4. Eventos (server-side)

Registre via `SurveyorEvents.Register` (passe um `ResourceLocation` único como chave):
```
Register.terrainUpdated(ResourceLocation id, (WorldSummary summary, Map<RegionPos,BitSet> chunks) -> {...})
Register.structuresAdded(ResourceLocation id, (WorldSummary summary, Multimap<ResourceKey<Structure>,ChunkPos> starts) -> {...})
Register.landmarksAdded(ResourceLocation id, (WorldSummary summary, Multimap<UUID,ResourceLocation> landmarks) -> {...})
Register.landmarksRemoved(ResourceLocation id, (WorldSummary summary, Multimap<UUID,ResourceLocation> landmarks) -> {...})
```
Disparam quando terreno/estrutura/landmark mudam (geralmente por exploração). Úteis para
reagir a descobertas (ex.: dar recompensa de quest ao explorar/achar estrutura).

> Frontends **client-side** (minimapas próprios) usam `SurveyorClientEvents` em vez destes —
> só exploram áreas já reveladas. Para lógica de servidor (KubeJS), use `SurveyorEvents`.

---

## 5. Comandos in-game

- `/surveyor`, `/waypoints`, `/landmarks` — revisar dados de mapa/waypoints.
- `/waypoints new|remove` — criar/editar waypoints pessoais.
- `/landmarks new|remove` — criar/editar **landmarks globais** (op nível 2) — POIs do servidor (spawn, lojas, hubs).
- `/surveyor share|unshare` — formar grupos (só quando `globalSharing=false`).

---

## 6. Config & armazenamento

Config: `eqsmp/config/surveyor.toml` (mudanças exigem **restart**). Estado atual neste pack:
- `globalSharing = true` — mapa **compartilhado por todo o servidor** (co-op). Para servidor
  público/privacidade, troque para `false` (aí os grupos viram manuais via `/surveyor share`).
- `discoveryMessages = true` — avisa na action bar ao descobrir estruturas (combina com exploração).
- Sistemas `terrain`/`structures`/`landmarks = DYNAMIC` (carregam no servidor/com addons).
- Builtins ligados: waypoints de morte, POIs de portal do Nether, lodestone, dados de banner.
- `[networking]` controla o quanto sincronizar (terrain/structures/landmarks/waypoints/positions).

Dados salvos em: `world/<dim>/data/surveyor/` no servidor —
`c.X.X` = terreno, `s.X.X` = estruturas, `landmarks.dat` = landmarks/waypoints.

### Addons úteis (não instalados)
- **Surveystones** — marca **Waystones** automaticamente no atlas (o pack tem Waystones + chapter de quest).
- **Hoofprint** / **Dead Reckoning** — frontends alternativos de mapa que reusam os mesmos dados do Surveyor.
