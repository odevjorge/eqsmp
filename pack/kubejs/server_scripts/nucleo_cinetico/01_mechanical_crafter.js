// =========================================================================
// NÚCLEO CINÉTICO — Mechanical Crafter (Create, precursor)
// =========================================================================
// brass + andesite_alloy + precision_mechanism arranjados num mechanical_
// crafter 3×3 produzem 1× cursed_nucleo_cinetico. Como andesite_alloy é
// F1-gated (precisa de aglutinado_magico), F2 herda F1 transitivamente.
//
// Schema: create:mechanical_crafting (5×5 max pattern, igual shaped recipe
// vanilla mas processado pelo mechanical_crafter; aceita até 9 receitas
// concatenadas via crafters em grid).

;(function() {

ServerEvents.recipes(function(event) {
  var NC = global.NucleoCinetico
  if (!NC) {
    console.error('[nucleo_cinetico/mechanical_crafter] global.NucleoCinetico não carregado')
    return
  }

  // .id() explícito pra idempotência on /reload.
  event.custom({
    type: 'create:mechanical_crafting',
    acceptMirrored: false,
    key: {
      B: { tag: 'forge:ingots/brass' },
      A: { item: 'create:andesite_alloy' },
      P: { item: 'create:precision_mechanism' }
    },
    pattern: [
      'BAB',
      'APA',
      'BAB'
    ],
    result: { item: NC.ITEMS.cursed, count: 1 }
  }).id('kubejs:nucleo_cinetico/mechanical_crafting')

  console.log('[nucleo_cinetico/mechanical_crafter] cursed registrado')
})

})()
