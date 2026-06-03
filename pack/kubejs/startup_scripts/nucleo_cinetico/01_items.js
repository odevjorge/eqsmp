// =========================================================================
// NÚCLEO CINÉTICO — Item registry
// =========================================================================
// Registra:
//   - kubejs:nucleo_cinetico         (item final, glow, gate item F2)
//   - kubejs:cursed_nucleo_cinetico  (intermediate, output do mechanical_crafter)
//
// Cursed reusa textura do nucleo (player só vê brevemente antes do ritual;
// trocar pra textura própria depois se quiser).

;(function() {

StartupEvents.registry('item', function(event) {
  var NC = global.NucleoCinetico
  if (!NC) {
    console.error('[nucleo_cinetico/items] global.NucleoCinetico não carregado')
    return
  }

  event.create('nucleo_cinetico')
    .displayName('Núcleo Cinético')
    .texture('kubejs:item/nucleo_cinetico')
    .maxStackSize(64)
    .glow(true)

  event.create('cursed_nucleo_cinetico')
    .displayName('Núcleo Cinético Amaldiçoado')
    .texture('kubejs:item/nucleo_cinetico')
    .maxStackSize(64)
})

})()
