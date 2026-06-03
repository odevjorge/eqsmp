// =========================================================================
// ORE PROCESSING — Items
// =========================================================================
// Registra os itens KubeJS do sistema:
//   - kubejs:<metal>_cluster_<1..10>         (12 metais × 10 tiers = 120)
//   - kubejs:<metal>_cluster_<1..10>_dirty   (+120)
//   - kubejs:<source>_dirty                  (6 pieces_ores)
// Total: 246 itens.
//
// NOTA Rhino/KubeJS: const/let DENTRO de for-loops são function-scoped (não
// block-scoped como ES6 padrão). Cada iteração "redeclara" → erro OU pior,
// usa valor cacheado da primeira iteração. Workaround: corpo do loop dentro
// de uma função (forEach do range cria escopo per-iteration).

// IIFE pra isolar consts deste arquivo do scope compartilhado do Rhino.
;(function() {

// Tags compartilhadas (uso em receitas/filtros do server_scripts)
const TAG_ALL           = 'kubejs:ore_processing'
const TAG_CLUSTER       = 'kubejs:cluster'
const TAG_CLUSTER_DIRTY = 'kubejs:cluster_dirty'
const TAG_PIECE_DIRTY   = 'kubejs:piece_dirty'

// Cor brown-escuro pro tint da versão suja
const DIRTY_TINT = 0x4B3621

// Helpers — ficam fora do for-loop pra evitar a redeclaração de const/let
function tierStyle(tier) {
  if (tier <= 3) return { label: 'Comum',   color: '§7' }
  if (tier <= 6) return { label: 'Incomum', color: '§a' }
  if (tier <= 9) return { label: 'Raro',    color: '§9' }
  return           { label: 'Épico',   color: '§5' }
}

function titleCase(s) {
  return s.replace(/(^|_)([a-z])/g, function(_, sep, ch) { return (sep ? ' ' : '') + ch.toUpperCase() })
}

// Cria os 20 itens de um único metal (10 clean + 10 dirty)
function registerMetalClusters(event, OP, metal) {
  var metalTitle = titleCase(metal)
  var clusterTexture = 'geolosys:item/' + metal + '_cluster'

  for (var tier = 1; tier <= OP.CLUSTER_TIERS; tier++) {
    // Função wrapper cria escopo per-iteração (Rhino do KubeJS não faz isso com let/const)
    (function(t) {
      var style    = tierStyle(t)
      var id       = 'kubejs:' + metal + '_cluster_' + t
      var idDirty  = 'kubejs:' + metal + '_cluster_' + t + '_dirty'
      var baseName = style.color + 'Cluster de ' + metalTitle + ' §7(' + t + '/' + OP.CLUSTER_TIERS + ')'

      event.create(id)
        .displayName(baseName)
        .texture(clusterTexture)
        .tag(TAG_ALL)
        .tag(TAG_CLUSTER)
        .tag(TAG_CLUSTER + '/' + metal)

      event.create(idDirty)
        .displayName(baseName + ' §8(Sujo)')
        .tooltip('§7Minério sujo, lave-o para processar')
        .texture(clusterTexture)
        .color(0, DIRTY_TINT)
        .tag(TAG_ALL)
        .tag(TAG_CLUSTER_DIRTY)
        .tag(TAG_CLUSTER_DIRTY + '/' + metal)
    })(tier)
  }
}

// Cria 1 piece dirty pra um source de pieces_ores
function registerPieceDirty(event, source, data) {
  var id          = 'kubejs:' + source + '_dirty'
  var sourceTitle = titleCase(source)
  var resourceTex = data.resource.replace(':', ':item/')

  event.create(id)
    .displayName(sourceTitle + ' §8(Sujo)')
    .tooltip('§7Minério sujo, lave-o para processar')
    .texture(resourceTex)
    .color(0, DIRTY_TINT)
    .tag(TAG_ALL)
    .tag(TAG_PIECE_DIRTY)
    .tag(TAG_PIECE_DIRTY + '/' + source)
}


StartupEvents.registry('item', event => {
  const OP = global.OreProcessing
  if (!OP || !OP.METALS) {
    console.error('[ore_processing/01_items] global.OreProcessing não está carregado')
    return
  }

  OP.METALS.forEach(function(metal) {
    registerMetalClusters(event, OP, metal)
  })

  Object.keys(OP.pieces_ores).forEach(function(source) {
    registerPieceDirty(event, source, OP.pieces_ores[source])
  })
})

})()
