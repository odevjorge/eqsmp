// =========================================================================
// AGLUTINADO MÁGICO — Sourceberry compactação X9
// =========================================================================
// Chain bidirecional:
//   - Compact: 9× sourceberry_bush → sourceberry_sack_x1
//              9× sack_xN → sack_x(N+1)
//   - Decompact: 1× sack_xN → 9× (sack_x(N-1) ou sourceberry_bush se N=1)

;(function() {

function buildCompactionLevel(event, level, previous, PREFIX) {
  var output = PREFIX + level
  // IDs explícitos pra idempotência on /reload (sem .id() KubeJS gera hash
  // do conteúdo e pode duplicar com suffix _2, _3 se o registry não limpou).
  event.shaped(output, ['AAA', 'AAA', 'AAA'], { A: previous })
    .id('kubejs:compact/sourceberry_sack_x' + level)
  event.shapeless(Item.of(previous, 9), [output])
    .id('kubejs:decompact/sourceberry_sack_x' + level)
  return output
}

ServerEvents.recipes(function(event) {
  var AG = global.AglutinadoMagico
  if (!AG) {
    console.error('[aglutinado_magico/compaction] global.AglutinadoMagico não carregado')
    return
  }

  var previous = AG.SOURCEBERRY_BASE
  for (var level = 1; level <= AG.COMPACT_LEVELS; level++) {
    previous = buildCompactionLevel(event, level, previous, AG.ITEMS.sack_prefix)
  }

  console.log('[aglutinado_magico/compaction] chain X' + AG.COMPACT_LEVELS + ' registrada')
})

})()
