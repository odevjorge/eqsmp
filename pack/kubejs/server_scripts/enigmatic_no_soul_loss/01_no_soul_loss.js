// =========================================================================
// ENIGMATIC LEGACY — desliga SÓ a perda de vida do Ring of Seven Curses
// =========================================================================
// O Ring of the Seven Curses (e o modo Soul Crystal) reduz a vida máxima em
// -10% por fragmento de alma perdido a cada morte. Isso é implementado por:
//   - contador persistente   : PlayerPersisted -> "enigmaticlegacy.lostsoulfragments" (int)
//   - AttributeModifier       : "Lost Soul Health Modifier" no generic.max_health
//                               UUID 66a2aa2d-7e3c-4af4-882f-bd2b2ded8e7b (MULTIPLY_TOTAL)
// Não existe toggle de config só pra isso, então neutralizamos: zeramos o
// contador e removemos o modifier. TODAS as OUTRAS maldições do anel continuam
// ativas (debuff de armadura, mobs neutros hostis, dano dobrado, insônia, etc).
// =========================================================================

;(function () {
  var FRAG_KEY = 'enigmaticlegacy.lostsoulfragments'
  var SUBTAG = 'PlayerPersisted'
  var checkEvery = 40 // ticks (~2s)

  function clearSoulLoss(player) {
    try {
      var $UUID = Java.loadClass('java.util.UUID')
      var $Attributes = Java.loadClass('net.minecraft.world.entity.ai.attributes.Attributes')
      var uuid = $UUID.fromString('66a2aa2d-7e3c-4af4-882f-bd2b2ded8e7b')

      // 1) zera o contador de fragmentos perdidos (ForgeData -> PlayerPersisted)
      var pd = player.persistentData
      if (pd) {
        var pp = pd.contains(SUBTAG) ? pd.getCompound(SUBTAG) : null
        if (pp && pp.contains(FRAG_KEY) && pp.getInt(FRAG_KEY) !== 0) {
          pp.putInt(FRAG_KEY, 0)
          pd.put(SUBTAG, pp)
        }
      }

      // 2) remove o "Lost Soul Health Modifier" do max_health
      var inst = player.getAttribute($Attributes.MAX_HEALTH)
      if (inst && inst.getModifier(uuid) !== null) {
        inst.removeModifier(uuid)
        // recupera a vida cheia já que o teto voltou ao normal
        try { player.setHealth(player.getMaxHealth()) } catch (e2) {}
      }
    } catch (e) {
      console.warn('[NoSoulLoss] erro ao limpar perda de alma: ' + e)
    }
  }

  // varre periodicamente — barato (poucos players) e imune à ordem dos handlers
  // do mod no respawn (o mod aplica o modifier no respawn; nós tiramos logo após)
  ServerEvents.tick(function (event) {
    var server = event.server
    if (server.tickCount % checkEvery !== 0) return
    var players = server.players
    if (!players) return
    players.forEach(function (p) { clearSoulLoss(p) })
  })

  // limpeza imediata em eventos-chave
  PlayerEvents.respawned(function (event) { clearSoulLoss(event.player) })
  PlayerEvents.loggedIn(function (event) { clearSoulLoss(event.player) })

  console.info('[NoSoulLoss] ativo — perda de vida do Ring of Seven Curses neutralizada (demais maldicoes intactas)')
})()
