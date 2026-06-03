// =========================================================================
// TOOL BALANCE — Tooltip das ferramentas vanilla enfraquecidas
// =========================================================================

;(function () {
  ItemEvents.tooltip(function (event) {
    const TB = global.ToolBalance
    if (!TB || !TB.vanillaTools) return
    TB.vanillaTools.forEach(function (id) {
      event.add(id, TB.MESSAGES.weak)
      event.add(id, TB.MESSAGES.hint)
    })
  })
})()
