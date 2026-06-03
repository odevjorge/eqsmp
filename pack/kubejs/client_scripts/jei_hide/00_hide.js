// =========================================================================
// JEI HIDE — Esconde itens internos do JEI
// =========================================================================
// Tira da busca do JEI itens que são puramente intermediários do gameplay.
// Player ainda recebe e usa, mas não polui o catálogo.
//
// Pattern: dirty items do ore_processing (cluster_dirty + piece_dirty).
// São sempre lavados imediatamente após mineração — não interessa expor.

;(function() {

JEIEvents.hideItems(function(event) {
  // 130 cluster_dirty + 6 piece_dirty = 136 itens
  event.hide(/^kubejs:.*_dirty$/)
})

})()
