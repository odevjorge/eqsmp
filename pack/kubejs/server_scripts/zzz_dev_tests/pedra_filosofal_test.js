// =========================================================================
// PEDRA FILOSOFAL — VALIDATION SUITE
// =========================================================================
// True endgame test — verifica item registrado + ritual recipe + todos os
// 4 signatures F1-F4 existem (mesmo que vazio).

;(function() {

var TICK_DELAY = 120
var _ranAtTick = -1

function itemExists(id) {
  try {
    var stack = Item.of(id)
    return !stack.isEmpty()
  } catch (e) { return false }
}

function logResult(pass, name) {
  if (pass) console.info('[PEDRA-TEST] PASS — ' + name)
  else console.error('[PEDRA-TEST] FAIL — ' + name)
  return pass
}

function recipeIdExists(server, fullId) {
  try {
    var rl = Utils.id(fullId)
    return server.recipeManager.byKey(rl).isPresent()
  } catch (e) { return false }
}

function runValidation(server) {
  console.info('[PEDRA-TEST] ═══════════════════════════════════════════════')
  console.info('[PEDRA-TEST] PEDRA FILOSOFAL — POST-MOD VALIDATION')
  console.info('[PEDRA-TEST] ═══════════════════════════════════════════════')

  var passed = 0, failed = 0
  function check(p, n) { if (logResult(p, n)) passed++; else failed++ }

  // 1. Item registrado
  check(itemExists('kubejs:pedra_filosofal'), 'item pedra_filosofal')

  // 2. Todos os 4 signatures F1-F4 (precondição lógica)
  check(itemExists('kubejs:aglutinado_magico'), 'dep aglutinado_magico (F1)')
  check(itemExists('kubejs:nucleo_cinetico'), 'dep nucleo_cinetico (F2)')
  check(itemExists('kubejs:cristal_mana_pura'), 'dep cristal_mana_pura (F3)')
  check(itemExists('kubejs:nucleo_espiritual'), 'dep nucleo_espiritual (F4)')

  // 3. Catalyst divino + activator F3-gated
  check(itemExists('minecraft:nether_star'), 'dep nether_star (catalisador divino)')
  check(itemExists('occultism:book_of_binding_bound_djinni'), 'dep bound_djinni (F3 activator)')

  // 4. Recipe registrado
  check(recipeIdExists(server, 'kubejs:pedra_filosofal/ritual_djinni'),
        'recipe ritual_djinni (id kubejs:pedra_filosofal/ritual_djinni)')

  console.info('[PEDRA-TEST] ═══════════════════════════════════════════════')
  console.info('[PEDRA-TEST] RESULT: ' + passed + '/' + (passed + failed) + ' passed (' + failed + ' failed)')
  console.info('[PEDRA-TEST] ═══════════════════════════════════════════════')
}

ServerEvents.tick(function(event) {
  if (global._PEDRA_TEST_SKIP) return
  var tc = event.server.tickCount
  if (_ranAtTick > 0 && tc - _ranAtTick < 600) return
  if (tc < TICK_DELAY) return
  if (_ranAtTick > 0) return
  _ranAtTick = tc
  runValidation(event.server)
})

})()
