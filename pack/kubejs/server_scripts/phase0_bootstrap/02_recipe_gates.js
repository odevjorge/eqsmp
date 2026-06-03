// =========================================================================
// PHASE 0 BOOTSTRAP — Recipe gates (manasteel → unlock)
// =========================================================================
// novice_spell_book vanilla recipe = parchment + lapis (trivial early game).
// Phase 0 design: livro encadernado nas 4 ferramentas manasteel — o player
// precisa ter completado o tier manasteel inteiro antes de virar Arcanista.

;(function() {

ServerEvents.recipes(function(event) {
  // novice_spell_book gate — book + 4 tools manasteel + 4 ingots
  event.remove({ id: 'ars_nouveau:novice_spell_book' })
  event.remove({ id: 'ars_nouveau:dye_novice_spell_book' })
  event.shaped('ars_nouveau:novice_spell_book', [
    'PMA',
    'MBM',
    'SMH'
  ], {
    P: 'botania:manasteel_pick',
    A: 'botania:manasteel_axe',
    S: 'botania:manasteel_sword',
    H: 'botania:manasteel_hoe',
    M: 'botania:manasteel_ingot',
    B: 'minecraft:book'
  }).id('kubejs:phase0/novice_spell_book')

  console.log('[phase0_bootstrap/recipe_gates] novice_spell_book gated por book + 4 ferramentas manasteel')
})

})()
