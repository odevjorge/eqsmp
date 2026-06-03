// =========================================================================
// AGLUTINADO MÁGICO — Mana infusion (passo final, Botania)
// =========================================================================
// cursed_aglutinado_magico jogado na mana_pool consome 50k mana →
// aglutinado_magico. Pool gated por otherstone Occultism (ver 04_gates.js).

;(function() {

ServerEvents.recipes(function(event) {
  var AG = global.AglutinadoMagico
  if (!AG) {
    console.error('[aglutinado_magico/infusion] global.AglutinadoMagico não carregado')
    return
  }

  // event.custom() com JSON: Botania 1.20.1 quebrou DSL do KubeJS.
  // .id() explícito pra idempotência on /reload.
  event.custom({
    type: 'botania:mana_infusion',
    input: { item: AG.ITEMS.cursed },
    output: { item: AG.ITEMS.aglutinado },
    mana: AG.MANA_INFUSION_COST
  }).id('kubejs:aglutinado/mana_infusion')

  console.log('[aglutinado_magico/infusion] cursed → aglutinado registrado (' +
    AG.MANA_INFUSION_COST + ' mana)')
})

})()
