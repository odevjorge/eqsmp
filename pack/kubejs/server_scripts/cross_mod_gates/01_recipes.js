// =========================================================================
// CROSS-MOD GATES — Recipes
// =========================================================================
// Recipes que forçam interdependência entre Create, Botania, Ars Nouveau,
// Occultism e vanilla. Cada modificação adiciona um item de outro mod no
// crafting, criando gates cross-mod sem deadlock.
//
// IMPORTANTE: Create e Botania DSL estão quebradas em 1.20.1 (Create 6.x +
// Botania 1.20.1). Usar event.custom() com JSON puro pra esses tipos.
//
// Gates implementados (14 recipes + 1 loot kill já feito em data/occultism/):
//   #1  create:goggles            ← mana_pane + string + leather
//   #2  ars_nouveau:dominion_wand ← livingwood_twig + source_gem + gold
//   #3  minecraft:amethyst_block  ← 8 shards + 1 aglutinado_magico
//   #4  occultism:spirit_attuned_crystal ← spirit_fire de amethyst_block
//   #6  liquidars:source_fluid    ← Create mixing water + sourceberry_bush
//   #9  occultism:dictionary_of_spirits  ← REMOVIDO (deadlock — guide book early)
//   #10 botania:mana_pylon        ← + source_gem (via runic_altar)
//   #11 ars_nouveau:source_jar    ← + mana_pearl
//   #12 create:precision_mechanism ← + source_gem (mechanical_crafting)
//   #13 occultism:spirit_lantern  ← + manasteel_ingot
//   #14 minecraft:beacon          ← + cristal_mana_pura
//   #15 ars_nouveau:imbuement_chamber ← + livingwood
//   #16 botania:runes (4 elem)    ← cada uma + cristal_mana_pura
//   #19 kubejs:mana_pane          ← Create compacting glass + source_fluid
//   #20 occultism:spirit_attuned_gem ← amethyst_shard via spirit_fire (era diamond)
//   #21 ars_nouveau:source_gem    ← mana_diamond via spirit_fire (era lapis/amethyst no chamber)
//                                   Remove imbuement_lapis + imbuement_amethyst.

