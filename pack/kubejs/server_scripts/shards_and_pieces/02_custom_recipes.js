// =========================================================================
// EQSMP — Receitas CUSTOM dos shards do Ores Drop Update (5 → 1, GATED)
// =========================================================================
// O Geolosys, via ore_processing (pieces_ores em startup_scripts/ore_processing/
// 00_config.js), dropa estes shards ao minerar + lavar:
//   geolosys:beryl_ore      → shards_and_pieces:emerald_shard
//   geolosys:kimberlite_ore → shards_and_pieces:diamond_shard
//
// As receitas DEFAULT do mod (3 shard → 1 gema, ungated) foram removidas em
// 01_remove_defaults.js. Aqui entra a conversão GATED do nosso sistema:
//   5× shard → 1 gema  (diamante/esmeralda gated atrás do Geolosys).
//
// Os demais itens do mod (pieces de metal, certus_quartz_shard) NÃO entram na
// economia EQSMP (Geolosys não dropa) — por isso sem receita aqui.
// =========================================================================

ServerEvents.recipes(function (event) {
  function fiveToOne(shard, result, idName) {
    var ins = []
    for (var i = 0; i < 5; i++) ins.push(shard)
    event.shapeless(result, ins).id('kubejs:shards_and_pieces/' + idName)
    console.info('[shards_and_pieces] 5x ' + shard + ' -> ' + result)
  }

  fiveToOne('shards_and_pieces:diamond_shard', 'minecraft:diamond', 'diamond_from_shards')
  fiveToOne('shards_and_pieces:emerald_shard', 'minecraft:emerald', 'emerald_from_shards')
})
