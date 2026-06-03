// =========================================================================
// ARS ARCHWOOD — Drops Config
// =========================================================================
// Leaves de archwood (Ars Nouveau) ganham chance de dropar livingwood_twig
// (Botania). Cross-mod synergy: archwood vira ponte pra crafting Botania.
//
// Mantém os drops vanilla intactos (sapling + sticks + leaves c/ shears) —
// 01_drops.js usa addPool sem clearPools.

;(function() {

global.ArsArchwood = {}
const AA = global.ArsArchwood

AA.leaves = [
  'ars_nouveau:red_archwood_leaves',
  'ars_nouveau:green_archwood_leaves',
  'ars_nouveau:blue_archwood_leaves',
  'ars_nouveau:purple_archwood_leaves'
]

// 2% por bloco quebrado. Em média 1 twig a cada ~50 leaves.
AA.twig_chance = 0.02
AA.twig_item   = 'botania:livingwood_twig'

})()
