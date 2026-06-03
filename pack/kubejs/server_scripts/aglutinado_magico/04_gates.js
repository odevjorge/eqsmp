// =========================================================================
// AGLUTINADO MÁGICO — Cross-mod gates (consumers)
// =========================================================================
// Receitas modificadas pra exigir Aglutinado:
//   - create:andesite_alloy        — Aglutinado destrava Create (recipe sem iron)
//   - botania:mana_pool             — 5× otherstone (Occultism gate)
//   - botania:diluted_pool          — 5× otherstone_slab (Occultism gate)
//   - occultism:book_of_binding_foliot — Aglutinado gate (Botania+Create → Occultism)
//
// Visualmente as pools aparecem como pedra preta otherstone (override em
// kubejs/assets/botania/models/block/{mana_pool,diluted_pool}.json).
//
// Sobre o gate Occultism: a entrada pro summon_foliot_* (todos os rituais
// foliot) é o `book_of_binding_bound_foliot`, criado via:
//   writable_book → spirit_fire → book_of_binding_empty
//   book_of_binding_empty + 4× dye_white → book_of_binding_foliot
//   ritual binding → book_of_binding_bound_foliot
// Gatear o STEP 2 obriga Occultism a passar por Botania+Create antes de
// summonar qualquer foliot (cleaner/crusher/lumberjack/transport).

;(function() {

ServerEvents.recipes(function(event) {
  var AG = global.AglutinadoMagico
  if (!AG) {
    console.error('[aglutinado_magico/gates] global.AglutinadoMagico não carregado')
    return
  }

  // -----------------------------------------------------------------------
  // CREATE: andesite_alloy — Aglutinado destrava Create inteiro
  // 8× andesite + 1× aglutinado → 4× andesite_alloy (zero iron)
  //
  // Remoção por ID explícito: `event.remove({output: ...})` não removia as
  // 5 receitas Create (3 shaped + 2 mixing). Mantemos `andesite_alloy_from_
  // block` pra preservar utilidade de decompact (bloco → 4 ingots).
  // -----------------------------------------------------------------------
  event.remove({ id: 'create:crafting/materials/andesite_alloy' })
  event.remove({ id: 'create:crafting/materials/andesite_alloy_from_zinc' })
  event.remove({ id: 'create:mixing/andesite_alloy' })
  event.remove({ id: 'create:mixing/andesite_alloy_from_zinc' })

  event.shaped(Item.of('create:andesite_alloy', 4), [
    'AAA',
    'AMA',
    'AAA'
  ], {
    M: AG.ITEMS.aglutinado,
    A: 'minecraft:andesite'
  })

  // -----------------------------------------------------------------------
  // BOTANIA: mana_pool — 5× otherstone (Occultism gate)
  // -----------------------------------------------------------------------
  event.remove({ type: 'minecraft:crafting_shaped', output: 'botania:mana_pool' })
  event.shaped('botania:mana_pool', [
    '   ',
    'S S',
    'SSS'
  ], {
    S: 'occultism:otherstone'
  })

  // -----------------------------------------------------------------------
  // BOTANIA: diluted_pool — 5× otherstone_slab (Occultism gate)
  // -----------------------------------------------------------------------
  event.remove({ type: 'minecraft:crafting_shaped', output: 'botania:diluted_pool' })
  event.shaped('botania:diluted_pool', [
    '   ',
    'S S',
    'SSS'
  ], {
    S: 'occultism:otherstone_slab'
  })

  // -----------------------------------------------------------------------
  // OCCULTISM: book_of_binding_foliot — Aglutinado gate
  // Remove ambas as rotas vanilla (taboo_book full e from_empty barato) e
  // substitui por receita única que exige aglutinado_magico no centro.
  // Padrão: dye white nas bordas + book_of_binding_empty + aglutinado.
  // -----------------------------------------------------------------------
  event.remove({ id: 'occultism:crafting/book_of_binding_foliot' })
  event.remove({ id: 'occultism:crafting/book_of_binding_foliot_from_empty' })

  event.shaped('occultism:book_of_binding_foliot', [
    ' W ',
    'WBA',
    ' W '
  ], {
    W: '#forge:dyes/white',
    B: 'occultism:book_of_binding_empty',
    A: AG.ITEMS.aglutinado
  }).id('kubejs:gates/book_of_binding_foliot')

  console.log('[aglutinado_magico/gates] 4 receitas modificadas (alloy + 2 pools + foliot book)')
})

})()
