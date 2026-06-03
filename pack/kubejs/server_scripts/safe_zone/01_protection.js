// =========================================================================
// SAFE ZONE — Zona segura ao redor do spawn do mundo
// =========================================================================
// - Players ficam INVULNERÁVEIS a todo dano dentro de um raio (horizontal) do
//   spawn do overworld: mobs, PvP, queda, lava/fogo, afogamento, explosão, etc.
// - Mobs HOSTIS não spawnam naturalmente dentro da zona (checkSpawn).
// - Varredura periódica REMOVE hostis já existentes/que entram na zona.
//
// A zona é um CILINDRO: distância horizontal (X/Z) ao spawn <= RAIO, em
// qualquer altura. Vale só no overworld (onde fica o spawn do mundo).
//
// NOTA RHINO (KubeJS 2001): vários getters Java são expostos como PROPRIEDADE,
// não método — chamar com () estoura ("not a function, it is object").
// Confirmado por sonda: usar `level.dimension` (não `.dimension()`),
// `level.sharedSpawnPos`, `level.minBuildHeight/maxBuildHeight`, `ent.x/ent.z`,
// `ent.level`, `String(ent.type)`. Hostis: getEntitiesOfClass(Enemy.class).
// (A versão antiga usava .dimension().location() e getType().getCategory() →
// estourava → inZone/checkSpawn sempre caíam no catch → proteção MORTA.)

;(function () {
  // ---- CONFIG ------------------------------------------------------------
  var CONFIG = {
    radius: 500,                       // raio em blocos (horizontal) ao redor do spawn
    dimension: 'minecraft:overworld',  // dimensão da zona
    cancelHostileSpawns: true,         // cancela spawn de hostis na zona
    protectPlayersOnly: true,          // invulnerabilidade só pra players
    clearExistingOnStart: true         // limpa hostis pré-existentes UMA vez no start (sem polling contínuo)
  }
  var RADIUS_SQ = CONFIG.radius * CONFIG.radius

  // ---- classes Mojmap ----------------------------------------------------
  var $Enemy, $AABB, ready = false
  try {
    $Enemy = Java.loadClass('net.minecraft.world.entity.monster.Enemy')
    $AABB = Java.loadClass('net.minecraft.world.phys.AABB')
    ready = true
  } catch (e) {
    console.error('[SafeZone] falha ao carregar classes Mojmap: ' + e)
  }

  function unwrap(o) {
    if (!o) return o
    if (o.minecraftEntity) return o.minecraftEntity
    if (o.minecraftPlayer) return o.minecraftPlayer
    return o
  }

  // centro da zona (spawn do overworld) em coords de bloco+0.5
  function spawnCenter(mcLevel) {
    var sp = mcLevel.sharedSpawnPos
    return { x: sp.getX() + 0.5, z: sp.getZ() + 0.5 }
  }

  // true se (x,z) está dentro do raio horizontal do spawn do overworld
  function inZone(mcLevel, x, z) {
    try {
      if (!mcLevel) return false
      if (String(mcLevel.dimension) !== CONFIG.dimension) return false
      var c = spawnCenter(mcLevel)
      var dx = x - c.x, dz = z - c.z
      return (dx * dx + dz * dz) <= RADIUS_SQ
    } catch (e) {
      return false
    }
  }

  // ---- 1. Invulnerabilidade: cancela TODO dano a players na zona ----------
  EntityEvents.hurt(function (event) {
    if (!ready) return
    try {
      var ent = unwrap(event.entity)
      if (!ent) return
      if (CONFIG.protectPlayersOnly && String(ent.type) !== 'minecraft:player') return
      if (inZone(ent.level, ent.x, ent.z)) {
        event.cancel()
      }
    } catch (e) { /* handler nunca derruba o evento */ }
  })

  // ---- 2. Sem spawn de hostis na zona ------------------------------------
  if (CONFIG.cancelHostileSpawns) {
    EntityEvents.checkSpawn(function (event) {
      if (!ready) return
      try {
        var ent = unwrap(event.entity)
        if (!ent) return
        if (!(ent instanceof $Enemy)) return
        if (inZone(ent.level, ent.x, ent.z)) {
          event.cancel()
        }
      } catch (e) { /* ignora */ }
    })
  }

  // ---- 3. Limpeza ÚNICA no start: remove hostis pré-existentes na zona ----
  // Roda UMA vez (~10s após carregar) e NUNCA mais — zero polling contínuo.
  // O checkSpawn acima impede que novos hostis spawnem, então não precisa varrer.
  if (CONFIG.clearExistingOnStart) {
    var cleared = false
    ServerEvents.tick(function (event) {
      if (cleared || !ready) return
      var server = event.server
      if (server.tickCount % 40 !== 0) return  // espera ~poucos segundos após carregar
      cleared = true
      var removed = 0
      try {
        server.allLevels.forEach(function (level) {
          try {
            if (String(level.dimension) !== CONFIG.dimension) return
            var c = spawnCenter(level)
            var r = CONFIG.radius
            var box = new $AABB(c.x - r, level.minBuildHeight, c.z - r,
                                c.x + r, level.maxBuildHeight, c.z + r)
            level.getEntitiesOfClass($Enemy, box).forEach(function (m) {
              try {
                var dx = m.x - c.x, dz = m.z - c.z
                if (dx * dx + dz * dz <= RADIUS_SQ) { m.discard(); removed++ }
              } catch (e) {}
            })
          } catch (e) {}
        })
      } catch (e) {}
      console.info('[SafeZone] limpeza inicial: ' + removed + ' hostis removidos da zona (sem mais polling)')
    })
  }

  console.info('[SafeZone] ativa: raio ' + CONFIG.radius + ' em ' + CONFIG.dimension +
    ' (invuln players' + (CONFIG.cancelHostileSpawns ? ' + bloqueio de spawn de hostis' : '') +
    (CONFIG.clearExistingOnStart ? ' + limpeza inicial única' : '') + ')')
})()
