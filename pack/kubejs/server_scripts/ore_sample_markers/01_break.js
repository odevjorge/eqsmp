// =========================================================================
// ORE SAMPLE MARKERS — handler de quebra
// =========================================================================
// Não depende de ordem de carregamento: classes + registro do handler no topo,
// config (global.OreSampleMarkers) lido DENTRO do callback (runtime).

;(function () {
  var $WorldSummary, $WorldLandmarks, $Landmark, $C, $RL, $Component, $ItemStack, $Registries, $UUID, $BlockPos
  var ready = false
  try {
    $WorldSummary = Java.loadClass('folk.sisby.surveyor.WorldSummary')
    $WorldLandmarks = Java.loadClass('folk.sisby.surveyor.landmark.WorldLandmarks')
    $Landmark = Java.loadClass('folk.sisby.surveyor.landmark.Landmark')
    $C = Java.loadClass('folk.sisby.surveyor.landmark.component.LandmarkComponentTypes')
    $RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
    $Component = Java.loadClass('net.minecraft.network.chat.Component')
    $ItemStack = Java.loadClass('net.minecraft.world.item.ItemStack')
    $Registries = Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
    $UUID = Java.loadClass('java.util.UUID')
    $BlockPos = Java.loadClass('net.minecraft.core.BlockPos')
    ready = true
    console.info('[OreSampleMarkers] API Surveyor OK')
  } catch (e) {
    console.error('[OreSampleMarkers] FALHA ao carregar API do Surveyor: ' + e)
  }

  function unwrap(o) {
    if (o && o.minecraftLevel) return o.minecraftLevel
    if (o && o.minecraftEntity) return o.minecraftEntity
    return o
  }

  function nativeStack(itemId) {
    try {
      var rl = new $RL(itemId)
      if (!$Registries.ITEMS.containsKey(rl)) return null
      var item = $Registries.ITEMS.getValue(rl)
      if (!item) return null
      var st = new $ItemStack(item)
      return st.isEmpty() ? null : st
    } catch (e) { return null }
  }

  function isSample(CFG, id) {
    if (id.indexOf('geolosys:') !== 0) return false
    if (id.lastIndexOf('_ore_sample') === id.length - 11) return true
    return CFG.extraSamples.indexOf(id) >= 0
  }

  function oreForSample(CFG, sampleId) {
    if (CFG.oreOverrides[sampleId]) return CFG.oreOverrides[sampleId]
    if (sampleId.lastIndexOf('_sample') === sampleId.length - 7) return sampleId.slice(0, -7)
    return null
  }

  BlockEvents.broken(function (event) {
    var CFG = global.OreSampleMarkers
    if (!ready || !CFG || !CFG.enabled) return
    try {
      var player = event.player
      if (!player) return
      var id = String(event.block.id)
      if (!isSample(CFG, id)) return

      var lvl = unwrap(event.level || event.block.level)
      var rp = event.block.pos
      var pos = new $BlockPos(rp.getX(), rp.getY(), rp.getZ())

      if (CFG.requireSky && lvl.canSeeSky && !lvl.canSeeSky(pos.above())) return

      var ws = $WorldSummary.of(lvl)
      var landmarks = ws ? ws.landmarks() : null
      if (!landmarks) return // sistema de landmarks desabilitado nessa dimensão

      // ícone + nome = o minério; fallback = o próprio bloco da amostra
      var oreId = oreForSample(CFG, id)
      var stack = (oreId ? nativeStack(oreId) : null) || nativeStack(id)
      if (!stack) return
      var name = stack.getHoverName()

      var owner = $WorldLandmarks.GLOBAL
      if (CFG.ownerMode === 'player') {
        try { owner = player.getUUID() }
        catch (e) { try { owner = $UUID.fromString(String(player.uuid)) } catch (e2) {} }
      }

      // tira QUALQUER namespace (geolosys:, minecraft:, ...) — o ':' é inválido
      // no path de ResourceLocation e fazia o landmark estourar pros minérios
      // não-metálicos (coal/lapis/quartz/diamond/emerald/redstone → minecraft:*).
      var short = (oreId || id)
      var _ci = short.indexOf(':')
      if (_ci >= 0) short = short.substring(_ci + 1)
      var lid = new $RL(CFG.namespace, 'ore_sample/' + short + '/' + pos.getX() + '_' + pos.getY() + '_' + pos.getZ())

      var st = stack, nm = name, bp = pos
      landmarks.put($Landmark.create(owner, lid, function (b) {
        b.add($C.POS, bp)
        b.add($C.NAME, nm)
        b.add($C.STACK, st)
        return b
      }))

      if (CFG.feedback && player.tell) {
        player.tell($Component.literal('§bDepósito marcado no mapa: §f').append(nm))
      }
    } catch (e) {
      console.error('[OreSampleMarkers] erro no handler de quebra: ' + e)
    }
  })
})()
