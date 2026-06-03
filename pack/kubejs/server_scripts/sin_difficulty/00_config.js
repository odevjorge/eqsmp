// =========================================================================
// SIN DIFFICULTY — Karma de mortes alimenta a dificuldade do Scaling Health
// =========================================================================
// Lore: a Deusa poupou a humanidade mas não a isentou de pagar pelos pecados.
// Matar criaturas pacíficas/neutras (inocentes) é PECADO  -> +dificuldade.
// Matar criaturas hostis (monstros) é PENITÊNCIA           -> -dificuldade.
//
// Magnitude por kill segue uma MÉDIA MÓVEL entre o kill atual e o anterior
// (momentum): delta = (valor_atual + valor_anterior) / 2
//   pacífico/neutro = +base   |   hostil (MobCategory.MONSTER) = -base
//
// O delta é somado à dificuldade do Scaling Health do jogador que matou
// (a mesma usada pelo modo distance_and_time / medidor de dificuldade).

global.SinDifficulty = {
  // valor-base de cada kill antes da média móvel (sua fórmula usa ±1)
  base: 1.0,

  // limites do Scaling Health (mechanics: minValue 0 / maxValue 250)
  minDifficulty: 0.0,
  maxDifficulty: 250.0,

  // overrides opcionais por id de entidade (têm prioridade sobre MobCategory):
  //   força contar como hostil (penitência, -base) mesmo que não seja MONSTER
  forceHostile: [],
  //   força contar como pacífico (pecado, +base) mesmo sendo MONSTER
  //   ex.: mover neutros como enderman/aranha pro lado do "pecado":
  //   forcePeaceful: ['minecraft:enderman', 'minecraft:spider', 'minecraft:cave_spider', 'minecraft:zombified_piglin']
  forcePeaceful: [],

  // entidades que NÃO contam de jeito nenhum (nem pecado nem penitência)
  exempt: ['minecraft:player', 'minecraft:armor_stand'],

  // se true, manda uma mensagem sutil (action bar) ao jogador quando a dificuldade muda
  feedbackInChat: false,

  // se true, loga cada mudança no console do servidor (use pra testar, depois desligue)
  debug: false,

  // chave NBT onde guardamos o valor do kill anterior (por jogador)
  prevKey: 'eqsmp_sin_prev_kill'
}
