// =========================================================================
// PEDRA FILOSOFAL — Config (TRUE ENDGAME)
// =========================================================================
// True endgame artifact. Não é signature de fase (não tem cursed nem chain
// como F1-F4) — é o item final que UNIFICA as 4 fases via ritual djinni.
// Reflexão lore: o "mundo antigo" (pré-Colapso) tentou criar a Pedra
// individualmente por cada mod; a única forma agora é cross-mod gigante.
//
// Production chain:
//   F4 (nucleo_espiritual completo)
//     → ritual craft_djinni (Occultism, 600s — 10 minutos)
//     → ativação book_of_binding_bound_djinni (F3-gated)
//     → ingredientes: 1× nucleo_espiritual + 1× aglutinado_magico + 1× nucleo_cinetico
//                    + 1× cristal_mana_pura + 1× minecraft:nether_star (catalisador divino)
//     → pedra_filosofal (item final, glow)
//
// Não desbloqueia recipes — é o trofeu absoluto + ferramenta lore.
// Capítulo FTB Quests "A Pedra Filosofal" (grupo Lore) usa esse item.

;(function() {

global.PedraFilosofal = {}
var PF = global.PedraFilosofal

PF.ITEMS = {
  pedra: 'kubejs:pedra_filosofal'
}

PF.RITUAL_DURATION = 600  // 10 minutos — endgame absoluto

})()
