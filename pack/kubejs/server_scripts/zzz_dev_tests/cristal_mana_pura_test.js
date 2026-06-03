// =========================================================================
// F3 CRISTAL DE MANA PURA — VALIDATION SUITE
// =========================================================================
// Mesmo pattern do F1/F2: ServerEvents.tick + server.recipeManager.
// Trigger: a cada /reload, roda 1× após delay.

;(function() {

var TICK_DELAY = 80  // 4s — escalonado depois de F1 (40) e F2 (60)
var _ranAtTick = -1

function itemExists(id) {
  try {
    var stack = Item.of(id)
    return !stack.isEmpty()
  } catch (e) { return false }
}

function logResult(pass, name) {
  if (pass) console.info('[F3-TEST] PASS — ' + name)
  else console.error('[F3-TEST] FAIL — ' + name)
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

// Ars Nouveau's ImbuementRecipe.getResultItem() returns ItemStack.EMPTY
// (the recipe stores output as ItemStack mas só popula via getRecipeOutput()
// custom). Pra detectar essas recipes usamos byRecipeId() direto.
function recipeIdExists(server, fullId) {
  try {
    var manager = server.recipeManager
    var rl = Utils.id(fullId)
    var opt = manager.byKey(rl)
    return opt.isPresent()
  } catch (e) {
    return false
  }
}

function runValidation(server) {
  console.info('[F3-TEST] ═══════════════════════════════════════════════')
  console.info('[F3-TEST] F3 CRISTAL DE MANA PURA — POST-MOD VALIDATION')
  console.info('[F3-TEST] ═══════════════════════════════════════════════')

  var passed = 0, failed = 0
  function check(p, n) { if (logResult(p, n)) passed++; else failed++ }

  // 1. Items registrados
  check(itemExists('kubejs:cristal_mana_pura'), 'item cristal_mana_pura')
  check(itemExists('kubejs:cursed_cristal_mana_pura'), 'item cursed_cristal_mana_pura')

  // 2. Deps cross-mod
  check(itemExists('botania:mana_pearl'), 'dep mana_pearl (Botania origin)')
  check(itemExists('botania:runic_altar'), 'dep runic_altar (F2-gated bloco)')
  check(itemExists('ars_nouveau:imbuement_chamber'), 'dep imbuement_chamber')
  check(itemExists('ars_nouveau:source_gem'), 'dep source_gem (pedestal)')
  check(itemExists('kubejs:nucleo_cinetico'), 'dep nucleo_cinetico (F2 link)')
  check(itemExists('occultism:book_of_binding_djinni'), 'dep book_of_binding_djinni (gate target)')
  check(itemExists('create:mechanical_arm'), 'dep mechanical_arm (gate target)')

  // 3. Recipes POST-mod
  function checkRecipes(itemId, expected, label) {
    var result = countRecipesForOutput(server, itemId)
    if (result.count < 0) {
      console.error('[F3-TEST] ERROR — ' + label + ': ' + result.error)
      failed++
      return
    }
    console.info('[F3-TEST] INFO — ' + label + ' = ' + result.count + ' (esperado ' + expected + ')')
    result.ids.forEach(function(id) { console.info('[F3-TEST]   ↳ ' + id) })
    check(result.count === expected, label)
  }

  // cursed: 1 receita (runic_altar) — IMPORTANTE detectar silent rejection
  checkRecipes('kubejs:cursed_cristal_mana_pura', 1, 'recipe cursed (1: runic_altar)')

  // cristal: ars_nouveau:imbuement não responde a getResultItem() — usa byKey
  check(recipeIdExists(server, 'kubejs:cristal_mana_pura/imbuement'),
        'recipe cristal (imbuement) — id kubejs:cristal_mana_pura/imbuement')

  // djinni: 1 receita pós-override (originalmente 2: full + from_empty)
  checkRecipes('occultism:book_of_binding_djinni', 1, 'recipe book_of_binding_djinni (1: cristal gate)')

  // mechanical_arm: 1 receita pós-override
  checkRecipes('create:mechanical_arm', 1, 'recipe mechanical_arm (1: cristal gate)')

  console.info('[F3-TEST] ═══════════════════════════════════════════════')
  console.info('[F3-TEST] RESULT: ' + passed + '/' + (passed + failed) + ' passed (' + failed + ' failed)')
  console.info('[F3-TEST] ═══════════════════════════════════════════════')
}

ServerEvents.tick(function(event) {
  if (global._F3_TEST_SKIP) return
  var tc = event.server.tickCount
  if (_ranAtTick > 0 && tc - _ranAtTick < 600) return
  if (tc < TICK_DELAY) return
  if (_ranAtTick > 0) return
  _ranAtTick = tc
  runValidation(event.server)
})

})()
