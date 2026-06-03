// =========================================================================
// ARS ARCHWOOD — Loot Table Augment
// =========================================================================
// Adiciona pool de chance pra livingwood_twig nas 4 leaves archwood.
// Usa ServerEvents.blockLootTables (não LootJS — removido) com addPool sem
// clearPools, então os drops originais (sapling, sticks, leaves) ficam.

;(function() {

const AA = global.ArsArchwood

ServerEvents.blockLootTables(function(event) {
  if (!AA || !AA.leaves) {
    console.error('[ars_archwood] global.ArsArchwood não carregado')
    return
  }

  AA.leaves.forEach(function(leafId) {
    event.modifyBlock(leafId, function(table) {
      table.addPool(function(pool) {
        pool.rolls = 1
        pool.addCondition({
          condition: 'minecraft:random_chance',
          chance: AA.twig_chance
        })
        pool.addItem(AA.twig_item)
      })
    })
  })

  console.log('[ars_archwood] augmented ' + AA.leaves.length + ' archwood leaf tables')
})

})()
