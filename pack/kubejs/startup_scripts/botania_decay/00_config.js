// =========================================================================
// BOTANIA DECAY — Config
// =========================================================================
// Mana flowers + pure_daisy decaem após N ticks de servidor e viram dead_bush
// com particles + som. Força replantio (impede farms passivas eternas).
//
// Usa server.tickCount (monotônico) em vez de level.getDayTime() — não quebra
// com /time set. Cada level guarda seu próprio registro em level.data.

;(function() {

global.BotaniaDecay = {}
const BD = global.BotaniaDecay

// 6000 ticks = 5 min real (20 tps). Geradoras duram mais que a pure_daisy
// porque ela é "consumível" (vira livingwood ao tocar log).
const MANA_LIFESPAN  = 6000
const DAISY_LIFESPAN = 3000

// Catálogo: key = block ID, value = { kind, lifespan }
BD.flowers = {
  // Mana flowers (geradoras)
  'botania:daybloom':       { kind: 'mana', lifespan: MANA_LIFESPAN },
  'botania:nightshade':     { kind: 'mana', lifespan: MANA_LIFESPAN },
  'botania:hydroangeas':    { kind: 'mana', lifespan: MANA_LIFESPAN },
  'botania:endoflare':      { kind: 'mana', lifespan: MANA_LIFESPAN },
  'botania:thermalily':     { kind: 'mana', lifespan: MANA_LIFESPAN },
  'botania:rosa_arcana':    { kind: 'mana', lifespan: MANA_LIFESPAN },
  'botania:munchdew':       { kind: 'mana', lifespan: MANA_LIFESPAN },
  'botania:entropinnyum':   { kind: 'mana', lifespan: MANA_LIFESPAN },
  'botania:kekimurus':      { kind: 'mana', lifespan: MANA_LIFESPAN },
  'botania:gourmaryllis':   { kind: 'mana', lifespan: MANA_LIFESPAN },
  'botania:narslimmus':     { kind: 'mana', lifespan: MANA_LIFESPAN },
  'botania:spectrolus':     { kind: 'mana', lifespan: MANA_LIFESPAN },
  'botania:dandelifeon':    { kind: 'mana', lifespan: MANA_LIFESPAN },
  'botania:rafflowsia':     { kind: 'mana', lifespan: MANA_LIFESPAN },
  'botania:shulk_me_not':   { kind: 'mana', lifespan: MANA_LIFESPAN },
  // Special
  'botania:pure_daisy':     { kind: 'daisy', lifespan: DAISY_LIFESPAN }
}

BD.dead_block     = 'minecraft:dead_bush'
BD.check_interval = 1200    // ticks (60s) entre varreduras
BD.data_key       = 'botania_decay_registry'
BD.debug          = false   // true → loga cada placement também

BD.configFor = function(blockId) {
  return BD.flowers[blockId] || null
}

})()
