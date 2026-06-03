// =========================================================================
// F1 AGLUTINADO MÁGICO — VALIDATION SUITE (post-mod, fires on demand)
// =========================================================================
// Roda em ServerEvents.tick (após mods aplicarem). findRecipes() dentro de
// ServerEvents.recipes mostra estado PRÉ-modificação — inúteis pra validar
// overrides. Aqui usamos server.recipeManager (live state).
//
// Trigger: a cada /reload, o tick contador zera e teste roda 1× após delay.

;(function() {

var TICK_DELAY = 40  // 2 segundos após event tick começar
var _ranAtTick = -1

function itemExists(id) {
  try {
    var stack = Item.of(id)
    return !stack.isEmpty()
  } catch (e) { return false }
}

function logResult(pass, name) {
  if (pass) console.info('[F1-TEST] PASS — ' + name)
  else console.error('[F1-TEST] FAIL — ' + name)
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
  console.info('[F1-TEST] ═══════════════════════════════════════════════')
  console.info('[F1-TEST] F1 AGLUTINADO MÁGICO — POST-MOD VALIDATION')
  console.info('[F1-TEST] ═══════════════════════════════════════════════')

  var passed = 0, failed = 0
  function check(p, n) { if (logResult(p, n)) passed++; else failed++ }

  // 1. Items
  check(itemExists('kubejs:aglutinado_magico'), 'item aglutinado_magico')
  check(itemExists('kubejs:cursed_aglutinado_magico'), 'item cursed_aglutinado_magico')
  for (var i = 1; i <= 9; i++) {
    (function(i) {
      check(itemExists('kubejs:sourceberry_sack_x' + i), 'item sourceberry_sack_x' + i)
    })(i)
  }

  // 2. Deps
  check(itemExists('ars_nouveau:sourceberry_bush'), 'dep sourceberry_bush')
  check(itemExists('occultism:otherstone'), 'dep otherstone')
  check(itemExists('occultism:otherstone_slab'), 'dep otherstone_slab')
  check(itemExists('botania:livingwood_twig'), 'dep livingwood_twig')
  check(itemExists('allthecompressed:andesite_1x'), 'dep andesite_1x')
  check(itemExists('allthecompressed:andesite_2x'), 'dep andesite_2x')

  // 3. Recipes POST-mod (live recipeManager)
  function checkRecipes(itemId, expected, label) {
    var result = countRecipesForOutput(server, itemId)
    if (result.count < 0) {
      console.error('[F1-TEST] ERROR — ' + label + ': ' + result.error)
      failed++
      return
    }
    console.info('[F1-TEST] INFO — ' + label + ' = ' + result.count + ' (esperado ' + expected + ')')
    result.ids.forEach(function(id) { console.info('[F1-TEST]   ↳ ' + id) })
    check(result.count === expected, label)
  }

  checkRecipes('kubejs:aglutinado_magico', 1, 'recipe aglutinado_magico (1: mana_infusion)')
  checkRecipes('kubejs:cursed_aglutinado_magico', 3, 'recipe cursed (3: mill+crush+squeeze)')
  // sack_x1 = 2 caminhos: compact (9 berries → x1) + decompact (x2 → 9× x1)
  checkRecipes('kubejs:sourceberry_sack_x1', 2, 'recipe sack_x1 (2: compact + decompact_de_x2)')
  checkRecipes('integrateddynamics:squeezer', 1, 'recipe squeezer (1: custom override)')
  checkRecipes('create:andesite_alloy', 2, 'recipe andesite_alloy (2: aglutinado + decompact)')
  checkRecipes('botania:mana_pool', 1, 'recipe mana_pool (1: otherstone override)')
  checkRecipes('botania:diluted_pool', 1, 'recipe diluted_pool (1: otherstone_slab override)')
  checkRecipes('occultism:book_of_binding_foliot', 1, 'recipe book_of_binding_foliot (1: aglutinado gate)')

  // Apothecary gates pra seeds (datura) e sourceberry_bush:
  // - datura_seeds = 2: nosso apothecary (kubejs:petal_apothecary/datura_seeds)
  //   + crushing do Occultism (occultism:crushing/datura). A leitura anterior de
  //   "1" era artefato do CME (KubeJS×Silent Gear) que corrompia a remoção de
  //   recipes no stream paralelo; com os filtros de output trocados por id/type
  //   o CME sumiu e o estado correto (2) voltou.
  // - sourceberry_bush = 3: nosso apothecary + decompact/sourceberry_sack_x1
  //   (sack_x1 → 9 bush) + vanilla ars sourceberry_sack_to_bush. As três são
  //   intencionais. (Antes esperava 1, ignorando as duas decompactações.)
  // - sourceberry_sack = 1: vanilla ars (9 bushes → sack) — não tocamos
  checkRecipes('occultism:datura_seeds', 2, 'recipe datura_seeds (2: apothecary + occultism:crushing/datura)')
  checkRecipes('ars_nouveau:sourceberry_bush', 3, 'recipe sourceberry_bush (3: apothecary + decompact_x1 + vanilla ars)')
  checkRecipes('ars_nouveau:sourceberry_sack', 1, 'recipe sourceberry_sack (1: vanilla 9-bush)')

  console.info('[F1-TEST] ═══════════════════════════════════════════════')
  console.info('[F1-TEST] RESULT: ' + passed + '/' + (passed + failed) + ' passed (' + failed + ' failed)')
  console.info('[F1-TEST] ═══════════════════════════════════════════════')
}

ServerEvents.tick(function(event) {
  if (global._F1_TEST_SKIP) return
  var tc = event.server.tickCount
  if (_ranAtTick > 0 && tc - _ranAtTick < 600) return  // run once per 30s window
  if (tc < TICK_DELAY) return                          // wait for first delay
  if (_ranAtTick > 0) return                           // only once per server start
  _ranAtTick = tc
  runValidation(event.server)
})

})()
