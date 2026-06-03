// =========================================================================
// BOTANIA DECAY — Runtime
// =========================================================================
// BlockEvents.placed   → registra flor com deathTick = tickCount + lifespan
// BlockEvents.broken   → remove do registro (player colheu antes do decay)
// ServerEvents.tick    → a cada check_interval, varre cada level e mata
//                        flores com tickCount >= deathTick

;(function() {

const BD = global.BotaniaDecay

function readRegistry(level) {
  return level.data.get(BD.data_key) || []
}

function writeRegistry(level, entries) {
  level.data.put(BD.data_key, entries)
}

function posKey(x, y, z) {
  return x + ',' + y + ',' + z
}

function decayBlock(server, level, entry) {
  var x = entry.x, y = entry.y, z = entry.z
  // Confirma que o bloco ainda é o que registramos — pode ter sido substituído
  // sem disparar break (outras flores via mecânicas, /setblock etc).
  if (String(level.getBlock(x, y, z).id) !== entry.id) return

  console.info('[botania_decay] ' + entry.id + ' morreu em [' + x + ',' + y + ',' + z + ']')
  var coord = x + ' ' + y + ' ' + z
  var center = (x + 0.5) + ' ' + (y + 0.5) + ' ' + (z + 0.5)
  server.runCommandSilent('setblock ' + coord + ' ' + BD.dead_block + ' replace')
  server.runCommandSilent('playsound minecraft:block.grass.break blocks @a ' + coord + ' 1 0.8')
  server.runCommandSilent('particle minecraft:smoke ' + center + ' 0.1 0.1 0.1 0.05 20 normal')
  server.runCommandSilent('particle botania:wisp ' + center + ' 0.2 0.2 0.2 0.02 20 normal')
}

BlockEvents.placed(function(event) {
  if (!BD || !BD.flowers) return
  var id = String(event.block.id)
  var cfg = BD.configFor(id)
  if (!cfg) return

  var level = event.level
  var pos = event.block.pos
  var deathTick = event.server.tickCount + cfg.lifespan

  var entries = readRegistry(level)
  entries.push({
    x: pos.x, y: pos.y, z: pos.z,
    id: id,
    kind: cfg.kind,
    deathTick: deathTick
  })
  writeRegistry(level, entries)

  if (BD.debug) {
    console.info('[botania_decay] registrada ' + id + ' em [' + pos.x + ',' + pos.y + ',' + pos.z + '] death=' + deathTick)
  }
})

BlockEvents.broken(function(event) {
  if (!BD || !BD.flowers) return
  var id = String(event.block.id)
  if (!BD.configFor(id)) return

  var level = event.level
  var pos = event.block.pos
  var key = posKey(pos.x, pos.y, pos.z)

  var entries = readRegistry(level)
  var filtered = entries.filter(function(e) {
    return e.id !== id || posKey(e.x, e.y, e.z) !== key
  })
  if (filtered.length !== entries.length) writeRegistry(level, filtered)
})

ServerEvents.tick(function(event) {
  if (!BD || !BD.flowers) return
  if (event.server.tickCount % BD.check_interval !== 0) return

  var server = event.server
  var now = server.tickCount

  // Rhino expõe Java getter getAllLevels() como property .allLevels
  server.allLevels.forEach(function(level) {
    var entries = readRegistry(level)
    if (entries.length === 0) return

    var survivors = []
    var killed = 0
    entries.forEach(function(entry) {
      if (now >= entry.deathTick) {
        decayBlock(server, level, entry)
        killed++
      } else {
        survivors.push(entry)
      }
    })

    if (killed > 0) writeRegistry(level, survivors)
  })
})

})()
