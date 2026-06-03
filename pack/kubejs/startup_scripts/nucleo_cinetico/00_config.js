// =========================================================================
// NÚCLEO CINÉTICO — Config
// =========================================================================
// Phase 2 cross-mod gate. Signature item Create — produzido pelo
// mechanical_crafter (precursor) e refinado em ritual foliot (final).
// Consumido por Botania (runic_altar) e Ars Nouveau (enchanting_apparatus).
//
// Production chain:
//   andesite_alloy (F1 gate) + brass_ingot + precision_mechanism
//     → mechanical_crafting (Create)
//     → cursed_nucleo_cinetico (intermediate)
//     → ritual craft_foliot (Occultism, book_of_binding_bound_foliot)
//       + 4 ingredient bowls (source_gem, otherstone, livingrock, precision_mechanism)
//     → nucleo_cinetico (final)
//
// Cross-mod gates desbloqueados (consumers):
//   Botania:     botania:runic_altar          (recipe override)
//   Ars Nouveau: ars_nouveau:enchanting_apparatus (recipe override, replaces diamond)

;(function() {

global.NucleoCinetico = {}
var NC = global.NucleoCinetico

NC.ITEMS = {
  nucleo: 'kubejs:nucleo_cinetico',
  cursed: 'kubejs:cursed_nucleo_cinetico'
}

NC.RITUAL_DURATION = 180  // seconds; ~3 minutos no pentacle craft_foliot

})()
