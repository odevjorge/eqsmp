// =========================================================================
// ORE SAMPLE MARKERS — quebrar amostra de superfície (Geolosys) cria um
// ponto no mapa (Surveyor / Antique Atlas) com o ícone e o nome do minério.
// =========================================================================

global.OreSampleMarkers = {
  enabled: true,

  // 'global' = ponto compartilhado no servidor (todos veem, fica no atlas de todos)
  // 'player' = waypoint pessoal de quem quebrou a amostra
  ownerMode: 'global',

  // Exige que a amostra esteja exposta ao céu (superfície de verdade).
  // Amostras do Geolosys já só geram na superfície, então o default é false
  // (não rejeita nada). Ligue para ser estrito.
  requireSky: false,

  // Avisa o jogador no chat quando marca o depósito.
  feedback: true,

  // Namespace dos IDs de landmark criados (evita colidir com os do Surveyor).
  namespace: 'eqsmp',

  // Blocos do Geolosys que contam como amostra além do padrão "*_ore_sample".
  extraSamples: ['geolosys:rhododendron'],

  // amostra -> item mostrado no mapa (override). Sem override, o default tira o
  // sufixo "_sample" e cai no bloco de minério geológico (ex.: "Hematite Ore").
  // O Geolosys nomeia os blocos pelo mineral (hematita, malaquita...) mas o
  // DROP é o cluster do metal (iron_cluster, copper_cluster...). Aqui mapeamos
  // cada amostra para o cluster/recurso que o depósito realmente dá, pra o
  // landmark mostrar o ícone do cluster (o que o jogador procura), não a pedra.
  // Mapeamento conferido nas loot tables do Geolosys 7.0.14.
  oreOverrides: {
    // metais -> cluster do Geolosys
    'geolosys:hematite_ore_sample': 'geolosys:iron_cluster',
    'geolosys:limonite_ore_sample': 'geolosys:iron_cluster',
    'geolosys:malachite_ore_sample': 'geolosys:copper_cluster',
    'geolosys:azurite_ore_sample': 'geolosys:copper_cluster',
    'geolosys:cassiterite_ore_sample': 'geolosys:tin_cluster',
    'geolosys:teallite_ore_sample': 'geolosys:tin_cluster',
    'geolosys:galena_ore_sample': 'geolosys:lead_cluster',
    'geolosys:bauxite_ore_sample': 'geolosys:aluminum_cluster',
    'geolosys:autunite_ore_sample': 'geolosys:uranium_cluster',
    'geolosys:platinum_ore_sample': 'geolosys:platinum_cluster',
    'geolosys:sphalerite_ore_sample': 'geolosys:zinc_cluster',
    'geolosys:gold_ore_sample': 'geolosys:gold_cluster',
    'geolosys:nether_gold_ore_sample': 'geolosys:nether_gold_cluster',
    'geolosys:ancient_debris_ore_sample': 'geolosys:ancient_debris_cluster',

    // não-metais -> recurso vanilla que o depósito dá
    'geolosys:coal_ore_sample': 'minecraft:coal',
    'geolosys:lignite_ore_sample': 'minecraft:coal',
    'geolosys:bituminous_coal_ore_sample': 'minecraft:coal',
    'geolosys:anthracite_coal_ore_sample': 'minecraft:coal',
    'geolosys:lapis_ore_sample': 'minecraft:lapis_lazuli',
    'geolosys:quartz_ore_sample': 'minecraft:quartz',
    'geolosys:kimberlite_ore_sample': 'minecraft:diamond',
    'geolosys:beryl_ore_sample': 'minecraft:emerald',
    'geolosys:cinnabar_ore_sample': 'minecraft:redstone',

    // bloco especial (não segue o padrão "*_ore_sample")
    'geolosys:rhododendron': 'geolosys:peat'
  }
}