ServerEvents.recipes(event => {

  // -----------------------------------------------------------------------
  // #19 kubejs:mana_pane — Create compacting (pré-req do #1)
  // -----------------------------------------------------------------------
  event.custom({
    type: 'create:compacting',
    ingredients: [
      { item: 'minecraft:glass' },
      { fluid: 'liquidars:source_fluid', amount: 1000 }
    ],
    results: [{ item: 'kubejs:mana_pane' }],
    heatRequirement: 'heated'
  }).id('kubejs:cross_mod/mana_pane')

  // -----------------------------------------------------------------------
  // #1 create:goggles — gate Create via mana_pane (Botania+Ars)
  // -----------------------------------------------------------------------
  event.remove({ id: 'create:crafting/kinetics/goggles' })
  event.shaped('create:goggles', [
    ' S ',
    'PCP'
  ], {
    S: 'minecraft:string',
    P: 'kubejs:mana_pane',
    C: 'minecraft:leather'
  }).id('kubejs:cross_mod/goggles')

  // -----------------------------------------------------------------------
  // #2 ars_nouveau:dominion_wand — gate Ars via livingwood (Botania)
  // -----------------------------------------------------------------------
  event.remove({ id: 'ars_nouveau:dominion_wand' })
  event.shaped('ars_nouveau:dominion_wand', [
    ' S ',
    ' WS',
    'G  '
  ], {
    G: 'minecraft:gold_ingot',
    S: 'ars_nouveau:source_gem',
    W: 'botania:livingwood_twig'
  }).id('kubejs:cross_mod/dominion_wand')

  // -----------------------------------------------------------------------
  // #3 minecraft:amethyst_block — gate Vanilla via aglutinado (F1)
  // -----------------------------------------------------------------------
  event.remove({ id: 'minecraft:amethyst_block' })
  event.shaped('minecraft:amethyst_block', [
    'AAA',
    'AMA',
    'AAA'
  ], {
    A: 'minecraft:amethyst_shard',
    M: 'kubejs:aglutinado_magico'
  }).id('kubejs:cross_mod/amethyst_block')

  // -----------------------------------------------------------------------
  // #4 occultism:spirit_attuned_crystal — spirit_fire de amethyst_block
  // -----------------------------------------------------------------------
  event.remove({ id: 'occultism:crafting/spirit_attuned_crystal' })
  event.custom({
    type: 'occultism:spirit_fire',
    ingredient: { item: 'minecraft:amethyst_block' },
    result: { item: 'occultism:spirit_attuned_crystal' }
  }).id('kubejs:cross_mod/spirit_attuned_crystal')

  // -----------------------------------------------------------------------
  // #6 liquidars:source_fluid — fonte alternativa via Create mixing
  // -----------------------------------------------------------------------
  event.custom({
    type: 'create:mixing',
    ingredients: [
      { fluid: 'minecraft:water', amount: 1000 },
      { item: 'ars_nouveau:sourceberry_bush', count: 64 }
    ],
    results: [{ fluid: 'liquidars:source_fluid', amount: 250 }]
  }).id('kubejs:cross_mod/source_fluid_mixing')

  // -----------------------------------------------------------------------
  // #9 occultism:dictionary_of_spirits — REVERTIDO (deadlock potencial: o
  // dictionary é o guide book; sem ele o player não aprende rituals → não
  // faz otherstone → não faz mana_pool → não faz manasteel → não consegue
  // o dictionary novo. Mantemos a recipe vanilla.)
  // -----------------------------------------------------------------------

  // -----------------------------------------------------------------------
  // #10 botania:mana_pylon — adicionar source_gem via runic_altar
  // -----------------------------------------------------------------------
  event.remove({ id: 'botania:mana_pylon' })
  event.custom({
    type: 'botania:runic_altar',
    ingredients: [
      { tag: 'forge:gems/manasteel' },
      { item: 'botania:mana_diamond' },
      { item: 'ars_nouveau:source_gem' },
      { tag: 'botania:mana_pearls' },
      { item: 'minecraft:glowstone_dust' }
    ],
    output: { item: 'botania:mana_pylon' },
    mana: 8000
  }).id('kubejs:cross_mod/mana_pylon')

  // -----------------------------------------------------------------------
  // #11 ars_nouveau:source_jar — adicionar mana_pearl (Botania)
  // -----------------------------------------------------------------------
  event.remove({ id: 'ars_nouveau:source_jar' })
  event.shaped('ars_nouveau:source_jar', [
    'GMG',
    'GPG',
    'GSG'
  ], {
    G: 'minecraft:glass',
    M: 'botania:mana_pearl',
    P: 'ars_nouveau:source_gem',
    S: 'ars_nouveau:archwood_planks'
  }).id('kubejs:cross_mod/source_jar')

  // -----------------------------------------------------------------------
  // #12 create:precision_mechanism — adicionar source_gem via mech_crafting
  // -----------------------------------------------------------------------
  event.remove({ id: 'create:sequenced_assembly/precision_mechanism' })
  event.custom({
    type: 'create:mechanical_crafting',
    pattern: [
      ' CG',
      'CSC',
      'GC '
    ],
    key: {
      C: { item: 'create:cogwheel' },
      G: { item: 'create:golden_sheet' },
      S: { item: 'ars_nouveau:source_gem' }
    },
    result: { item: 'create:precision_mechanism' }
  }).id('kubejs:cross_mod/precision_mechanism')

  // -----------------------------------------------------------------------
  // #13 occultism:spirit_lantern — adicionar manasteel
  // -----------------------------------------------------------------------
  event.remove({ id: 'occultism:crafting/spirit_lantern' })
  event.shaped('occultism:spirit_lantern', [
    'III',
    'IGI',
    'MMM'
  ], {
    I: 'minecraft:iron_nugget',
    G: 'occultism:spirit_attuned_gem',
    M: 'botania:manasteel_ingot'
  }).id('kubejs:cross_mod/spirit_lantern')

  // -----------------------------------------------------------------------
  // #14 minecraft:beacon — adicionar cristal_mana_pura (F3)
  // -----------------------------------------------------------------------
  event.remove({ id: 'minecraft:beacon' })
  event.shaped('minecraft:beacon', [
    'GMG',
    'GNG',
    'OOO'
  ], {
    G: 'minecraft:glass',
    M: 'kubejs:cristal_mana_pura',
    N: 'minecraft:nether_star',
    O: 'minecraft:obsidian'
  }).id('kubejs:cross_mod/beacon')

  // -----------------------------------------------------------------------
  // #15 ars_nouveau:imbuement_chamber — adicionar livingwood (Botania)
  // -----------------------------------------------------------------------
  event.remove({ id: 'ars_nouveau:imbuement_chamber' })
  event.shaped('ars_nouveau:imbuement_chamber', [
    'WGW',
    'GSG',
    'WLW'
  ], {
    W: 'ars_nouveau:archwood_planks',
    G: 'ars_nouveau:source_gem',
    S: 'ars_nouveau:source_gem_block',
    L: 'botania:livingwood'
  }).id('kubejs:cross_mod/imbuement_chamber')

  // #20 e #21 são implementados via datapack overlay (kubejs/data/) porque
  // event.custom() não estava criando spirit_fire recipes:
  //   - data/occultism/recipes/spirit_fire/spirit_attuned_gem.json (sobrescreve)
  //   - data/kubejs/recipes/spirit_fire/source_gem.json (adiciona)
  //   - data/ars_nouveau/recipes/imbuement_lapis.json (override input → impossível)
  //   - data/ars_nouveau/recipes/imbuement_amethyst.json (override input → impossível)
  // #22 rota alternativa pra source_gem via imbuement chamber:
  //   - data/kubejs/recipes/imbuement/source_gem_from_crystal.json
  //     1 spirit_attuned_crystal → 4 source_gem + 1000 source mana

  // -----------------------------------------------------------------------
  // #16 botania:runes elementais
  // -----------------------------------------------------------------------
  ;[
    { id: 'botania:rune_water',  reagent: 'minecraft:prismarine_crystals' },
    { id: 'botania:rune_fire',   reagent: 'minecraft:blaze_powder' },
    { id: 'botania:rune_earth',  reagent: 'minecraft:wheat' },
    { id: 'botania:rune_air',    reagent: 'minecraft:feather' }
  ].forEach(function(rune) {
    event.remove({ type: 'botania:runic_altar', output: rune.id })
    event.custom({
      type: 'botania:runic_altar',
      ingredients: [
        { tag: 'forge:ingots/manasteel' },
        { tag: 'forge:ingots/manasteel' },
        { item: rune.reagent },
        { item: rune.reagent },
        { item: 'kubejs:cristal_mana_pura' }
      ],
      output: { item: rune.id },
      mana: 8000
    }).id('kubejs:cross_mod/' + rune.id.split(':')[1])
  })

})
