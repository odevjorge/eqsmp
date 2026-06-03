// =========================================================================
// STRUCTURE AUDIT — dump dinâmico das estruturas registradas
// =========================================================================
// Lê o registro de estruturas EM RUNTIME (pega qualquer mod, presente ou
// futuro — não depende de garimpar jar). Pra cada estrutura, lista quantos
// biomas ela aceita e quantos desses são do Still Life que REALMENTE geram.
//
// Comandos (op level 2):
//   /eqsmp structures            → resumo: cada estrutura + nº de biomas + nº still_life
//   /eqsmp structures full       → idem, mas lista os biomas de cada uma
//   /eqsmp structures broken      → SÓ as estruturas que NÃO têm nenhum bioma still_life
//                                   (= as que provavelmente não spawnam neste mundo)
//
// Saída vai pro console/log (eqsmp/logs/latest.log, prefixo STRUCT_AUDIT) —
// fácil de ler do host. Também manda um resumo no chat de quem rodou.

;(function () {
  var $Commands = Java.loadClass('net.minecraft.commands.Commands')
  var $StringArgumentType = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType')
  var $Registries = Java.loadClass('net.minecraft.core.registries.Registries')

  // coleta: pra cada estrutura, os biome ids aceitos
  function gather(server) {
    var access = server.registryAccess()
    var structReg = access.registryOrThrow($Registries.STRUCTURE)
    var rows = []
    structReg.entrySet().forEach(function (e) {
      var id = String(e.getKey().location())
      var struct = e.getValue()
      var biomes = []
      try {
        // Structure.biomes() → HolderSet<Biome>; itera os holders
        var hs = struct.biomes()
        hs.forEach(function (holder) {
          try { biomes.push(String(holder.unwrapKey().get().location())) }
          catch (e2) {}
        })
      } catch (e1) {}
      var sl = biomes.filter(function (b) { return b.indexOf('still_life:') === 0 }).length
      rows.push({ id: id, total: biomes.length, sl: sl, biomes: biomes })
    })
    rows.sort(function (a, b) { return a.id < b.id ? -1 : 1 })
    return rows
  }

  function run(ctx, mode) {
    var server = ctx.source.server
    var rows = gather(server)
    var broken = 0
    console.info('STRUCT_AUDIT ===== ' + rows.length + ' estruturas registradas (mode=' + mode + ') =====')
    rows.forEach(function (r) {
      var flag = (r.sl === 0) ? ' <<< SEM bioma still_life (nao spawna?)' : ''
      if (r.sl === 0) broken++
      if (mode === 'broken' && r.sl !== 0) return
      console.info('STRUCT_AUDIT ' + r.id + ' | biomas=' + r.total + ' still_life=' + r.sl + flag)
      if (mode === 'full') {
        console.info('STRUCT_AUDIT    biomas: ' + r.biomes.join(', '))
      }
    })
    console.info('STRUCT_AUDIT ===== total=' + rows.length + ' | SEM still_life=' + broken + ' =====')
    var p = ctx.source.player
    if (p) p.tell(Text.of('§6[StructAudit] §e' + rows.length + ' estruturas, §c' + broken +
      '§e sem bioma still_life. Veja o log (STRUCT_AUDIT).'))
    return 1
  }

  ServerEvents.commandRegistry(function (event) {
    event.register(
      $Commands.literal('eqsmp')
        .then($Commands.literal('structures')
          .requires(function (s) { try { return s.hasPermission(2) } catch (e) { return false } })
          .executes(function (ctx) { return run(ctx, 'summary') })
          .then($Commands.literal('full').executes(function (ctx) { return run(ctx, 'full') }))
          .then($Commands.literal('broken').executes(function (ctx) { return run(ctx, 'broken') }))
        )
    )
  })

  console.info('[structure_audit] /eqsmp structures registrado')
})()
