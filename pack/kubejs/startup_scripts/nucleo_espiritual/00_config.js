// =========================================================================
// NÚCLEO ESPIRITUAL — Config
// =========================================================================
// Phase 4 cross-mod gate. Signature item Occultism — soul_gem (origem) é
// processado por Create sequenced_assembly em depot. A sequência consome
// 1× de cada signature anterior (F1 aglutinado + F2 nucleo_cinetico + F3
// cristal_mana_pura), unificando as 4 fases num único item final.
//
// Production chain:
//   occultism:soul_gem (F3-gated via djinni binding)
//     → Create mechanical_depot (sequenced_assembly)
//     → 1 loop, 3 steps: deploy aglutinado → deploy cinetico → deploy cristal
//     → cursed_nucleo_espiritual (transitionalItem)
//     → final pass → nucleo_espiritual
//
// Cross-mod gates desbloqueados (consumers):
//   Ars Nouveau: ars_nouveau:ritual_brazier (recipe override, +1 nucleo)
//   Botania:     botania:terrasteel_ingot   (terra_plate override, +1 nucleo)

;(function() {

global.NucleoEspiritual = {}
var NE = global.NucleoEspiritual

NE.ITEMS = {
  nucleo: 'kubejs:nucleo_espiritual',
  cursed: 'kubejs:cursed_nucleo_espiritual'  // transitionalItem do sequenced_assembly
}

})()
