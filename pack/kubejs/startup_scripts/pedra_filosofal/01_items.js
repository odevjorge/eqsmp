// =========================================================================
// PEDRA FILOSOFAL — Item registry
// =========================================================================
// Registra apenas kubejs:pedra_filosofal (sem cursed — true endgame).

;(function() {

StartupEvents.registry('item', function(event) {
  var PF = global.PedraFilosofal
  if (!PF) {
    console.error('[pedra_filosofal/items] global.PedraFilosofal não carregado')
    return
  }

  event.create('pedra_filosofal')
    .displayName('Pedra Filosofal')
    .texture('kubejs:item/pedra_filosofal')
    .maxStackSize(1)        // único — não compactável
    .rarity('epic')
    .glow(true)
})

})()
