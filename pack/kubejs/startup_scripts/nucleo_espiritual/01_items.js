// =========================================================================
// NÚCLEO ESPIRITUAL — Item registry
// =========================================================================
// Registra:
//   - kubejs:nucleo_espiritual         (item final, glow, gate item F4)
//   - kubejs:cursed_nucleo_espiritual  (transitionalItem do sequenced_assembly;
//                                       só existe no depot durante processo)

;(function() {

StartupEvents.registry('item', function(event) {
  var NE = global.NucleoEspiritual
  if (!NE) {
    console.error('[nucleo_espiritual/items] global.NucleoEspiritual não carregado')
    return
  }

  event.create('nucleo_espiritual')
    .displayName('Núcleo Espiritual')
    .texture('kubejs:item/nucleo_espiritual')
    .maxStackSize(64)
    .glow(true)

  event.create('cursed_nucleo_espiritual')
    .displayName('Núcleo Espiritual Amaldiçoado')
    .texture('kubejs:item/nucleo_espiritual')
    .maxStackSize(64)
})

})()
