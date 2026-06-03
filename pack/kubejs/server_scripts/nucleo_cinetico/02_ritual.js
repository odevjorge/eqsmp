// =========================================================================
// NÚCLEO CINÉTICO — Foliot Ritual (Occultism, refinamento final)
// =========================================================================
// Pentacle craft_foliot + book_of_binding_bound_foliot ativam ritual de
// 180s que consome cursed_nucleo_cinetico (precursor) + 4 ingredientes
// (um por mod principal) e produz nucleo_cinetico.
//
// Pentacle craft_foliot requer giz branco + sacrificial bowl. Player tem
// que ter feito F1 pra ter o book_of_binding_foliot (gated por aglutinado)
// e bindar um foliot via ritual binding pra ter o bound version.
//
// Ingredients vão em bowls de prata no 8×8 ao redor do pentacle. Os 5
// ingredientes cobrem todos os 4 mods principais:
//   - cursed_nucleo_cinetico  (precursor, Create+F1)
//   - source_gem               (Ars Nouveau)
//   - otherstone               (Occultism)
//   - livingrock               (Botania — pré-runic_altar)
//   - precision_mechanism      (Create, refinamento extra)

;(function() {

ServerEvents.recipes(function(event) {
  var NC = global.NucleoCinetico
  if (!NC) {
    console.error('[nucleo_cinetico/ritual] global.NucleoCinetico não carregado')
    return
  }

  event.custom({
    type: 'occultism:ritual',
    ritual_type: 'occultism:craft',
    activation_item: { item: 'occultism:book_of_binding_bound_foliot' },
    pentacle_id: 'occultism:craft_foliot',
    duration: NC.RITUAL_DURATION,
    ritual_dummy: { item: NC.ITEMS.nucleo },
    ingredients: [
      { item: NC.ITEMS.cursed },
      { item: 'ars_nouveau:source_gem' },
      { item: 'occultism:otherstone' },
      { item: 'botania:livingrock' },
      { item: 'create:precision_mechanism' }
    ],
    result: { item: NC.ITEMS.nucleo }
  }).id('kubejs:nucleo_cinetico/ritual_foliot')

  console.log('[nucleo_cinetico/ritual] foliot ritual registrado (' +
    NC.RITUAL_DURATION + 's)')
})

})()
