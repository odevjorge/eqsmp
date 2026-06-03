// =========================================================================
// CROSS-MOD GATES — Wood overhaul
// =========================================================================
// Força recipes a usar twigs mágicos (Botania / Ars / Occultism) em vez de
// stick vanilla. Player escolhe qual twig usar via tag agregadora.

// Tag agregadora — twigs equivalentes (Botania só, Ars/Occultism só têm
// "rods" que são tools acabadas, não materials de craft)
ServerEvents.tags('item', event => {
  event.add('kubejs:magic_twigs', [
    'botania:livingwood_twig',
    'botania:dreamwood_twig',
  ])
})

ServerEvents.recipes(event => {
  // Substitui stick literal por #kubejs:magic_twigs em TODAS as recipes que
  // tinham stick como input direto. Recipes que usam tag #forge:rods/wooden
  // não são afetadas (continuam aceitando stick vanilla).
  event.replaceInput(
    { input: 'minecraft:stick' },
    'minecraft:stick',
    '#kubejs:magic_twigs'
  )
  console.log('[cross_mod_gates/wood_overhaul] minecraft:stick → #kubejs:magic_twigs')
})
