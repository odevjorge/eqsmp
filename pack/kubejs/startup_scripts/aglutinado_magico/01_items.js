// =========================================================================
// AGLUTINADO MÁGICO — Item registry
// =========================================================================
// Registra:
//   - kubejs:aglutinado_magico           (item final, drop final da chain)
//   - kubejs:cursed_aglutinado_magico    (intermediate, antes da mana_infusion)
//   - kubejs:sourceberry_sack_x1..x9     (compactação X9)
//
// Cursed reusa textura do aglutinado (player só vê brevemente antes do
// infusion; trocar pra textura própria depois se quiser).

;(function() {

StartupEvents.registry('item', function(event) {
  var AG = global.AglutinadoMagico
  if (!AG) {
    console.error('[aglutinado_magico/items] global.AglutinadoMagico não carregado')
    return
  }

  event.create('aglutinado_magico')
    .displayName('Aglutinado Mágico')
    .texture('kubejs:item/aglutinado_magico')
    .maxStackSize(64)
    .glow(true)

  event.create('cursed_aglutinado_magico')
    .displayName('Aglutinado Mágico Amaldiçoado')
    .texture('kubejs:item/aglutinado_magico')
    .maxStackSize(64)

  function registerSack(level) {
    event.create('sourceberry_sack_x' + level)
      .displayName('Saco de Sourceberry x' + level)
      .parentModel(AG.SACK_PARENT_MODEL)
      .maxStackSize(64)
  }

  for (var level = 1; level <= AG.COMPACT_LEVELS; level++) {
    registerSack(level)
  }
})

})()
