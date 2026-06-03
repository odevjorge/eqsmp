// =========================================================================
// ITEM MODIFICATIONS — Tweaks em items registrados
// =========================================================================
// ItemEvents.modification roda no registro de items (startup), patch perma
// nos defaults da classe Item. Diferente de NBT runtime — afeta TODA instância.

;(function() {

ItemEvents.modification(function(event) {
  // Occultism chalks: durabilidade infinita.
  // Chalks são "ferramentas de cerimônia" pra desenhar círculos de invocação,
  // não consumíveis. Forçar recompra após cada ritual frustra sem agregar
  // challenge.
  // Fix: original tinha /chalk_*/ que só matcha "chalk" e "chalk_". Correto é
  // /chalk_.+/ pra pegar chalk_white, chalk_gold, chalk_purple, chalk_red.
  event.modify(/^occultism:chalk_.+/, function(item) {
    item.maxDamage = 0
  })
})

})()
