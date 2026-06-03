# Spawn Bubble — Lost City

Os region files da **cidade inicial** (Lost City) que fica no spawn (0,0),
dentro de um raio de ~512 blocos (4 region files: r.-1.-1, r.-1.0, r.0.-1, r.0.0).

**Sem `level.dat`** de propósito: ao usar como base de um mundo de servidor, o
servidor gera um `level.dat` novo (seed aleatória) e PRESERVA estes chunks da
cidade — assim cada mundo tem a cidade no spawn mas terreno de exploração novo.

## Como usar (servidor)
1. `world/` vazio (sem level.dat).
2. Copie `region/`, `entities/`, `poi/`, `data/` daqui pra dentro de `world/`.
3. `chown -R 1000:1000 world` (itzg roda como UID 1000).
4. `level-seed=` vazio no server.properties → boot gera seed nova + mantém a cidade.
5. Após boot: `/setworldspawn 0 20 0`.

⚠️ Single-player NÃO carrega save sem level.dat (mundo não aparece na lista).
A bolha-sem-level.dat só funciona em servidor.
