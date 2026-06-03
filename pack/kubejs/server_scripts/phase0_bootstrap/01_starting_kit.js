// =========================================================================
// PHASE 0 BOOTSTRAP — (placeholder reservado pra hooks futuros)
// =========================================================================
// Auto-give on first join FOI REMOVIDO em 2026-05-24. Multiplayer com
// especialização: cada player pega kit via comando `/eqsmp kit <mod>`.
//
// Lógica de comando está em 03_kit_command.js.
//
// Esse arquivo permanece como anchor pra hooks PlayerEvents futuros
// (ex: greeting message on first join, link pro comando).

;(function() {

PlayerEvents.loggedIn(function(event) {
  var P0 = global.Phase0Bootstrap
  if (!P0) return
  var player = event.player
  if (!player) return

  // Greeting message — só na primeira entrada (independente de kit claimed)
  var pdata = player.persistentData
  if (pdata.getBoolean('eqsmp_welcome_shown')) return
  pdata.putBoolean('eqsmp_welcome_shown', true)

  player.tell(Text.of('§6[EQSMP] §eBem-vindo! Use §a/eqsmp kit <botania|create|occultism|ars>§e pra pegar o kit do seu mod de especialização.'))
})

})()
