// =========================================================================
// EQSMP — Remove as receitas PADRÃO do Ores Drop Update (shards_and_pieces)
// =========================================================================
// O mod (jar shards_and_pieces, projeto "Ores Drop Update") adiciona shards e
// pieces como drop de minério que convertem de volta em material vanilla:
//   - 3× diamond_shard  → 1 diamond            (crafting_shapeless)
//   - raw_iron_piece    → 6 iron_nugget        (smelting + blasting)
//   - pieces            → ores / nuggets        (copper/gold/iron/tin/zinc/…)
//   - miners_pouch / pieces_pouch              (crafts shaped)
// Essas conversões padrão furam o gating de minério da EQSMP (Geolosys = fonte
// única; AllTheOres worldgen off; baús sem minério). Removemos TODAS as 29
// receitas do namespace. Pra reintroduzir versões GATED depois, adicionar aqui.
// =========================================================================

ServerEvents.recipes(function (event) {
  var removed = event.remove({ mod: 'shards_and_pieces' })
  var n = (removed && removed.length != null) ? removed.length : removed
  console.info('[shards_and_pieces] receitas padrao removidas: ' + n)
})
