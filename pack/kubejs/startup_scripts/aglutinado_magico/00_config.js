// =========================================================================
// AGLUTINADO MÁGICO — Config
// =========================================================================
// Phase 1 cross-mod gate. Cada mod principal exporta 1 item signatura
// consumido em massa pelos outros. Aglutinado = signature Ars, produzido via
// chain Ars (sourceberry) → Botania (mana_infusion) → consumido por
// Create (andesite_alloy) + Occultism (TODO: bound_foliot ritual).
//
// Production chain:
//   sourceberry_bush (Ars, plantada via apothecary Botania)
//     → 9× → sourceberry_sack_x1 (compactação X9 chain)
//     → milling/crushing/squeezer (Create + IntegratedDynamics)
//     → cursed_aglutinado_magico (intermediate)
//     → mana_infusion (Botania, 50k mana)
//     → aglutinado_magico (final)
//
// Cross-mod gates desbloqueados (consumers):
//   Create:    create:andesite_alloy   (recipe override, 0 iron)
//   Botania:   botania:mana_pool       (recipe override, 5 otherstone)
//              botania:diluted_pool    (recipe override, 5 otherstone_slab)
//   Occultism: bound_foliot ritual     (TODO — ritual JSON override)

;(function() {

global.AglutinadoMagico = {}
var AG = global.AglutinadoMagico

AG.ITEMS = {
  aglutinado: 'kubejs:aglutinado_magico',
  cursed:     'kubejs:cursed_aglutinado_magico',
  sack_prefix: 'kubejs:sourceberry_sack_x'
}

AG.MANA_INFUSION_COST = 50000

AG.COMPACT_LEVELS = 9

AG.SOURCEBERRY_BASE = 'ars_nouveau:sourceberry_bush'

AG.SACK_PARENT_MODEL = 'ars_nouveau:block/sourceberry_sack'

})()
