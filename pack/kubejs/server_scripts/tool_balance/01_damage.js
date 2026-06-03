// =========================================================================
// TOOL BALANCE — Escala de dano (vanilla fraco / modded forte)
// =========================================================================
// Em todo dano causado por um player, ajusta a quantidade conforme a arma
// na mão principal:
//   - ferramenta vanilla  → dano × vanillaDamageMult (fraco)
//   - arma/ferramenta modded (não-minecraft, com durabilidade) → × moddedDamageMult
// Creative/spectator passam batido.

;(function () {
  const TB = global.ToolBalance

  function bypass(player) {
    if (!player) return true
    var mode = String(player.gameMode || '')
    return mode === 'creative' || mode === 'spectator'
  }

  EntityEvents.hurt(function (event) {
    if (!TB) return
    var src = event.source
    if (!src || !src.player) return
    var player = src.player
    if (bypass(player)) return

    var weapon = player.mainHandItem
    if (!weapon || weapon.empty) return
    var id = String(weapon.id)

    var mult = 1.0
    if (TB.isVanilla(weapon)) {
      mult = TB.vanillaDamageMult
    } else if (id.indexOf('minecraft:') !== 0 && weapon.maxDamage > 0) {
      // não-vanilla e é item com durabilidade (ferramenta/arma)
      mult = TB.moddedDamageMult
    }

    if (mult !== 1.0) {
      event.setDamage(event.getDamage() * mult)
    }
  })
})()
