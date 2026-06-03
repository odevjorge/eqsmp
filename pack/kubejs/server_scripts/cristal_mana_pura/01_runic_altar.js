// =========================================================================
// CRISTAL DE MANA PURA — Runic Altar (Botania, precursor)
// =========================================================================
// mana_pearl + mana_diamond + nucleo_cinetico (F2 link explícito) + extras
// processados em runic_altar (bloco gated por F2) → cursed_cristal_mana_pura.
//
// O runic_altar é o "spell-binding altar" de Botania. Tematicamente, ele
// "amarra" os 3 cristais (pearl, diamond, núcleo cinético) num cristal único
// mas instável (cursed). A purificação final fica pro imbuement_chamber.
//
// Schema: botania:runic_altar — ingredients[] no altar + mana cost.
// Risco: Botania pode rejeitar silently se o output for BlockItem (ver
// feedback_botania_apothecary_blockitem). Como kubejs:cursed_cristal_mana_pura
// é Item puro (não BlockItem), deve passar.

;(function() {

ServerEvents.recipes(function(event) {
  var CR = global.CristalManaPura
  if (!CR) {
    console.error('[cristal_mana_pura/runic_altar] global.CristalManaPura não carregado')
    return
  }

  event.custom({
    type: 'botania:runic_altar',
    ingredients: [
      { item: 'botania:mana_pearl' },
      { tag: 'botania:mana_diamonds' },
      { item: 'kubejs:nucleo_cinetico' },
      { tag: 'botania:manasteel_ingots' },
      { tag: 'botania:manasteel_ingots' }
    ],
    mana: CR.RUNIC_MANA_COST,
    output: { item: CR.ITEMS.cursed }
  }).id('kubejs:cristal_mana_pura/runic_altar')

  console.log('[cristal_mana_pura/runic_altar] cursed registrado (' +
    CR.RUNIC_MANA_COST + ' mana)')
})

})()
