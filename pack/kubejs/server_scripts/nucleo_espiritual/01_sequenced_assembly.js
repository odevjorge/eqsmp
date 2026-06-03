// =========================================================================
// NÚCLEO ESPIRITUAL — Sequenced Assembly (Create depot)
// =========================================================================
// occultism:soul_gem entra no mechanical depot. Sequence consome 1× de cada
// signature das fases anteriores via Mechanical Deployer:
//   Step 1: deploy kubejs:aglutinado_magico   (F1 substrate mágico)
//   Step 2: deploy kubejs:nucleo_cinetico     (F2 kinetic energy)
//   Step 3: deploy kubejs:cristal_mana_pura   (F3 mana purification)
// 1 loop = 3 deploys total. Transitional item cursed_nucleo_espiritual aparece
// no depot durante o processo. Output guaranteed: nucleo_espiritual.
//
// Schema: create:sequenced_assembly
//   - ingredient: input no depot
//   - transitionalItem: item mostrado durante processamento (= nosso cursed)
//   - loops: vezes que a sequence inteira repete (1 = single pass)
//   - sequence[]: cada step é uma recipe Create normal (deploying/pressing/etc)
//   - results[]: outputs com chance (>=1.0 = guaranteed)

;(function() {

ServerEvents.recipes(function(event) {
  var NE = global.NucleoEspiritual
  if (!NE) {
    console.error('[nucleo_espiritual/assembly] global.NucleoEspiritual não carregado')
    return
  }

  event.custom({
    type: 'create:sequenced_assembly',
    ingredient: { item: 'occultism:soul_gem' },
    transitionalItem: { item: NE.ITEMS.cursed },
    loops: 1,
    sequence: [
      {
        type: 'create:deploying',
        ingredients: [
          { item: NE.ITEMS.cursed },
          { item: 'kubejs:aglutinado_magico' }
        ],
        results: [ { item: NE.ITEMS.cursed } ]
      },
      {
        type: 'create:deploying',
        ingredients: [
          { item: NE.ITEMS.cursed },
          { item: 'kubejs:nucleo_cinetico' }
        ],
        results: [ { item: NE.ITEMS.cursed } ]
      },
      {
        type: 'create:deploying',
        ingredients: [
          { item: NE.ITEMS.cursed },
          { item: 'kubejs:cristal_mana_pura' }
        ],
        results: [ { item: NE.ITEMS.cursed } ]
      }
    ],
    results: [
      { item: NE.ITEMS.nucleo, chance: 100.0 }
    ]
  }).id('kubejs:nucleo_espiritual/sequenced_assembly')

  console.log('[nucleo_espiritual/assembly] sequenced_assembly registrado (soul_gem → nucleo_espiritual)')
})

})()
