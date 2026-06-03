// =========================================================================
// PHASE 0 BOOTSTRAP — Config
// =========================================================================
// Multiplayer-friendly: cada player pode pegar qualquer kit via comando
// `/eqsmp kit <mod>`. Sem restrição de quantos kits por player — players
// se organizam por time / especialização.
//
// Stage `eqsmp_phase0` é dado na PRIMEIRA execução do `/eqsmp kit` por
// player (NBT flag eqsmp_phase0_granted). Destrava Silent Gear copper tools.
//
// Ver project_phase0_bootstrap.md.

;(function() {

global.Phase0Bootstrap = {}
var P0 = global.Phase0Bootstrap

P0.STAGE_FLAG = 'eqsmp_phase0_granted'  // NBT flag no player

P0.KITS = {
  botania: [
    { id: 'botania:twig_wand', count: 1 }       // controle de blocos / spreaders
  ],
  create: [
    { id: 'create:goggles', count: 1 },          // info HUD em blocks/contraptions
    { id: 'create:wrench', count: 1 }            // rotação + assembly
  ],
  occultism: [
    { id: 'occultism:dictionary_of_spirits', count: 1 }  // tutorial book + research
  ],
  ars: [
    { id: 'ars_nouveau:worn_notebook', count: 1 },       // tutorial + spell book unlock
    { id: 'ars_nouveau:dowsing_rod', count: 1 }          // acha ametista/source berries
  ]
}

// Itens BASE entregues em TODO kit (curados pelo dono via inventario 2026-05-31)
// NBT verbatim dos itens construidos (Silent Gear copper full + ferramentas)
P0.BASE = [
    { id: 'geolosys:prospectors_pick', count: 1 },
    { id: 'silentgear:paxel', count: 1, nbt: '{Damage: 0, SGear_UUID: [I; 586068045, -1093978, -1533522205, -137626266], SGear_Data: {Properties: {ModVersion: "3.6.7", LockStats: 0b, Traits: [{Name: "silentgear:soft", Level: 3b}, {Name: "silentgear:bending", Level: 3b}], Stats: {"silentgear:harvest_speed": 4.8f, "silentgear:rarity": 12.0f, "silentgear:magic_damage": 1.0f, "silentgear:enchantment_value": 10.5f, "silentgear:attack_speed": -2.9f, "silentgear:repair_efficiency": 1.2f, "silentgear:durability": 203.85f, "silentgear:melee_damage": 4.5f, "silentgear:attack_reach": 3.0f, "silentgear:charging_value": 1.3f}, HarvestTier: "minecraft:stone"}, Rendering: {Model: 3, ModelKey: "paxel:paxel_head{copper,copper,copper,copper,copper},rod{copper,copper},"}, Construction: {Parts: [{ID: "silentgear:paxel_head", Item: {id: "silentgear:paxel_head", Count: 1b, tag: {Damage: 0, Materials: [{Count: 5b, ID: "silentgear:copper", Item: {id: "minecraft:copper_ingot", Count: 1b}}]}}}, {ID: "silentgear:rod", Item: {id: "silentgear:rod", Count: 1b, tag: {Materials: [{Count: 2b, ID: "silentgear:copper", Item: {id: "minecraft:copper_ingot", Count: 1b}}], CraftedCount: 4}}}]}}}' },
    { id: 'minecraft:copper_ingot', count: 24 },
    { id: 'silentgear:helmet', count: 1, nbt: '{Damage: 0, SGear_UUID: [I; -1209854113, 1445875335, -1687304329, -1632435684], SGear_Data: {Properties: {ModVersion: "3.6.7", LockStats: 0b, Traits: [], Stats: {"silentgear:armor_durability": 12.0f, "silentgear:rarity": 12.0f, "silentgear:knockback_resistance": 0.0f, "silentgear:enchantment_value": 15.000001f, "silentgear:armor_toughness": 0.0f, "silentgear:durability": 151.0f, "silentgear:repair_efficiency": 1.0f, "silentgear:magic_armor": 2.0f, "silentgear:armor": 2.0f, "silentgear:charging_value": 1.3f}, HarvestTier: "minecraft:stone"}, Rendering: {Model: 3, ModelKey: "helmet:helmet_plates{copper,copper,copper,copper,copper},"}, Construction: {Parts: [{ID: "silentgear:helmet_plates", Item: {id: "silentgear:helmet_plates", Count: 1b, tag: {Damage: 0, Materials: [{Count: 5b, ID: "silentgear:copper", Item: {id: "minecraft:copper_ingot", Count: 1b}}], CraftedCount: 1}}}]}}}' },
    { id: 'silentgear:chestplate', count: 1, nbt: '{Damage: 0, SGear_UUID: [I; 1519801452, -1606793060, -1930700667, -639703431], SGear_Data: {Properties: {ModVersion: "3.6.7", LockStats: 0b, Traits: [], Stats: {"silentgear:armor_durability": 11.999999f, "silentgear:rarity": 11.999999f, "silentgear:knockback_resistance": 0.0f, "silentgear:enchantment_value": 15.0f, "silentgear:armor_toughness": 0.0f, "silentgear:durability": 151.0f, "silentgear:repair_efficiency": 1.0f, "silentgear:magic_armor": 2.0f, "silentgear:armor": 4.0f, "silentgear:charging_value": 1.3f}, HarvestTier: "minecraft:stone"}, Rendering: {Model: 3, ModelKey: "chestplate:chestplate_plates{copper,copper,copper,copper,copper,copper,copper,copper},"}, Construction: {Parts: [{ID: "silentgear:chestplate_plates", Item: {id: "silentgear:chestplate_plates", Count: 1b, tag: {Damage: 0, Materials: [{Count: 8b, ID: "silentgear:copper", Item: {id: "minecraft:copper_ingot", Count: 1b}}], CraftedCount: 1}}}]}}}' },
    { id: 'silentgear:leggings', count: 1, nbt: '{Damage: 0, SGear_UUID: [I; -576984507, -968342996, -1634670064, 210831611], SGear_Data: {Properties: {ModVersion: "3.6.7", LockStats: 0b, Traits: [], Stats: {"silentgear:armor_durability": 11.999999f, "silentgear:rarity": 11.999999f, "silentgear:knockback_resistance": 0.0f, "silentgear:enchantment_value": 15.000001f, "silentgear:armor_toughness": 0.0f, "silentgear:durability": 151.0f, "silentgear:repair_efficiency": 1.0f, "silentgear:magic_armor": 2.0f, "silentgear:armor": 2.9999998f, "silentgear:charging_value": 1.3000001f}, HarvestTier: "minecraft:stone"}, Rendering: {Model: 3, ModelKey: "leggings:legging_plates{copper,copper,copper,copper,copper,copper,copper},"}, Construction: {Parts: [{ID: "silentgear:legging_plates", Item: {id: "silentgear:legging_plates", Count: 1b, tag: {Damage: 0, Materials: [{Count: 7b, ID: "silentgear:copper", Item: {id: "minecraft:copper_ingot", Count: 1b}}], CraftedCount: 1}}}]}}}' },
    { id: 'silentgear:boots', count: 1, nbt: '{Damage: 0, SGear_UUID: [I; -748448519, 612910597, -1659526417, -770447658], SGear_Data: {Properties: {ModVersion: "3.6.7", LockStats: 0b, Traits: [], Stats: {"silentgear:armor_durability": 12.0f, "silentgear:rarity": 12.0f, "silentgear:knockback_resistance": 0.0f, "silentgear:enchantment_value": 15.000001f, "silentgear:armor_toughness": 0.0f, "silentgear:durability": 151.00002f, "silentgear:repair_efficiency": 1.0f, "silentgear:magic_armor": 2.0f, "silentgear:armor": 1.0f, "silentgear:charging_value": 1.3f}, HarvestTier: "minecraft:stone"}, Rendering: {Model: 3, ModelKey: "boots:boot_plates{copper,copper,copper,copper},"}, Construction: {Parts: [{ID: "silentgear:boot_plates", Item: {id: "silentgear:boot_plates", Count: 1b, tag: {Damage: 0, Materials: [{Count: 4b, ID: "silentgear:copper", Item: {id: "minecraft:copper_ingot", Count: 1b}}], CraftedCount: 1}}}]}}}' },
    { id: 'silentgear:crude_repair_kit', count: 1, nbt: '{Storage: {copper: 16.0f}}' },
    { id: 'sophisticatedbackpacks:copper_backpack', count: 1 },
    // 40 comidas variadas (estático): 8 tipos × 5
    { id: 'minecraft:cooked_beef', count: 5 },
    { id: 'minecraft:cooked_porkchop', count: 5 },
    { id: 'minecraft:bread', count: 5 },
    { id: 'minecraft:golden_carrot', count: 5 },
    { id: 'minecraft:baked_potato', count: 5 },
    { id: 'minecraft:cooked_chicken', count: 5 },
    { id: 'minecraft:cooked_mutton', count: 5 },
    { id: 'minecraft:apple', count: 5 }
  ]

P0.KIT_NAMES = ['botania', 'create', 'occultism', 'ars']

P0.MOD_LABELS = {
  botania: 'Botania',
  create: 'Create',
  occultism: 'Occultism',
  ars: 'Ars Nouveau'
}

})()
