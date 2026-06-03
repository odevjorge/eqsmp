// =========================================================================
// CROSS-MOD GATES — Items
// =========================================================================
// kubejs:mana_pane — vidro infundido com source_fluid (cross-mod Botania ↔ Ars).
// Usado em recipes que conectam mods (ex: create:goggles).

StartupEvents.registry('item', event => {
  event.create('kubejs:mana_pane')
    .displayName('§dMana Pane')
    .tooltip('§7Vidro infundido com mana e source fluid')
    .texture('botania:item/manasteel_nugget')
    .glow(true)
})
