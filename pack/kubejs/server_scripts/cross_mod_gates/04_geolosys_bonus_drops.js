// =========================================================================
// CROSS-MOD GATES — Geolosys → Alltheores exclusives (bonus drops)
// =========================================================================
// Mineralogia real:
//   Iridium + Osmium → grupo da platina; ocorrem em depósitos placer e
//                      ultramaficos junto com platinum
//   Ruby + Sapphire  → variedades de corundum; em pipes kimberlíticos
//                      (com diamond) e zonas hidrotermais (cinnabar)
//   Peridot          → silicato magmatic, share alkaline igneous setting
//                      com beryl
//   Emerald          → variedade de beryl

;(function() {

// Bonus drops por ore Geolosys: chance + item
const BONUS = {
  'geolosys:platinum_ore': [
    { chance: 0.05, item: 'alltheores:raw_iridium' },
    { chance: 0.05, item: 'alltheores:raw_osmium' },
  ],
  'geolosys:deepslate_platinum_ore': [
    { chance: 0.08, item: 'alltheores:raw_iridium' },
    { chance: 0.08, item: 'alltheores:raw_osmium' },
  ],
  'geolosys:kimberlite_ore': [
    { chance: 0.04, item: 'alltheores:ruby' },
    { chance: 0.04, item: 'alltheores:sapphire' },
  ],
  'geolosys:deepslate_kimberlite_ore': [
    { chance: 0.06, item: 'alltheores:ruby' },
    { chance: 0.06, item: 'alltheores:sapphire' },
  ],
  'geolosys:beryl_ore': [
    { chance: 0.05, item: 'alltheores:peridot' },
    { chance: 0.02, item: 'minecraft:emerald' },
  ],
  'geolosys:deepslate_beryl_ore': [
    { chance: 0.08, item: 'alltheores:peridot' },
    { chance: 0.03, item: 'minecraft:emerald' },
  ],
  'geolosys:cinnabar_ore': [
    { chance: 0.03, item: 'alltheores:ruby' },
    { chance: 0.03, item: 'alltheores:sapphire' },
  ],
  'geolosys:deepslate_cinnabar_ore': [
    { chance: 0.05, item: 'alltheores:ruby' },
    { chance: 0.05, item: 'alltheores:sapphire' },
  ],
}

ServerEvents.blockLootTables(function(event) {
  let count = 0
  Object.keys(BONUS).forEach(function(blockId) {
    const drops = BONUS[blockId]
    event.modifyBlock(blockId, function(table) {
      drops.forEach(function(drop) {
        table.addPool(function(pool) {
          pool.rolls = 1
          pool.addCondition({
            condition: 'minecraft:random_chance',
            chance: drop.chance,
          })
          pool.addItem(drop.item)
        })
      })
    })
    count++
  })
  console.log('[cross_mod_gates/geolosys_bonus_drops] augmented ' + count + ' Geolosys ore tables with alltheores bonus drops')
})

})()
