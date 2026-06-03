// =========================================================================
// CRISTAL DE MANA PURA — Item registry
// =========================================================================
// Registra:
//   - kubejs:cristal_mana_pura          (item final, glow, gate item F3)
//   - kubejs:cursed_cristal_mana_pura   (intermediate, output do runic_altar)

;(function() {

StartupEvents.registry('item', function(event) {
  var CR = global.CristalManaPura
  if (!CR) {
    console.error('[cristal_mana_pura/items] global.CristalManaPura não carregado')
    return
  }

  event.create('cristal_mana_pura')
    .displayName('Cristal de Mana Pura')
    .texture('kubejs:item/cristal_mana_pura')
    .maxStackSize(64)
    .glow(true)

  event.create('cursed_cristal_mana_pura')
    .displayName('Cristal de Mana Pura Amaldiçoado')
    .texture('kubejs:item/cristal_mana_pura')
    .maxStackSize(64)
})

})()
