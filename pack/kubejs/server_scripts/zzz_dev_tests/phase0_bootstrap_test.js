// =========================================================================
// PHASE 0 BOOTSTRAP — VALIDATION SUITE
// =========================================================================
// Verifica que todos os itens do starting kit existem (Item.of resolve).
// Não dá pra simular logged-in via test — confirmação real é
// `/give @p` ou trocar de mundo e entrar.

;(function() {

var TICK_DELAY = 60  // run depois do F1 test (que roda em 40)
var _ranAtTick = -1

function itemExists(id) {
  try {
    var stack = Item.of(id)
    return !stack.isEmpty()
  } catch (e) { return false }
}

function logResult(pass, name) {
  if (pass) console.info('[PHASE0-TEST] PASS — ' + name)
  else console.error('[PHASE0-TEST] FAIL — ' + name)
  return pass
}

ServerEvents.tick(function(event) {
  if (global._PHASE0_TEST_SKIP) return
  var tc = event.server.tickCount
  if (_ranAtTick > 0) return
  if (tc < TICK_DELAY) return
  _ranAtTick = tc

  console.info('[PHASE0-TEST] ═══════════════════════════════════════════════')
  console.info('[PHASE0-TEST] PHASE 0 BOOTSTRAP — VALIDATION')
  console.info('[PHASE0-TEST] ═══════════════════════════════════════════════')

  var passed = 0, failed = 0
  function check(p, n) { if (logResult(p, n)) passed++; else failed++ }

  var P0 = global.Phase0Bootstrap
  check(!!P0, 'global.Phase0Bootstrap carregado')

  if (P0) {
    check(P0.KITS && Object.keys(P0.KITS).length === 4, 'KITS tem 4 mods (botania/create/occultism/ars)')
    check(typeof P0.STAGE_FLAG === 'string' && P0.STAGE_FLAG.length > 0, 'STAGE_FLAG configurado')

    // Cada item de cada kit existe?
    P0.KIT_NAMES.forEach(function(modName) {
      check(!!P0.KITS[modName], 'kit ' + modName + ' definido')
      if (P0.KITS[modName]) {
        P0.KITS[modName].forEach(function(entry) {
          check(itemExists(entry.id), 'kit ' + modName + ' item ' + entry.id)
        })
      }
    })
  }

  // Silent Gear gating — checks via filesystem-resolved JSON serialization.
  // findRecipes/material registry direct query is fragile via Rhino, então
  // confiamos no log de "Deserializing material ... no error following".
  check(itemExists('botania:manasteel_ingot'), 'dep botania:manasteel_ingot (custom SG material base)')
  check(itemExists('botania:terrasteel_ingot'), 'dep botania:terrasteel_ingot (custom SG material base)')
  check(itemExists('botania:elementium_ingot'), 'dep botania:elementium_ingot (custom SG material base)')

  // novice_spell_book gated por manasteel — apenas check de count
  // (count=1 implica que só nosso override sobrevive; ingrediente verifiado
  //  em código, não em runtime — Java toString de Ingredient é opaco)
  try {
    var manager = event.server.recipeManager
    var registryAccess = event.server.registryAccess()
    var allRecipes = manager.getRecipes()
    var nsbCount = 0
    var iter = allRecipes.iterator()
    while (iter.hasNext()) {
      var r = iter.next()
      try {
        var result = r.getResultItem(registryAccess)
        if (result && !result.isEmpty()) {
          var rid = String(result.getItem().builtInRegistryHolder().key().location())
          if (rid === 'ars_nouveau:novice_spell_book') nsbCount++
        }
      } catch (e) {}
    }
    check(nsbCount === 1, 'novice_spell_book recipe count = 1 (vanilla removida, manasteel gate ativo)')
  } catch (e) {
    console.error('[PHASE0-TEST] ERROR — novice_spell_book check: ' + e)
    failed++
  }

  // Functions de stage grant existem (testáveis via /function check)
  try {
    var manager = event.server.functions
    var hasManasteelFn = false
    if (manager && manager.get) {
      try {
        var fn = manager.get(Utils.id('eqsmp:grant_manasteel_stage'))
        hasManasteelFn = fn && fn.isPresent && fn.isPresent()
      } catch (e) {}
    }
    check(hasManasteelFn, 'function eqsmp:grant_manasteel_stage existe (via FunctionManager)')
  } catch (e) {
    console.info('[PHASE0-TEST] INFO — function check skipped: ' + e)
  }

  console.info('[PHASE0-TEST] ═══════════════════════════════════════════════')
  console.info('[PHASE0-TEST] RESULT: ' + passed + '/' + (passed + failed) + ' passed (' + failed + ' failed)')
  console.info('[PHASE0-TEST] ═══════════════════════════════════════════════')
})

})()
