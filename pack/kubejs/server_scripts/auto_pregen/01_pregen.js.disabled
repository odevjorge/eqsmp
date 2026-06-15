// =========================================================================
// AUTO PREGEN — Chunky roda só com o servidor VAZIO, com DELAY de 5 min
// =========================================================================
// - 0 jogadores online → PAUSA na hora (mata o lag de "ligou/reconectou e já
//   começou a gerar") e SÓ retoma a pré-geração depois de 5 min CONTÍNUOS
//   vazio. Se alguém entrar durante a espera, o contador reseta.
// - 1+ jogador online → pausa a pré-geração imediatamente.
//
// A SELEÇÃO mora AQUI como fonte da verdade (mundo/centro/raio/shape) — robusto
// a reset do config/chunky em reboots (o packwiz-installer chega a apagar
// config/chunky, fora do index; a seleção é re-aplicada toda vez que (re)inicia).

;(function () {
  var CONFIG = {
    checkEveryTicks: 100,    // reconcilia a cada ~5s
    startDelayTicks: 200,    // ~10s de graça após boot antes de avaliar
    resumeDelayTicks: 6000,  // 5 min (20t/s * 300s) vazio antes de (re)começar a gerar
    // --- seleção da pré-geração (fonte da verdade) ---
    world: 'minecraft:overworld',
    centerX: 0,              // alinhado ao world spawn (setworldspawn 0 20 0)
    centerZ: 0,
    shape: 'square',
    radius: 20000,
    quiet: 300
  }

  function playerCount(server) {
    try {
      var p = server.players
      if (!p) return 0
      if (typeof p.size === 'function') return p.size()
      if (p.length !== undefined && p.length !== null) return p.length
      return 0
    } catch (e) { return 0 }
  }

  function resumePregen(server) {
    // re-aplica a seleção (caso o config tenha resetado) e garante a tarefa:
    // continue resume tarefa pausada; start cria se não existir (no-op se já rodando).
    server.runCommandSilent('chunky world ' + CONFIG.world)
    server.runCommandSilent('chunky center ' + CONFIG.centerX + ' ' + CONFIG.centerZ)
    server.runCommandSilent('chunky shape ' + CONFIG.shape)
    server.runCommandSilent('chunky radius ' + CONFIG.radius)
    server.runCommandSilent('chunky quiet ' + CONFIG.quiet)
    server.runCommandSilent('chunky continue')
    server.runCommandSilent('chunky start')
  }

  var lastEmpty = null   // null = ainda não avaliado; true = vazio; false = ocupado
  var emptySince = -1    // tick em que ficou vazio (início da contagem do delay)
  var pregenActive = false

  ServerEvents.tick(function (event) {
    var server = event.server
    var tc = server.tickCount
    if (tc < CONFIG.startDelayTicks) return
    if (tc % CONFIG.checkEveryTicks !== 0) return

    var empty = playerCount(server) === 0

    if (!empty) {
      // ocupado → pausa imediatamente e reseta a contagem
      if (lastEmpty !== false) {
        server.runCommandSilent('chunky pause')
        console.info('[AutoPregen] player online → Chunky PAUSADO')
      }
      lastEmpty = false
      emptySince = -1
      pregenActive = false
      return
    }

    // vazio
    if (lastEmpty !== true) {
      // acabou de esvaziar (ou primeira avaliação no boot) → pausa qualquer
      // tarefa auto-retomada e inicia a contagem do delay.
      server.runCommandSilent('chunky pause')
      emptySince = tc
      pregenActive = false
      lastEmpty = true
      console.info('[AutoPregen] servidor vazio → aguardando ' + (CONFIG.resumeDelayTicks / 20) +
        's antes de iniciar a pre-geracao')
      return
    }

    if (!pregenActive && emptySince >= 0 && (tc - emptySince) >= CONFIG.resumeDelayTicks) {
      resumePregen(server)
      pregenActive = true
      console.info('[AutoPregen] delay de ' + (CONFIG.resumeDelayTicks / 20) +
        's cumprido → pre-geracao iniciada (' + CONFIG.centerX + ',' + CONFIG.centerZ + ' r' + CONFIG.radius + ')')
    }
  })

  console.info('[AutoPregen] automacao ativa (Chunky so com servidor vazio, delay de ' +
    (CONFIG.resumeDelayTicks / 20) + 's)')
})()
