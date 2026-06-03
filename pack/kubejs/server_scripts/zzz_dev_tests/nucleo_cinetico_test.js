// =========================================================================
// F2 NÚCLEO CINÉTICO — VALIDATION SUITE (post-mod, fires on demand)
// =========================================================================
// Mesmo pattern do F1: ServerEvents.tick + server.recipeManager pra
// inspecionar estado pós-overrides (findRecipes inside ServerEvents.recipes
// mostra PRE-mod state).

;(function() {

var TICK_DELAY = 60  // 3s após F1-TEST pra não polluir log
var _ranAtTick = -1

function itemExists(id) {
  try {
    var stack = Item.of(id)
    return !stack.isEmpty()
  } catch (e) { return false }
}

function logResult(pass, name) {
  if (pass) console.info('[F2-TEST] PASS — ' + name)
  else console.error('[F2-TEST] FAIL — ' + name)
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
      } catch (e) { /* skip recipes that fail to resolve */ }
    }
    return { count: count, ids: matchedIds }
  } catch (e) {
    return { count: -1, ids: [], error: String(e) }
  }
}

function runValidation(server) {
  console.info('[F2-TEST] ═══════════════════════════════════════════════')
  console.info('[F2-TEST] F2 NÚCLEO CINÉTICO — POST-MOD VALIDATION')
  console.info('[F2-TEST] ═══════════════════════════════════════════════')

  var passed = 0, failed = 0
  function check(p, n) { if (logResult(p, n)) passed++; else failed++ }

  // 1. Items registrados
  check(itemExists('kubejs:nucleo_cinetico'), 'item nucleo_cinetico')
  check(itemExists('kubejs:cursed_nucleo_cinetico'), 'item cursed_nucleo_cinetico')

  // 2. Deps cross-mod (ingredientes do ritual + gates)
  check(itemExists('create:andesite_alloy'), 'dep andesite_alloy (F1 gate)')
  check(itemExists('create:precision_mechanism'), 'dep precision_mechanism')
  check(itemExists('ars_nouveau:source_gem'), 'dep source_gem')
  check(itemExists('occultism:otherstone'), 'dep otherstone')
  check(itemExists('botania:livingrock'), 'dep livingrock')
  check(itemExists('occultism:book_of_binding_bound_foliot'), 'dep book_of_binding_bound_foliot')
  check(itemExists('botania:runic_altar'), 'dep runic_altar (gate target)')
  check(itemExists('ars_nouveau:enchanting_apparatus'), 'dep enchanting_apparatus (gate target)')

  // 3. Recipes POST-mod
  function checkRecipes(itemId, expected, label) {
    var result = countRecipesForOutput(server, itemId)
    if (result.count < 0) {
      console.error('[F2-TEST] ERROR — ' + label + ': ' + result.error)
      failed++
      return
    }
    console.info('[F2-TEST] INFO — ' + label + ' = ' + result.count + ' (esperado ' + expected + ')')
    result.ids.forEach(function(id) { console.info('[F2-TEST]   ↳ ' + id) })
    check(result.count === expected, label)
  }

  // cursed: 1 receita (mechanical_crafting)
  checkRecipes('kubejs:cursed_nucleo_cinetico', 1, 'recipe cursed_nucleo (1: mechanical_crafting)')

  // nucleo: 1 receita (ritual foliot) — type occultism:ritual deve aparecer
  checkRecipes('kubejs:nucleo_cinetico', 1, 'recipe nucleo_cinetico (1: ritual foliot)')

  // runic_altar: 1 receita pós-override (originalmente 2: vanilla + alt)
  checkRecipes('botania:runic_altar', 1, 'recipe runic_altar (1: nucleo gate)')

  // enchanting_apparatus: 1 receita pós-override
  checkRecipes('ars_nouveau:enchanting_apparatus', 1, 'recipe enchanting_apparatus (1: nucleo gate)')

  console.info('[F2-TEST] ═══════════════════════════════════════════════')
  console.info('[F2-TEST] RESULT: ' + passed + '/' + (passed + failed) + ' passed (' + failed + ' failed)')
  console.info('[F2-TEST] ═══════════════════════════════════════════════')
}

ServerEvents.tick(function(event) {
  if (global._F2_TEST_SKIP) return
  var tc = event.server.tickCount
  if (_ranAtTick > 0 && tc - _ranAtTick < 600) return
  if (tc < TICK_DELAY) return
  if (_ranAtTick > 0) return
  _ranAtTick = tc
  runValidation(event.server)
})

})()
