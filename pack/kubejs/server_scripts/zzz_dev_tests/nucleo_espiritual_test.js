// =========================================================================
// F4 NÚCLEO ESPIRITUAL — VALIDATION SUITE
// =========================================================================
// Mesmo pattern do F1-F3. Cobre o caso especial: sequenced_assembly e
// terra_plate (Botania) podem ter quirks similares ao imbuement —
// validamos por ID quando getResultItem() não responde.

;(function() {

var TICK_DELAY = 100  // 5s — escalonado depois de F1-F3
var _ranAtTick = -1

function itemExists(id) {
  try {
    var stack = Item.of(id)
    return !stack.isEmpty()
  } catch (e) { return false }
}

function logResult(pass, name) {
  if (pass) console.info('[F4-TEST] PASS — ' + name)
  else console.error('[F4-TEST] FAIL — ' + name)
  return pass
}

function countRecipesForOutput(server, itemId) {
  try {
    var manager = server.recipeManager
    var registryAccess = server.registryAccess()
    var allRecipes = manager.getRecipes()
    var count = 0
    var matchedIds = []
    var iter = allRecipes.iterator()
    while (iter.hasNext()) {
      var r = iter.next()
      try {
        var result = r.getResultItem(registryAccess)
        if (result && !result.isEmpty()) {
          var resultId = String(result.getItem().builtInRegistryHolder().key().location())
          if (resultId === itemId) {
            count++
            matchedIds.push(String(r.getId()))
          }
        }
      } catch (e) { /* skip */ }
    }
    return { count: count, ids: matchedIds }
  } catch (e) {
    return { count: -1, ids: [], error: String(e) }
  }
}

function recipeIdExists(server, fullId) {
  try {
    var rl = Utils.id(fullId)
    return server.recipeManager.byKey(rl).isPresent()
  } catch (e) { return false }
}

function runValidation(server) {
  console.info('[F4-TEST] ═══════════════════════════════════════════════')
  console.info('[F4-TEST] F4 NÚCLEO ESPIRITUAL — POST-MOD VALIDATION')
  console.info('[F4-TEST] ═══════════════════════════════════════════════')

  var passed = 0, failed = 0
  function check(p, n) { if (logResult(p, n)) passed++; else failed++ }

  // 1. Items registrados
  check(itemExists('kubejs:nucleo_espiritual'), 'item nucleo_espiritual')
  check(itemExists('kubejs:cursed_nucleo_espiritual'), 'item cursed_nucleo_espiritual')

  // 2. Deps cross-mod (todas as 3 phases anteriores + Occultism origin)
  check(itemExists('occultism:soul_gem'), 'dep soul_gem (Occultism origin)')
  check(itemExists('kubejs:aglutinado_magico'), 'dep aglutinado_magico (F1 link)')
  check(itemExists('kubejs:nucleo_cinetico'), 'dep nucleo_cinetico (F2 link)')
  check(itemExists('kubejs:cristal_mana_pura'), 'dep cristal_mana_pura (F3 link)')
  check(itemExists('ars_nouveau:ritual_brazier'), 'dep ritual_brazier (gate target)')
  check(itemExists('botania:terrasteel_ingot'), 'dep terrasteel_ingot (gate target)')

  // 3. Recipes POST-mod
  function checkRecipes(itemId, expected, label) {
    var result = countRecipesForOutput(server, itemId)
    if (result.count < 0) {
      console.error('[F4-TEST] ERROR — ' + label + ': ' + result.error)
      failed++
      return
    }
    console.info('[F4-TEST] INFO — ' + label + ' = ' + result.count + ' (esperado ' + expected + ')')
    result.ids.forEach(function(id) { console.info('[F4-TEST]   ↳ ' + id) })
    check(result.count === expected, label)
  }

  // sequenced_assembly não tem output simples (chains com chance) — usa id
  check(recipeIdExists(server, 'kubejs:nucleo_espiritual/sequenced_assembly'),
        'recipe sequenced_assembly (id kubejs:nucleo_espiritual/sequenced_assembly)')

  // ritual_brazier: 1 receita pós-override (era 1 vanilla shapeless)
  checkRecipes('ars_nouveau:ritual_brazier', 1, 'recipe ritual_brazier (1: nucleo gate)')

  // terra_plate é um recipe type especial Botania; usa byKey
  check(recipeIdExists(server, 'kubejs:gates/terrasteel_ingot'),
        'recipe terrasteel_ingot (id kubejs:gates/terrasteel_ingot)')

  console.info('[F4-TEST] ═══════════════════════════════════════════════')
  console.info('[F4-TEST] RESULT: ' + passed + '/' + (passed + failed) + ' passed (' + failed + ' failed)')
  console.info('[F4-TEST] ═══════════════════════════════════════════════')
}

ServerEvents.tick(function(event) {
  if (global._F4_TEST_SKIP) return
  var tc = event.server.tickCount
  if (_ranAtTick > 0 && tc - _ranAtTick < 600) return
  if (tc < TICK_DELAY) return
  if (_ranAtTick > 0) return
  _ranAtTick = tc
  runValidation(event.server)
})

})()
