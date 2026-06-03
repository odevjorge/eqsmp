// =========================================================================
// TOOL BALANCE — Config
// =========================================================================
// Substitui o antigo "disable_vanilla_tools". As ferramentas vanilla VOLTAM
// a funcionar (craft + minerar + dano), mas ficam FRACAS — pouca durabilidade
// e pouco dano. Lore: a deusa poupou a humanidade da destruição, mas não a
// isentou de pagar pelos pecados — as ferramentas mortais perderam o gume.
//
// Em contrapartida, ferramentas/armas NÃO-vanilla batem MAIS forte (a
// dificuldade inicial do mundo é maior, então o progresso modded compensa).

;(function () {
  global.ToolBalance = {}
  const TB = global.ToolBalance

  const METALS = ['wooden', 'stone', 'iron', 'golden', 'diamond', 'netherite']
  const TYPES = ['pickaxe', 'sword', 'axe', 'shovel', 'hoe']

  TB.vanillaTools = []
  TB.vanillaSet = {}
  METALS.forEach(function (m) {
    TYPES.forEach(function (t) {
      var id = 'minecraft:' + m + '_' + t
      TB.vanillaTools.push(id)
      TB.vanillaSet[id] = true
    })
  })

  // Durabilidade nerfada por metal (vanilla original entre parênteses).
  TB.durability = {
    wooden: 8,     // (59)
    stone: 14,     // (131)
    iron: 24,      // (250)
    golden: 6,     // (32)
    diamond: 40,   // (1561)
    netherite: 60  // (2031)
  }

  // Multiplicadores de dano de ataque corpo-a-corpo.
  TB.vanillaDamageMult = 0.4   // vanilla bate fraco
  TB.moddedDamageMult = 1.25   // modded bate mais forte

  TB.MESSAGES = {
    weak: '§7Enfraquecida pela deusa',
    hint: '§8O gume mortal foi tomado — forje as suas próprias armas'
  }

  TB.isVanilla = function (item) {
    return !!(item && TB.vanillaSet[String(item.id)])
  }

  // metal a partir do id 'minecraft:<metal>_<tipo>'
  TB.metalOf = function (id) {
    return String(id).split(':')[1].split('_')[0]
  }
})()
