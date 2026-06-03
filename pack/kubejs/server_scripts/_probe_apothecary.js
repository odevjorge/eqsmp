ServerEvents.tick(function(event) {
  if (global._APOTH_PROBED) return
  if (event.server.tickCount < 200) return
  global._APOTH_PROBED = true
  var mgr = event.server.recipeManager
  var all = mgr.getRecipes()
  var apoth = []
  all.forEach(function(r) {
    var t = String(r.getType ? r.getType() : (r.type || ''))
    if (t.indexOf('petal_apothecary') !== -1 || t.indexOf('apothecary') !== -1) {
      var id = String(r.getId())
      var out = r.getResultItem ? r.getResultItem(null) : (r.result || '?')
      apoth.push(id + ' -> ' + String(out))
    }
  })
  console.info('[APOTH-PROBE] count: ' + apoth.length)
  apoth.forEach(function(s) { console.info('[APOTH-PROBE] ' + s) })
})
