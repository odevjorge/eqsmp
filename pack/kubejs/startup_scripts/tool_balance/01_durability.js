// =========================================================================
// TOOL BALANCE — Durabilidade nerfada das ferramentas vanilla
// =========================================================================
// Roda em ItemEvents.modification (startup). Reduz o maxDamage das 30
// ferramentas vanilla pros valores fracos definidos em 00_config.

;(function () {
  ItemEvents.modification(function (event) {
    const TB = global.ToolBalance
    if (!TB || !TB.vanillaTools) {
      console.error('[tool_balance] global.ToolBalance não carregado')
      return
    }
    TB.vanillaTools.forEach(function (id) {
      var dur = TB.durability[TB.metalOf(id)]
      if (!dur) return
      event.modify(id, function (item) {
        item.maxDamage = dur
      })
    })
  })
})()
