// =========================================================================
// PHASE 0 BOOTSTRAP — /eqsmp kit <mod> command
// =========================================================================
// Registra comando KubeJS:
//   /eqsmp kit list                 → lista kits disponíveis
//   /eqsmp kit <botania|create|occultism|ars>  → entrega kit do mod
//
// Side-effect na PRIMEIRA execução por player: grant stage eqsmp_phase0
// (NBT flag P0.STAGE_FLAG marca que já recebeu).

;(function() {

var $StringArgumentType = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType')
var $Commands = Java.loadClass('net.minecraft.commands.Commands')

ServerEvents.commandRegistry(function(event) {
  var P0 = global.Phase0Bootstrap
  if (!P0) {
    console.error('[phase0_bootstrap/kit_command] global.Phase0Bootstrap não carregado')
    return
  }

  // Construtor do nó <mod> com sugestões
  function modArgument() {
    return $Commands.argument('mod', $StringArgumentType.word())
      .suggests(function(ctx, builder) {
        P0.KIT_NAMES.forEach(function(name) { builder.suggest(name) })
        return builder.buildFuture()
      })
      .executes(function(ctx) {
        var modName = $StringArgumentType.getString(ctx, 'mod')
        var player = ctx.source.player
        if (!player) {
          ctx.source.sendFailure(Text.of('Comando só pode ser usado por player'))
          return 0
        }
        return giveKit(player, modName)
      })
  }

  event.register(
    $Commands.literal('eqsmp')
      .then($Commands.literal('kit')
        .then($Commands.literal('list')
          .executes(function(ctx) {
            var p = ctx.source.player
            if (!p) return 0
            p.tell(Text.of('§6[EQSMP] Kits disponíveis:'))
            P0.KIT_NAMES.forEach(function(name) {
              var items = P0.KITS[name].map(function(e) { return e.id }).join(', ')
              p.tell(Text.of('  §a' + name + '§7 — ' + items))
            })
            return 1
          })
        )
        .then(modArgument())
      )
  )

  console.log('[phase0_bootstrap/kit_command] /eqsmp kit registered')
})

function giveKit(player, modName) {
  var P0 = global.Phase0Bootstrap
  if (!P0.KITS[modName]) {
    player.tell(Text.of('§c[EQSMP] Kit desconhecido: ' + modName + '. Use /eqsmp kit list.'))
    return 0
  }

  // UMA VEZ SÓ: 1 kit no total por player. Flag persistente eqsmp_kit_claimed.
  var pdata = player.persistentData
  if (pdata.getBoolean('eqsmp_kit_claimed')) {
    player.tell(Text.of('§c[EQSMP] §eVocê já resgatou seu kit. É apenas um por jogador.'))
    return 0
  }

  // Grant items: BASE (entregue em todo kit) + específicos do mod.
  // NBT vai como 2º arg de Item.of (id, nbtString) — concatenar id+nbt quebra
  // (Item.of(id,count) trata o 1º arg como ResourceLocation pura).
  var items = (P0.BASE || []).concat(P0.KITS[modName])
  items.forEach(function(entry) {
    try {
      var stack = entry.nbt ? Item.of(entry.id, entry.nbt) : Item.of(entry.id, entry.count)
      if (entry.nbt && entry.count && entry.count > 1) stack.setCount(entry.count)
      player.give(stack)
    } catch (e) {
      console.error('[phase0_bootstrap/kit_command] erro entregando ' + entry.id + ': ' + e)
    }
  })

  // Marca como resgatado (trava o "uma vez só") — após a entrega bem-sucedida.
  pdata.putBoolean('eqsmp_kit_claimed', true)

  // First-time bonus: stage eqsmp_phase0 (destrava SG copper)
  if (!pdata.getBoolean(P0.STAGE_FLAG)) {
    try {
      player.server.runCommandSilent('gamestage add ' + player.username + ' eqsmp_phase0 true')
      pdata.putBoolean(P0.STAGE_FLAG, true)
      player.tell(Text.of('§6[EQSMP] §aFerramentas de cobre Silent Gear destravadas!'))
    } catch (e) {
      console.error('[phase0_bootstrap/kit_command] erro grant stage: ' + e)
    }
  }

  player.tell(Text.of('§6[EQSMP] §eKit §a' + P0.MOD_LABELS[modName] + '§e entregue.'))
  console.info('[phase0_bootstrap] kit ' + modName + ' entregue pra ' + player.username)
  return 1
}

})()
