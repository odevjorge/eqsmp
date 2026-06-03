// =========================================================================
// BUILD MODE — /eqsmp buildmode on|off
// =========================================================================
// "Pausa" a simulação do mundo pra liberar CPU pro WorldEdit em operações
// pesadas (schematics grandes). NÃO-destrutivo: só toggle de gamerules, não
// mata nem altera entidades/blocos.
//
//   on  → randomTickSpeed 0 (sem crop/folha/fluido/fogo/gelo tickando),
//         doMobSpawning / doFireTick / doWeatherCycle / doDaylightCycle /
//         mobGriefing / doInsomnia = false, + weather clear.
//   off → restaura os defaults vanilla.
//
// 1.20.1 não tem /tick freeze (só 1.20.3+); isso é o equivalente prático.
// Requer op (nível 2). Faz merge com o /eqsmp existente (kit).

;(function () {
  var $Commands = Java.loadClass('net.minecraft.commands.Commands')

  var BUILD = [
    'gamerule randomTickSpeed 0',
    'gamerule doMobSpawning false',
    'gamerule doFireTick false',
    'gamerule doWeatherCycle false',
    'gamerule doDaylightCycle false',
    'gamerule mobGriefing false',
    'gamerule doInsomnia false',
    'weather clear'
  ]
  var NORMAL = [
    'gamerule randomTickSpeed 3',
    'gamerule doMobSpawning true',
    'gamerule doFireTick true',
    'gamerule doWeatherCycle true',
    'gamerule doDaylightCycle true',
    'gamerule mobGriefing true',
    'gamerule doInsomnia true'
  ]

  function serverOf(ctx) {
    try { if (ctx.source.server) return ctx.source.server } catch (e) {}
    try { if (ctx.source.player && ctx.source.player.server) return ctx.source.player.server } catch (e) {}
    return null
  }

  function apply(ctx, cmds, msg) {
    var server = serverOf(ctx)
    if (!server) { try { ctx.source.sendFailure(Text.of('§cBuildMode: servidor indisponível')) } catch (e) {}; return 0 }
    cmds.forEach(function (c) { try { server.runCommandSilent(c) } catch (e) {} })
    try { server.tell(Text.of(msg)) } catch (e) {}
    console.info('[BuildMode] ' + msg.replace(/§./g, ''))
    return 1
  }

  ServerEvents.commandRegistry(function (event) {
    event.register(
      $Commands.literal('eqsmp')
        .then($Commands.literal('buildmode')
          .requires(function (s) { try { return s.hasPermission(2) } catch (e) { return false } })
          .then($Commands.literal('on').executes(function (ctx) {
            return apply(ctx, BUILD, '§7[§6EQSMP§7] §aModo build LIGADO §7— simulação pausada, CPU livre pro WorldEdit.')
          }))
          .then($Commands.literal('off').executes(function (ctx) {
            return apply(ctx, NORMAL, '§7[§6EQSMP§7] §eModo build DESLIGADO §7— simulação normal restaurada.')
          }))
        )
    )
    console.log('[BuildMode] /eqsmp buildmode on|off registered')
  })
})()
