// =========================================================================
// PEDRA FILOSOFAL — Ritual Djinni (Occultism, recipe absoluta)
// =========================================================================
// Pentacle craft_djinni (F3-gated via book_of_binding_djinni que exige
// cristal_mana_pura) + bound_djinni binding + 10 minutos de ritual.
//
// Ingredientes (5 bowls de prata no 8×8 ao redor do pentacle):
//   1× kubejs:nucleo_espiritual   (F4 — coroa que unifica F1-F3 internamente)
//   1× kubejs:aglutinado_magico   (F1 — substrato mágico)
//   1× kubejs:nucleo_cinetico     (F2 — núcleo cinético Create)
//   1× kubejs:cristal_mana_pura   (F3 — pureza mágica Botania/Ars)
//   1× minecraft:nether_star      (essência divina — extraída do Wither)
//
// Custo total agregado: derrotar Wither + completar todas 4 fases. Single
// pedra_filosofal por server-week típico.

;(function() {

ServerEvents.recipes(function(event) {
  var PF = global.PedraFilosofal
  if (!PF) {
    console.error('[pedra_filosofal/ritual] global.PedraFilosofal não carregado')
    return
  }

  event.custom({
    type: 'occultism:ritual',
    ritual_type: 'occultism:craft',
    activation_item: { item: 'occultism:book_of_binding_bound_djinni' },
    pentacle_id: 'occultism:craft_djinni',
    duration: PF.RITUAL_DURATION,
    ritual_dummy: { item: PF.ITEMS.pedra },
    ingredients: [
      { item: 'kubejs:nucleo_espiritual' },
      { item: 'kubejs:aglutinado_magico' },
      { item: 'kubejs:nucleo_cinetico' },
      { item: 'kubejs:cristal_mana_pura' },
      { item: 'minecraft:nether_star' }
    ],
    result: { item: PF.ITEMS.pedra }
  }).id('kubejs:pedra_filosofal/ritual_djinni')

  console.log('[pedra_filosofal/ritual] djinni ritual registrado (' +
    PF.RITUAL_DURATION + 's)')
})

})()
