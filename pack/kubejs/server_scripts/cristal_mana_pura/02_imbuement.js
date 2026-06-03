// =========================================================================
// CRISTAL DE MANA PURA — Imbuement Chamber (Ars Nouveau, refinamento final)
// =========================================================================
// cursed_cristal_mana_pura no imbuement_chamber + 4 pedestais cobrindo os 4
// mods (Ars source_gem, Botania mana_diamond, Occultism otherstone, Create
// precision_mechanism) + 5k source → cristal_mana_pura.
//
// Schema: ars_nouveau:imbuement
//   - input: {item: ...} ou {tag: ...} — vai NO chamber
//   - output: "namespace:id" (string, não objeto)
//   - pedestalItems[]: {item: {item: ...}} ou {item: {tag: ...}} — wrapped 2x
//   - source: int — custo em source
//   - count: int — output count (default 1)
//
// Imbuement chamber aceita até 8 pedestais ao redor. 4 já cobrem nossa
// chain (1 por mod) e ainda sobra espaço pra player adicionar bonus se
// reusar este chamber pra outras recipes.

;(function() {

ServerEvents.recipes(function(event) {
  var CR = global.CristalManaPura
  if (!CR) {
    console.error('[cristal_mana_pura/imbuement] global.CristalManaPura não carregado')
    return
  }

  event.custom({
    type: 'ars_nouveau:imbuement',
    count: 1,
    input: { item: CR.ITEMS.cursed },
    output: CR.ITEMS.cristal,
    pedestalItems: [
      { item: { item: 'ars_nouveau:source_gem' } },
      { item: { tag: 'botania:mana_diamonds' } },
      { item: { item: 'occultism:otherstone' } },
      { item: { item: 'create:precision_mechanism' } }
    ],
    source: CR.IMBUEMENT_SOURCE_COST
  }).id('kubejs:cristal_mana_pura/imbuement')

  console.log('[cristal_mana_pura/imbuement] cristal registrado (' +
    CR.IMBUEMENT_SOURCE_COST + ' source)')
})

})()
