// =========================================================================
// SIN DIFFICULTY — handler de morte (momentum + escrita no Scaling Health)
// =========================================================================
// NOTA: este script NÃO pode depender da ordem de carregamento dos scripts.
// O KubeJS pode carregar 01_kill.js antes de 00_config.js, então o config
// (global.SinDifficulty) só é lido DENTRO do callback (em runtime), nunca no
// topo do módulo.

;(function () {
  // --- carregamento das classes (uma vez por reload, sem depender do config) ---
  var $SHDifficulty, $EntityType, $Component
  var ready = false
  try {
    $SHDifficulty = Java.loadClass('net.silentchaos512.scalinghealth.utils.config.SHDifficulty')
    $EntityType = Java.loadClass('net.minecraft.world.entity.EntityType')
    $Component = Java.loadClass('net.minecraft.network.chat.Component')
    ready = true
    console.info('[SinDifficulty] classes carregadas OK (Scaling Health acessível).')
  } catch (e) {
    console.error('[SinDifficulty] FALHA ao carregar classes do Scaling Health: ' + e)
  }

  function unwrap(o) {
    if (!o) return o
    if (o.minecraftEntity) return o.minecraftEntity
    if (o.minecraftPlayer) return o.minecraftPlayer
    return o
  }

  function isCreativeOrSpectator(p) {
    try {
      var m = p.gameMode
      if (m == null) return false
      var s = String(m).toLowerCase()
      return s.indexOf('creative') >= 0 || s.indexOf('spectator') >= 0
    } catch (e) { return false }
  }

  EntityEvents.death(function (event) {
    var CFG = global.SinDifficulty
    if (!ready || !CFG) return
    try {
      var src = event.source
      if (!src) return

      // atacante (jogador que desferiu o golpe)
      var attacker = src.player ||
        (src.getEntity ? src.getEntity() : (src.entity || null))
      if (!attacker) return
      var pmc = unwrap(attacker)

      // só jogadores têm DifficultySource; mobs matando mobs são ignorados
      var source = $SHDifficulty.source(pmc)
      if (!source) return
      if (isCreativeOrSpectator(attacker)) return

      // entidade morta
      var killed = event.entity || (event.getEntity ? event.getEntity() : null)
      if (!killed) return
      var kmc = unwrap(killed)
      var type = kmc.getType()
      var typeId = String($EntityType.getKey(type))

      if (CFG.exempt.indexOf(typeId) >= 0) return

      // classificação: hostil (penitência −) vs pacífico/neutro (pecado +)
      // NOTA: no KubeJS/Rhino deste pack, kmc.getType() devolve uma STRING
      // ("minecraft:zombie"), não um EntityType — então .getCategory()/.category
      // dão undefined. O caminho confiável é re-resolver o EntityType pelo id via
      // EntityType.byString(id) e ler getCategory() nele (retorna MONSTER/CREATURE/…).
      var hostile
      if (CFG.forceHostile.indexOf(typeId) >= 0) hostile = true
      else if (CFG.forcePeaceful.indexOf(typeId) >= 0) hostile = false
      else {
        var catName = ''
        try {
          var opt = $EntityType.byString(typeId)
          var et = (opt && opt.isPresent()) ? opt.get() : null
          if (et) catName = String(et.getCategory())
        } catch (e1) { catName = '' }
        hostile = (catName.toUpperCase().indexOf('MONSTER') >= 0)
      }

      var killValue = hostile ? -CFG.base : CFG.base

      // média móvel com o kill anterior (momentum), guardada por jogador
      var pdata = attacker.persistentData
      var prev = (pdata && pdata.contains(CFG.prevKey)) ? pdata.getDouble(CFG.prevKey) : killValue
      var delta = (killValue + prev) / 2.0
      if (pdata) pdata.putDouble(CFG.prevKey, killValue)

      // aplica na dificuldade do Scaling Health, respeitando os limites
      var cur = source.getDifficulty()
      var nv = Math.max(CFG.minDifficulty, Math.min(CFG.maxDifficulty, cur + delta))
      if (nv === cur) return
      source.setDifficulty(nv)

      if (CFG.feedbackInChat && pmc.displayClientMessage) {
        var sub = (delta >= 0)
          ? '§cPecado§7: a balança pesa contra você (+' + delta.toFixed(1) + ')'
          : '§aPenitência§7: o mundo se acalma (' + delta.toFixed(1) + ')'
        pmc.displayClientMessage($Component.literal(sub), true)
      }

      if (CFG.debug) {
        console.info('[SinDifficulty] ' + typeId + (hostile ? ' (hostil)' : ' (pacifico)') +
          ' delta=' + delta.toFixed(2) + ' diff ' + cur.toFixed(2) + ' -> ' + nv.toFixed(2))
      }
    } catch (e) {
      console.error('[SinDifficulty] erro no handler de morte: ' + e)
    }
  })
})()
