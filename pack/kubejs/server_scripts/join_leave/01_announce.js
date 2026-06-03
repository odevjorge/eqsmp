// =========================================================================
// JOIN/LEAVE — anúncio colorido de entrada e saída
// =========================================================================
//   [EQSMP] [+] Player <nick> entrou no servidor.   (verde)
//   [EQSMP] [-] Player <nick> saiu no servidor.      (vermelho)
//
// Cores: colchetes cinza · "EQSMP" dourado · sinal +/- e a mensagem em
// verde (entrar) / vermelho (sair) · nick em branco pra destacar.

;(function () {
  // wrappers JS pros métodos de cor (evita passar referência de método Java no Rhino)
  function green(s) { return Text.green(s) }
  function red(s) { return Text.red(s) }

  function buildLine(nick, sign, verbo, colorFn) {
    return Text.gray('[')
      .append(Text.gold('EQSMP'))
      .append(Text.gray('] '))
      .append(Text.gray('['))
      .append(colorFn(sign))
      .append(Text.gray('] '))
      .append(colorFn('Player '))
      .append(Text.white(nick))
      .append(colorFn(' ' + verbo + ' no servidor.'))
  }

  PlayerEvents.loggedIn(function (event) {
    try {
      event.server.tell(buildLine(event.player.username, '+', 'entrou', green))
    } catch (e) { console.error('[JoinLeave] erro no loggedIn: ' + e) }
  })

  PlayerEvents.loggedOut(function (event) {
    try {
      event.server.tell(buildLine(event.player.username, '-', 'saiu', red))
    } catch (e) { console.error('[JoinLeave] erro no loggedOut: ' + e) }
  })

  console.info('[JoinLeave] anuncio de entrada/saida ativo')
})()
