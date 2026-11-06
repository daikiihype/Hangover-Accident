// BIBLIOTECA DE DIÁLOGOS
// ----------------------------------------------------------------------------
// Para adicionar falas, basta editar este arquivo: a lógica do jogo não muda.
//
// Cada evento tem:
//   priority  — 1 (papo à toa) até 5 (crítico). Eventos mais importantes
//               interrompem conversas menos importantes.
//   cooldown  — segundos mínimos até o mesmo evento poder tocar de novo.
//   chance    — probabilidade (0–1) de o evento gerar conversa quando acontece.
//   conversations — lista de conversas. Cada conversa é uma lista de falas
//               [personagem, texto]. Personagens: 'joao', 'selva', 'lucas'.
//
// Falas TODAS EM MAIÚSCULAS tremem na tela (ideal para o Lucas).
// ----------------------------------------------------------------------------

export const CHARACTERS = {
  joao: { name: 'JOÃO', color: '#5ad1ff', portrait: 'portrait_joao', pitch: 330, wobble: 0.05 },
  selva: { name: 'SELVA', color: '#8bff6a', portrait: 'portrait_selva', pitch: 410, wobble: 0.35 },
  lucas: { name: 'LUCAS', color: '#ff5a5a', portrait: 'portrait_lucas', pitch: 270, wobble: 0.12 },
};

export const DIALOGUES = {
  run_start: {
    priority: 3, cooldown: 0, chance: 1,
    conversations: [
      [['lucas', 'Só uma regra: ninguém encosta no meu carro.'], ['selva', 'Anotado.'], ['joao', 'Ninguém anotou nada.']],
      [['joao', 'Rapaziada, BR livre, céu limpo. O que pode dar errado?'], ['lucas', 'NÃO FALA ISSO.']],
      [['selva', 'Bora que hoje a gente bate recorde.'], ['lucas', 'Recorde de quê?'], ['selva', 'Ainda não decidi.']],
      [['lucas', 'Cinto todo mundo?'], ['joao', 'Cinto, fé e um pouco de sorte.'], ['selva', 'Eu tô só com a fé.']],
      [['joao', 'Ok, plano: chegar vivo.'], ['selva', 'Plano B?'], ['joao', 'Chegar quase vivo.']],
      // v0.2
      [['lucas', 'Antes de sair: ninguém come, ninguém bebe, ninguém encosta em nada.'], ['selva', 'Posso respirar?'], ['lucas', 'Pelo nariz.']],
      [['joao', 'Tanque cheio?'], ['lucas', 'Meio.'], ['joao', 'Meio cheio ou meio vazio?'], ['lucas', 'Meio PREOCUPADO.']],
      [['selva', 'Hoje eu sinto que vai dar tudo certo.'], ['joao', 'Você falou isso da última vez.'], ['selva', 'E eu tava certo?'], ['joao', 'Não.']],
      [['lucas', 'Alguém viu minha chave reserva?'], ['selva', 'Tá no meu bolso.'], ['lucas', 'POR QUE TÁ NO SEU BOLSO?']],
      [['joao', 'Ok. Retrovisores, banco, cinto.'], ['selva', 'Pastel, refrigerante, playlist.'], ['lucas', 'Isso não é checklist de viagem, Selva.']],
      [['selva', 'Partiu.'], ['joao', 'Partiu pra onde?'], ['selva', 'Partiu, só. O resto a gente vê.']],
      [['lucas', 'Eu quero o carro de volta inteiro.'], ['joao', 'Define inteiro.'], ['lucas', 'COM AS QUATRO RODAS, JOÃO.']],
    ],
  },

  first_peugeot: {
    priority: 3, cooldown: 0, chance: 1,
    conversations: [
      [['joao', 'Olha lá, mais um.'], ['selva', 'Pô, os caras tão fazendo encontro?'], ['lucas', 'Só desvia, pelo amor de Deus.']],
      [['selva', 'Peugeot prata. Clássico.'], ['joao', 'Sempre prata. Nunca vi um de outra cor.'], ['lucas', 'FOCA NA ESTRADA.']],
      [['joao', 'Primeiro Peugeot da noite.'], ['lucas', 'Primeiro?'], ['joao', 'Confia, não vai ser o último.']],
      // v0.2
      [['selva', 'Olha, um Peugeot!'], ['joao', 'Agora já era. Onde tem um, tem vinte.'], ['lucas', 'Tipo barata?'], ['joao', 'Tipo barata.']],
      [['joao', 'Primeiro avistamento confirmado.'], ['selva', 'Anota aí no diário de bordo.'], ['lucas', 'Ninguém anota nada, segura o volante.']],
      [['lucas', 'Prata. É prata.'], ['selva', 'Calma, Lucas. É só um carro.'], ['lucas', 'É SEMPRE SÓ UM CARRO. ATÉ NÃO SER.']],
      [['selva', 'Será que é o mesmo Peugeot que a gente viu ontem?'], ['joao', 'Todos são o mesmo Peugeot, Selva.']],
    ],
  },

  peugeot: {
    priority: 1, cooldown: 14, chance: 0.35,
    conversations: [
      [['joao', 'Eu só queria entender por que todo Peugeot prata parece ter uma missão.']],
      [['selva', 'Se a gente fechar os olhos, o Peugeot desaparece.'], ['lucas', 'NINGUÉM FECHA O OLHO.']],
      [['joao', 'Mais um. Deve ter uma fábrica aqui do lado.'], ['selva', 'Ou uma loja de Peugeot usado de algum tio.']],
      [['selva', 'Esse aí me olhou estranho.'], ['joao', 'É um carro, Selva.'], ['selva', 'Ele sabe o que fez.']],
      [['lucas', 'POR QUE TODO PEUGEOT ANDA DEVAGAR NA ESQUERDA?'], ['joao', 'Tradição.']],
      [['joao', 'Peugeot prata na BR é igual pombo na praça.'], ['selva', 'Será que dá pra alimentar?']],
      [['selva', 'Aposto dez conto que o próximo também é prata.'], ['joao', 'Não vou apostar contra isso.']],
      // v0.1.1
      [['selva', 'Será que os Peugeot têm um grupo no zap?'], ['joao', 'Com certeza. E a gente é o assunto.']],
      [['lucas', 'Por que esse tá parado na faixa?'], ['joao', 'Ele não tá parado. Ele só tá sendo Peugeot.']],
      // v0.2
      [['joao', 'Eles devem vir de fábrica já com a faixa da esquerda incluída.']],
      [['selva', 'Se juntar todos esses Peugeot dá um Peugeot gigante?'], ['joao', 'Dá um engarrafamento.']],
      [['lucas', 'Ultrapassa com calma.'], ['selva', 'Ele tá a quarenta.'], ['lucas', 'ENTÃO COM MUITA CALMA.']],
      [['joao', 'Eu respeito. É um estilo de vida.'], ['selva', 'Andar devagar?'], ['joao', 'Andar devagar com convicção.']],
      [['selva', 'Acho que esse aí piscou pra mim.'], ['joao', 'Foi a seta.'], ['selva', 'Uma seta romântica.']],
      [['lucas', 'Por que ele freou do nada?'], ['joao', 'Peugeot não precisa de motivo.']],
      [['selva', 'Vou começar a contar os Peugeot.'], ['joao', 'Vai precisar de calculadora.']],
      [['joao', 'Eu acho que tem um Peugeot por quilômetro quadrado nessa BR.'], ['lucas', 'Isso nem é unidade de estrada.']],
      [['selva', 'Esse tem adesivo de família no vidro?'], ['joao', 'Tem. Pai, mãe, dois filhos e um Peugeot.']],
      [['lucas', 'NÃO COLA NA TRASEIRA DELE.'], ['selva', 'Ele que tá colando na nossa frente.']],
    ],
  },

  truck: {
    priority: 2, cooldown: 20, chance: 0.5,
    conversations: [
      [['selva', 'Eu acho que a gente devia cobrar pedágio desses caminhões.']],
      [['lucas', 'CAMINHÃO, CAMINHÃO, CAMINHÃO!'], ['joao', 'A gente tá vendo, Lucas. É do tamanho de um prédio.']],
      [['joao', 'Esse caminhão tem mais seguro que o Gol inteiro.'], ['lucas', 'O Gol TEM seguro.'], ['joao', 'Tem?'], ['lucas', '...não.']],
      [['selva', 'Bora pegar um vácuo nele.'], ['lucas', 'NÃO VAI PEGAR VÁCUO NENHUM.']],
      // v0.1.1
      [['joao', 'Caminhão tem prioridade por tamanho.'], ['selva', 'Então o Gol tem prioridade de quê?'], ['joao', 'De ser atropelado.']],
      // v0.2
      [['selva', 'Caminhão tem banheiro?'], ['joao', 'Esse não é o momento, Selva.'], ['selva', 'Mas tem?']],
      [['lucas', 'Distância. DISTÂNCIA DE CAMINHÃO.'], ['joao', 'Lucas, a gente tá a trinta metros.'], ['lucas', 'É POUCO PRA UM CAMINHÃO.']],
      [['joao', 'Olha o tamanho disso. A gente cabe no baú.'], ['selva', 'Com o Gol?'], ['joao', 'Com dois Gol.']],
      [['selva', 'Se o caminhão buzinar, a gente buzina de volta.'], ['lucas', 'NINGUÉM BUZINA PRA CAMINHÃO.']],
      [['joao', 'Caminhão na BR é tipo chefe de fase.'], ['selva', 'Tem barra de vida?'], ['joao', 'A nossa.']],
      [['lucas', 'Ele tá mudando de faixa?'], ['joao', 'Ele tá pensando.'], ['lucas', 'CAMINHÃO NÃO PENSA, CAMINHÃO VAI.']],
    ],
  },

  near_miss: {
    priority: 2, cooldown: 7, chance: 0.6,
    conversations: [
      [['lucas', 'AAAAAAAA!'], ['joao', 'Foi por pouco.'], ['selva', 'Eu nem vi.'], ['lucas', 'COMO ASSIM NÃO VIU?']],
      [['lucas', 'MEU RETROVISOR!'], ['joao', 'Ainda tá aí. Por enquanto.']],
      [['joao', 'Isso aí foi um centímetro. Talvez meio.'], ['lucas', 'EU SENTI O VENTO DO OUTRO CARRO.']],
      [['selva', 'Faz de novo!'], ['lucas', 'NÃO FAZ DE NOVO!']],
      [['lucas', 'JOÃO, NÃO ENCOSTA NO MEU CARRO!'], ['joao', 'Tecnicamente, eu não encostei.']],
      [['selva', 'Dava pra passar um papel ali no meio.'], ['joao', 'Um papel fino.']],
      [['lucas', 'MEU CORAÇÃO PAROU.'], ['selva', 'O motor não. Isso que importa.']],
      [['joao', 'Isso foi calculado.'], ['selva', 'Foi?'], ['joao', 'Não.']],
      // v0.1.1
      [['selva', 'Encostou?'], ['joao', 'Não.'], ['lucas', 'EU OUVI UM BARULHO!'], ['joao', 'Foi você gritando.']],
      [['joao', 'Lucas, respira.'], ['lucas', 'RESPIRA VOCÊ!']],
      [['selva', 'Eu vi minha vida passar.'], ['joao', 'Foi rápido?'], ['selva', 'Foi curta.']],
      // v0.2
      [['joao', 'Interessante. Eu vi minha alma sair e voltar.']],
      [['lucas', 'VOCÊ VIU AQUILO?'], ['selva', 'Vi.'], ['lucas', 'E NÃO FALOU NADA?'], ['selva', 'Eu tava vendo.']],
      [['selva', 'Que barulho foi esse?'], ['joao', 'O Lucas.'], ['lucas', 'FOI O VENTO!'], ['joao', 'Foi o Lucas.']],
      [['joao', 'Passamos.'], ['lucas', 'Passamos RASPANDO.'], ['joao', 'Raspando ainda é passar.']],
      [['lucas', 'O retrovisor dele quase beijou o meu!'], ['selva', 'Que lindo.']],
      [['selva', 'Dá pra fazer isso com os olhos fechados?'], ['joao', 'Uma vez só.'], ['lucas', 'NINGUÉM FECHA O OLHO!']],
      [['joao', 'Se tivesse um juiz, isso era impedimento.']],
      [['lucas', 'Eu tô suando no banco.'], ['selva', 'No meu banco?'], ['lucas', 'O BANCO É MEU, SELVA.']],
      [['selva', 'Senti cheiro de pneu.'], ['joao', 'É o cheiro da nossa decisão ruim.']],
      [['joao', 'Medição oficial: dois dedos de distância.'], ['lucas', 'DOIS DEDOS DE QUEM?']],
    ],
  },

  near_miss_streak: {
    priority: 3, cooldown: 18, chance: 1,
    conversations: [
      [['selva', 'Combo! Isso aqui virou fliperama.'], ['lucas', 'ISSO AQUI É O MEU CARRO!']],
      [['joao', 'Rapaziada, estatisticamente falando, isso aqui não tá muito bom.']],
      [['lucas', 'EU NÃO ACREDITO QUE VOCÊS ESTÃO RINDO!'], ['selva', 'Ninguém tá rindo.'], ['joao', 'Eu tô um pouco.']],
      [['joao', 'Lucas, teu carro tá desenvolvendo uma personalidade própria.'], ['lucas', 'ELE TÁ DESENVOLVENDO UM TRAUMA.']],
      // v0.1.1
      [['selva', 'Três seguidas! Isso é talento.'], ['lucas', 'ISSO É CRIME.']],
      [['joao', 'Tô começando a achar que é de propósito.'], ['selva', 'Óbvio que é.'], ['lucas', 'POR QUÊ?']],
      [['lucas', 'Vocês tão tentando ganhar ponto com o MEU carro?'], ['selva', 'Tem multiplicador, Lucas.']],
      // v0.2
      [['selva', 'Tá parecendo videogame.'], ['joao', 'Tá parecendo um videogame que a gente vai perder.']],
      [['lucas', 'PARA. DE. RASPAR.'], ['joao', 'Ele falou com pausa. É sério.']],
      [['joao', 'Eu tô começando a acreditar em sorte.'], ['selva', 'Eu sempre acreditei.'], ['lucas', 'EU TÔ COMEÇANDO A ACREDITAR EM SANTO.']],
      [['selva', 'Mais uma! Mais uma!'], ['lucas', 'Isso não é show, Selva!']],
      [['joao', 'Essa sequência vai pro relatório.'], ['lucas', 'Que relatório?'], ['joao', 'O do seguro.']],
    ],
  },

  // v0.1.1 — 5+ near misses seguidos
  near_miss_chain: {
    priority: 3, cooldown: 25, chance: 1,
    conversations: [
      [['selva', 'Cinco seguidas! Alguém tá contando?'], ['joao', 'Eu tô.'], ['lucas', 'EU TÔ CONTANDO OS ANOS DE VIDA QUE PERDI.']],
      [['joao', 'Isso aqui não é mais direção, é coreografia.'], ['selva', 'Bota uma música!']],
      [['lucas', 'Eu vou descer no próximo semáforo.'], ['joao', 'É uma BR, Lucas. Não tem semáforo.'], ['lucas', 'ENTÃO EU PULO.']],
      // v0.2
      [['joao', 'Ok, isso já é estatisticamente impossível.'], ['selva', 'E a gente tá fazendo.'], ['lucas', 'POR ISSO MESMO!']],
      [['selva', 'Acho que a gente tá ficando bom nisso.'], ['lucas', 'NÃO EXISTE FICAR BOM NISSO.']],
      [['lucas', 'Eu ouvi meu pai falando meu nome completo na minha cabeça.']],
      [['joao', 'Se isso fosse esporte, a gente tava na seleção.'], ['selva', 'Seleção de quê?'], ['joao', 'De gente que não aprende.']],
    ],
  },

  // v0.1.1 — multiplicador chegou ao máximo
  multiplier_max: {
    priority: 3, cooldown: 40, chance: 1,
    conversations: [
      [['selva', 'Multiplicador no máximo!'], ['joao', 'Agora é só não bater.'], ['lucas', 'ERA SÓ ISSO DESDE O COMEÇO!']],
      [['joao', 'Nível máximo de irresponsabilidade atingido.'], ['selva', 'Conquista desbloqueada.']],
      // v0.2
      [['selva', 'Cinco vezes! Isso vale alguma coisa?'], ['joao', 'Vale ponto.'], ['selva', 'Ponto troca por pastel?']],
      [['lucas', 'Quanto mais ponto, mais perto da morte. Essa é a regra?'], ['joao', 'Basicamente.']],
      [['joao', 'Máximo. A partir daqui é só manter a dignidade.'], ['selva', 'Nunca tivemos.']],
    ],
  },

  chat: {
    priority: 1, cooldown: 0, chance: 1,
    conversations: [
      [['selva', 'Alguém sabe se tem como colocar nitro nesse Gol?'], ['lucas', 'Não.'], ['selva', 'Não sabe ou não tem?'], ['lucas', 'OS DOIS.']],
      [['joao', 'Que horas são?'], ['selva', 'Hora de comer alguma coisa.'], ['lucas', 'Ninguém come no meu carro.']],
      [['selva', 'Vocês acham que peixe sente sono?'], ['joao', 'Agora? Essa é a pauta?']],
      [['joao', 'Alguém lembra onde a gente tava indo?'], ['selva', 'Pra frente.'], ['joao', 'Justo.']],
      [['selva', 'Coloca uma música aí.'], ['lucas', 'O rádio tá quebrado desde 2019.'], ['selva', 'Eu canto então.'], ['lucas', 'POR FAVOR NÃO.']],
      [['joao', 'Esse cheiro é do motor?'], ['lucas', 'É cheiro de carro novo.'], ['joao', 'O carro é de 2009.'], ['lucas', 'CHEIRO DE CARRO NOVO PRA ÉPOCA.']],
      [['selva', 'Se esse Gol fosse uma pessoa, ele seria qual de nós?'], ['joao', 'O Lucas. Nervoso e barulhento.'], ['lucas', 'EU NÃO SOU BARULHENTO.']],
      [['joao', 'Já reparou que a BR nunca acaba?'], ['selva', 'É redonda, igual a Terra.']],
      [['selva', 'Eu acho que vi um capivara.'], ['joao', 'UMA capivara.'], ['selva', 'Ele tinha cara de macho.']],
      [['lucas', 'Quem deixou essa lata de energético no banco?'], ['selva', 'Não sei.'], ['joao', 'Não sei.'], ['lucas', 'TÁ ABERTA E PELA METADE.']],
      [['joao', 'Lucas, quanto tu pagou nesse Gol?'], ['lucas', 'Não interessa.'], ['selva', 'Ou seja, caro.']],
      [['selva', 'Se a gente fosse uma banda, qual seria o nome?'], ['joao', 'Hangover Accident.'], ['selva', 'Pesado.'], ['lucas', 'Parece um aviso.']],
      // v0.1.1
      [['selva', 'Se a gente parar no posto, alguém compra pastel?'], ['joao', 'Ninguém vai parar em posto nenhum.']],
      [['joao', 'Lucas, por que tem uma toalha no banco de trás?'], ['lucas', 'Não pergunta.']],
      [['selva', 'Acho que esqueci minha carteira.'], ['joao', 'Esqueceu onde?'], ['selva', 'Na outra viagem.']],
      // v0.2
      [['selva', 'Se você pudesse ter qualquer superpoder, qual seria?'], ['joao', 'Teletransporte. Agora.'], ['lucas', 'Eu queria o poder de proteger o carro.']],
      [['joao', 'Lucas, qual a velocidade máxima desse Gol?'], ['lucas', 'A que a gente tá.'], ['joao', 'Isso não é resposta.'], ['lucas', 'É UMA AMEAÇA.']],
      [['selva', 'Vocês já pensaram que a estrada também tá se mexendo?'], ['joao', 'Não, porque não tá.']],
      [['lucas', 'Quem pegou meus óculos de sol?'], ['selva', 'Eu tô usando.'], ['lucas', 'É NOITE, SELVA.']],
      [['selva', 'Eu acho que a gente devia abrir um canal.'], ['joao', 'Canal de quê?'], ['selva', 'De viagem. Isso aqui é conteúdo.']],
      [['joao', 'Já reparou que toda placa da BR parece dizer "você vai se arrepender"?'], ['lucas', 'Isso é a placa de velocidade, João.']],
      [['selva', 'Pergunta séria.'], ['joao', 'Lá vem.'], ['selva', 'Pinguim tem joelho?'], ['lucas', 'POR QUE ISSO AGORA?']],
      [['joao', 'Lucas, teu painel tem uma luz acesa desde que a gente saiu.'], ['lucas', 'É decorativa.'], ['joao', 'Ela tá piscando.'], ['lucas', 'É DECORATIVA E ANIMADA.']],
      [['selva', 'Qual foi a melhor viagem da vida de vocês?'], ['joao', 'Uma que não tinha Peugeot.'], ['selva', 'Isso existe?']],
      [['lucas', 'Esse barulho na porta sempre teve.'], ['joao', 'Não foi isso que eu perguntei.'], ['lucas', 'Vocês iam perguntar.']],
      [['selva', 'Se o Gol falasse, o que ele ia dizer?'], ['joao', 'Socorro.'], ['lucas', 'Ele ia dizer que me ama.']],
      [['joao', 'Quanto tempo falta?'], ['selva', 'Pra onde?'], ['joao', 'Pra qualquer lugar.'], ['selva', 'Uns quarenta minutos.'], ['joao', 'Você nem sabe pra onde.']],
      [['selva', 'Eu tô com fome de novo.'], ['lucas', 'Você comeu um pacote de biscoito agora.'], ['selva', 'Por isso. Abriu o apetite.']],
      [['joao', 'Sabia que a gente tá passando por três cidades sem perceber?'], ['selva', 'Quais?'], ['joao', 'Não percebi.']],
    ],
  },

  argument: {
    priority: 1, cooldown: 0, chance: 1,
    conversations: [
      [['lucas', 'VOCÊS DOIS NÃO VÃO PAGAR UM PNEU DESSE!'], ['joao', 'A gente nem furou pneu.'], ['lucas', 'AINDA.']],
      [['joao', 'Selva, para de mexer no banco.'], ['selva', 'Tô procurando o botão de ejetar.'], ['lucas', 'NÃO TEM BOTÃO DE EJETAR!']],
      [['lucas', 'Quem tá com o pé no painel?'], ['selva', 'Ninguém.'], ['lucas', 'TEM UM TÊNIS NO PAINEL, SELVA.']],
      [['selva', 'Quem dirige melhor: eu ou o João?'], ['lucas', 'Ninguém aqui dirige. Isso é só sobrevivência.']],
      [['joao', 'Lucas, tu trocou o óleo desse carro alguma vez?'], ['lucas', 'Isso é pergunta que se faz agora?']],
      [['selva', 'Eu pago a gasolina.'], ['lucas', 'Você falou isso na última viagem.'], ['selva', 'E foi lindo.']],
      // v0.2
      [['lucas', 'Quem mexeu no meu banco?'], ['joao', 'Ninguém.'], ['lucas', 'TÁ TRÊS DEDOS PRA FRENTE.']],
      [['selva', 'O João tá roubando o ar-condicionado.'], ['joao', 'Como alguém rouba ar-condicionado?'], ['selva', 'Apontando a saída pra ele.']],
      [['joao', 'Selva, para de cantar.'], ['selva', 'Eu não tô cantando.'], ['joao', 'Você tá cantarolando.'], ['selva', 'Isso é outra coisa.']],
      [['lucas', 'Quem deixou areia no tapete?'], ['selva', 'A areia já tava aí.'], ['lucas', 'ESSE CARRO NUNCA VIU PRAIA.']],
      [['joao', 'Lucas, a gente divide a gasolina por três?'], ['lucas', 'Por três e meio. O Selva come muito.']],
      [['selva', 'Eu escolho a música agora.'], ['lucas', 'O rádio não funciona.'], ['selva', 'Então eu escolho o silêncio.']],
      [['lucas', 'Para de bater no vidro!'], ['selva', 'Tô fazendo bateria.'], ['lucas', 'NO MEU VIDRO NÃO.']],
      [['joao', 'Quem deu a ideia dessa viagem?'], ['selva', 'Você.'], ['joao', 'Ah, é. Então ninguém reclama.']],
      [['selva', 'O Lucas tá dirigindo no meu ouvido.'], ['lucas', 'Eu nem tô dirigindo!'], ['selva', 'Tá dirigindo emocionalmente.']],
      [['lucas', 'Vocês dois vão limpar o carro depois.'], ['joao', 'Com o quê?'], ['lucas', 'COM A CONSCIÊNCIA DE VOCÊS.']],
    ],
  },

  speed_up: {
    priority: 3, cooldown: 0, chance: 1,
    conversations: [
      [['joao', 'Acho que tem mais carro na pista agora.'], ['selva', 'Será que tem algum evento?'], ['lucas', 'O EVENTO SOMOS NÓS.']],
      [['lucas', 'Por que tá ficando mais rápido?'], ['joao', 'Eu tô me fazendo a mesma pergunta.']],
      [['selva', 'Sinto que a BR tá ficando mais apertada.'], ['joao', 'A BR não. O trânsito.']],
      [['joao', 'Isso aqui virou rush de sexta-feira.'], ['lucas', 'É TERÇA!']],
      // v0.2
      [['selva', 'Sinto o vento no meu cabelo.'], ['joao', 'A janela tá fechada.'], ['selva', 'É vento emocional.']],
      [['lucas', 'Alguém tá acelerando sem me consultar.'], ['joao', 'Ninguém consulta o Lucas.']],
      [['joao', 'O trânsito tá ficando mais criativo.'], ['lucas', 'Criativo não. PERIGOSO.']],
      [['selva', 'Esse ponteiro sobe sozinho?'], ['lucas', 'NÃO DEVERIA!']],
      [['joao', 'Cada quilômetro aparece mais carro. Acho que eles se reproduzem.'], ['selva', 'Peugeot com Peugeot?'], ['joao', 'Dá Peugeot.']],
      [['lucas', 'Eu tô sentindo o carro vibrar.'], ['selva', 'É empolgação.'], ['lucas', 'É O MOTOR PEDINDO AJUDA.']],
    ],
  },

  speed_extreme: {
    priority: 3, cooldown: 30, chance: 1,
    conversations: [
      [['joao', 'Acho que o velocímetro desistiu.'], ['selva', 'Tá marcando quanto?'], ['lucas', 'TÁ MARCANDO QUE EU VOU MATAR VOCÊS DOIS.']],
      [['selva', 'Tá tremendo tudo. É normal?'], ['lucas', 'NADA AQUI É NORMAL.']],
      [['joao', 'Eu não sabia que um Gol ia tão rápido.'], ['lucas', 'ELE NÃO VAI. ELE TÁ SOFRENDO.']],
      [['selva', 'Sinto que a gente tá viajando no tempo.'], ['joao', 'Para trás, pelo visto. O carro tá se desmontando.']],
      // v0.2
      [['selva', 'Uau. As árvores tão passando rápido.'], ['joao', 'A gente que tá passando rápido, Selva.']],
      [['lucas', 'EU NÃO SABIA QUE ESSE NÚMERO EXISTIA NO VELOCÍMETRO!']],
      [['joao', 'Eu acho que a gente quebrou alguma lei da física.'], ['selva', 'Só da física?']],
      [['selva', 'Se a gente acelerar mais, será que decola?'], ['lucas', 'NÃO É AVIÃO! É UM GOL!']],
      [['joao', 'O motor tá fazendo um barulho que eu nunca ouvi.'], ['lucas', 'É ELE ME XINGANDO.']],
      [['selva', 'Tô sentindo meu rosto ir pra trás.'], ['joao', 'É a gravidade desistindo de você.']],
    ],
  },

  police_arrive: {
    priority: 4, cooldown: 0, chance: 1,
    conversations: [
      [['joao', 'Tem uma viatura acompanhando a gente.'], ['selva', 'Deve ser fã.'], ['lucas', 'FÃ É O CARALHO, OLHA PRA FRENTE!']],
      [['selva', 'Que luz bonita é essa atrás?'], ['joao', 'É a polícia, Selva.'], ['selva', 'Ah. Ainda bonita.']],
      [['lucas', 'NÃO, NÃO, NÃO. A POLÍCIA NÃO.'], ['joao', 'Calma. Age natural.'], ['selva', 'Natural como?']],
      [['joao', 'Sirene. Atrás. Agora.'], ['lucas', 'EU NÃO FIZ NADA! O CARRO É MEU MAS EU NÃO FIZ NADA!']],
      // v0.2
      [['joao', 'Acho que temos um admirador.'], ['selva', 'Dá tchau.'], ['lucas', 'FÃ É O CARALHO, OLHA PRA FRENTE!']],
      [['selva', 'Tem um carro com luzinha atrás da gente.'], ['joao', 'É a polícia.'], ['selva', 'Ah, achei que era festa.']],
      [['lucas', 'Por que eles tão vindo? Por que eles tão vindo?'], ['joao', 'Talvez seja coincidência.'], ['lucas', 'NUNCA É COINCIDÊNCIA.']],
      [['joao', 'Ok, ninguém faz nada suspeito.'], ['selva', 'Tipo o quê?'], ['joao', 'Tipo tudo que a gente tá fazendo.']],
      [['selva', 'Eles tão indo pro mesmo lugar que a gente?'], ['lucas', 'ELES TÃO INDO ATRÁS DA GENTE!']],
      [['lucas', 'Meu Deus. Documento. Onde tá o documento?'], ['selva', 'Na sua carteira?'], ['lucas', 'ONDE TÁ MINHA CARTEIRA?']],
    ],
  },

  police_chase: {
    priority: 2, cooldown: 0, chance: 1,
    conversations: [
      [['selva', 'Será que se a gente acenar eles vão embora?'], ['lucas', 'NINGUÉM ACENA.']],
      [['joao', 'Rapaziada, eles ainda tão aí.'], ['lucas', 'EU SEI QUE ELES AINDA TÃO AÍ.']],
      [['selva', 'Bora fingir que é um desfile.'], ['joao', 'Desfile a duzentos por hora.']],
      [['lucas', 'Meu pai vai saber disso. Meu pai SEMPRE sabe.']],
      [['joao', 'Não faz nada arriscado. Eles tão de olho.'], ['selva', 'Define arriscado.']],
      [['selva', 'Se eles pararem a gente, quem fala?'], ['joao', 'O dono do carro.'], ['lucas', 'POR QUE EU?']],
      // v0.1.1
      [['joao', 'Se perguntarem, a gente tava indo pra igreja.'], ['selva', 'Que igreja?'], ['joao', 'Qualquer uma.']],
      [['selva', 'Eles tão filmando a gente?'], ['joao', 'Espero que não. Meu cabelo tá horrível.']],
      // v0.2
      [['selva', 'Eu acho que eles gostam da gente.'], ['joao', 'Tem jeitos mais tranquilos de demonstrar.']],
      [['lucas', 'Se eles pararem, ninguém faz piada.'], ['joao', 'Isso eu não posso prometer.']],
      [['joao', 'Eles tão seguindo a gente com uma dedicação admirável.'], ['selva', 'Será que é hora extra?']],
      [['selva', 'Liga a seta, pra mostrar que a gente é educado.'], ['lucas', 'ISSO NÃO VAI AJUDAR!']],
      [['lucas', 'Ninguém olha pra trás. Olhar pra trás é confissão.'], ['selva', 'Confissão de quê?'], ['lucas', 'DE TUDO!']],
      [['joao', 'Se perguntarem, o carro é do Lucas.'], ['lucas', 'O CARRO É MEU MESMO!'], ['joao', 'Viu? Já tá confessando.']],
    ],
  },

  police_close: {
    priority: 4, cooldown: 10, chance: 1,
    conversations: [
      [['lucas', 'ELES TÃO COLADOS NA GENTE!'], ['joao', 'Para de fazer manobra, tá chamando atenção!']],
      [['selva', 'Dá pra ver o bigode do policial.'], ['lucas', 'NÃO QUERO VER BIGODE NENHUM!']],
      [['joao', 'Tá ficando feio, galera.'], ['selva', 'Feio quanto?'], ['joao', 'Feio de ligar pra mãe.']],
      // v0.1.1
      [['selva', 'Acho que eles querem ultrapassar.'], ['joao', 'Eles não querem ultrapassar, Selva.']],
      [['lucas', 'PARA DE RASPAR NOS CARROS, ELES TÃO VENDO TUDO!'], ['joao', 'Tá bom, tá bom, dirigindo bonito agora.']],
      [['joao', 'Pressão subindo, rapaziada.'], ['selva', 'A minha também.']],
      // v0.2
      [['lucas', 'A SIRENE TÁ DENTRO DO CARRO?'], ['joao', 'Não, é você gritando junto.']],
      [['selva', 'Eles tão tão perto que dava pra pedir um isqueiro.'], ['lucas', 'NINGUÉM PEDE NADA!']],
      [['joao', 'A barrinha tá enchendo.'], ['selva', 'Que barrinha?'], ['joao', 'A da nossa vida.']],
      [['lucas', 'Para de raspar! Eles anotam tudo!'], ['selva', 'Será que eles dão nota?']],
    ],
  },

  // v0.1.1 — pressão policial quase no máximo (barra piscando)
  police_critical: {
    priority: 4, cooldown: 15, chance: 1,
    conversations: [
      [['lucas', 'ELES VÃO ENCOSTAR! ELES VÃO ENCOSTAR!'], ['joao', 'Dirige reto, sem gracinha!']],
      [['joao', 'Última chance de parecer inocente.'], ['selva', 'A gente nunca pareceu.']],
      [['selva', 'Tô vendo a placa deles no retrovisor.'], ['lucas', 'ISSO NÃO É BOM, SELVA!']],
      [['lucas', 'CALMA. NINGUÉM RASPA EM NADA AGORA.'], ['selva', 'E se for sem querer?'], ['lucas', 'NEM SEM QUERER!']],
      // v0.2
      [['joao', 'Rapaziada, essa é a hora de dirigir igual pai de família.'], ['selva', 'Meu pai dirige pior.']],
      [['lucas', 'EU NÃO QUERO SER PRESO NO MEU PRÓPRIO CARRO!']],
      [['selva', 'Bora se render?'], ['lucas', 'NÃO!'], ['joao', 'Não. Ainda.']],
      [['joao', 'Calma. Faixa do meio. Velocidade constante. Cara de inocente.'], ['selva', 'Que cara é essa?']],
      [['lucas', 'SE ENCOSTAREM NO MEU PARA-CHOQUE EU DESÇO E RECLAMO.'], ['joao', 'Da polícia?'], ['lucas', 'DE QUALQUER UM!']],
    ],
  },

  police_escape: {
    priority: 4, cooldown: 0, chance: 1,
    conversations: [
      [['selva', 'Sumiram!'], ['joao', 'Eles devem ter cansado.'], ['lucas', 'EU TAMBÉM CANSEI.']],
      [['joao', 'Despistamos.'], ['selva', 'A gente é tipo filme.'], ['lucas', 'Filme de terror.']],
      [['lucas', 'Eles foram embora?'], ['joao', 'Por enquanto.'], ['lucas', 'ODEIO ESSE POR ENQUANTO.']],
      [['selva', 'Eu sabia que acenar ia funcionar.'], ['joao', 'Você acenou?'], ['selva', 'Mentalmente.']],
      // v0.2
      [['joao', 'Ficaram pra trás.'], ['selva', 'Coitados.'], ['lucas', 'COITADOS É A GENTE.']],
      [['selva', 'Acho que eles desistiram.'], ['joao', 'Ou foram almoçar.'], ['selva', 'Uma hora dessas?']],
      [['lucas', 'Eu nunca mais quero ouvir uma sirene.'], ['selva', 'Nem de ambulância?'], ['lucas', 'NEM DE BRINQUEDO.']],
      [['joao', 'Ok, oficialmente despistamos a polícia.'], ['lucas', 'Não fala isso alto.'], ['joao', 'Despistamos a polícia.'], ['lucas', 'MAIS BAIXO!']],
      [['selva', 'Que pena, eu tava me acostumando com a luz azul.']],
      [['joao', 'Eles vão voltar.'], ['lucas', 'Como você sabe?'], ['joao', 'Eles sempre voltam.']],
    ],
  },

  record: {
    priority: 3, cooldown: 0, chance: 1,
    conversations: [
      [['joao', 'Rapaziada, recorde. Nunca chegamos tão longe.'], ['selva', 'Alguém tirou print?'], ['lucas', 'NINGUÉM TIRA PRINT DIRIGINDO!']],
      [['selva', 'Novo recorde!'], ['lucas', 'Recorde de quanto tempo meu carro aguenta vocês.']],
      [['joao', 'Isso aqui já entrou pra história.'], ['selva', 'Pra história da BR.'], ['lucas', 'PRA HISTÓRIA DA MINHA OFICINA.']],
      // v0.2
      [['joao', 'Rapaziada, se a gente parar agora, a gente vira lenda.'], ['lucas', 'ENTÃO PARA!'], ['selva', 'Lenda não para.']],
      [['selva', 'A gente é muito bom nisso.'], ['lucas', 'A gente é muito RUIM em parar.']],
      [['lucas', 'Eu não acredito que meu carro aguentou até aqui.'], ['joao', 'Nem ele.']],
      [['joao', 'Marca pessoal batida.'], ['selva', 'Vou contar pra minha mãe.'], ['lucas', 'NÃO CONTA PRA NINGUÉM!']],
      [['selva', 'Recorde novo! Comemora?'], ['joao', 'Comemora sem tirar a mão do volante.']],
    ],
  },

  // v0.2 — carro prata que NÃO é Peugeot (mesma cara de Peugeot)
  silver_car: {
    priority: 2, cooldown: 45, chance: 0.3,
    conversations: [
      [['selva', 'Aquele ali é Peugeot?'], ['joao', 'Prata, quatro rodas, sem pressa. É Peugeot até provar o contrário.']],
      [['joao', 'Esse é prata mas não é Peugeot.'], ['selva', 'Como você sabe?'], ['joao', 'Ele tá andando direito.']],
      [['lucas', 'Mais um prata.'], ['selva', 'Será que é um Peugeot disfarçado?'], ['joao', 'Um Peugeot à paisana.']],
      [['selva', 'Por que todo carro dessa estrada é prata?'], ['joao', 'Porque prata não mostra sujeira.'], ['lucas', 'Nem arranhão. Diferente do MEU.']],
      [['joao', 'Prata de novo. Essa BR tem tema.']],
      [['selva', 'Eu queria um carro prata.'], ['lucas', 'Traidor.']],
      [['lucas', 'É Peugeot ou não é?'], ['joao', 'Não importa, Lucas. A gente desvia igual.']],
      [['selva', 'Carro prata é tipo pombo de estrada.'], ['joao', 'Você já usou essa piada com o Peugeot.'], ['selva', 'Mas é verdade pros dois.']],
    ],
  },

  // v0.2 — fileira densa de veículos / situação absurda no trânsito
  traffic_absurd: {
    priority: 2, cooldown: 45, chance: 0.4,
    conversations: [
      [['joao', 'Ok, quem organizou essa barreira de carro?'], ['selva', 'Parece fila de banco.']],
      [['lucas', 'Eles tão lado a lado de propósito?'], ['joao', 'Acho que é uma reunião.'], ['selva', 'Sobre a gente?']],
      [['selva', 'Eles tão fazendo coreografia.'], ['joao', 'Uma coreografia muito lenta.']],
      [['joao', 'Três carros em linha. Isso é uma parede com rodas.'], ['lucas', 'E A GENTE É A BOLA!']],
      [['lucas', 'Não tem espaço!'], ['joao', 'Tem um buraquinho ali.'], ['lucas', 'O GOL NÃO É UM BURAQUINHO!']],
      [['selva', 'Eu vi um carro mudar de faixa sem seta.'], ['joao', 'Você viu um carro usar seta alguma vez nessa BR?']],
      [['joao', 'Engarrafamento a cento e cinquenta por hora. Só no Brasil.']],
      [['selva', 'Por que ninguém usa a faixa da direita?'], ['joao', 'A faixa da direita é lenda urbana.']],
      [['lucas', 'Esse ali tá no meio de duas faixas!'], ['joao', 'Ele não conseguiu escolher.'], ['selva', 'Me identifico.']],
      [['selva', 'Vocês acham que esses carros sabem que existem?'], ['joao', 'Selva, de onde vem isso?'], ['selva', 'Do coração.']],
    ],
  },

  // v0.2 — conversa espontânea com os três
  trio: {
    priority: 1, cooldown: 0, chance: 1,
    conversations: [
      [['selva', 'Se a gente fosse uma pizza, qual sabor cada um seria?'], ['joao', 'Eu seria calabresa. Clássico.'], ['lucas', 'Eu seria a que não queima no forno.'], ['selva', 'Eu seria a borda.']],
      [['joao', 'Votação: quem dirige melhor?'], ['selva', 'Eu.'], ['lucas', 'Eu.'], ['joao', 'Eu. Empate técnico entre três pessoas ruins.']],
      [['lucas', 'Promete que ninguém vai contar dessa viagem pra ninguém.'], ['selva', 'Prometo.'], ['joao', 'Prometo.'], ['selva', 'Já contei.']],
      [['selva', 'Música, conversa ou silêncio?'], ['joao', 'Silêncio.'], ['lucas', 'Silêncio.'], ['selva', 'Então eu conto uma história.']],
      [['joao', 'Se a gente parar no próximo posto, cada um tem cinco minutos.'], ['selva', 'Dez.'], ['lucas', 'Ninguém para. Isso aqui não é excursão.']],
      [['lucas', 'Vocês tão felizes?'], ['selva', 'Muito.'], ['joao', 'Razoavelmente.'], ['lucas', 'Eu não.']],
      [['selva', 'Eu acho que a gente devia fazer isso todo fim de semana.'], ['lucas', 'Não.'], ['joao', 'Não.'], ['selva', 'Vou considerar como talvez.']],
      [['joao', 'Daqui a dez anos a gente vai rir disso.'], ['lucas', 'Daqui a dez anos eu ainda vou estar pagando isso.'], ['selva', 'E rindo.']],
      [['selva', 'Quem tá com o celular?'], ['joao', 'Eu.'], ['lucas', 'Eu.'], ['selva', 'Então por que ninguém tá vendo o mapa?']],
      [['lucas', 'Cada um fala uma coisa boa sobre o Gol.'], ['joao', 'Ele liga.'], ['selva', 'Ele é vermelho.'], ['lucas', 'Vocês não merecem esse carro.']],
      [['joao', 'Alguém trouxe carregador?'], ['selva', 'Eu trouxe o cabo.'], ['lucas', 'E a tomada?'], ['selva', 'Achei que vinha no carro.']],
      [['selva', 'Se a gente se perder, qual é o ponto de encontro?'], ['joao', 'O Gol.'], ['lucas', 'O Gol ESTÁ com a gente.'], ['selva', 'Então ninguém se perde. Perfeito.']],
    ],
  },

  // v0.2 — pontuação passou de um marco (10k, 25k, 50k, 100k, 200k)
  score_milestone: {
    priority: 2, cooldown: 20, chance: 1,
    conversations: [
      [['selva', 'Olha a pontuação!'], ['joao', 'Não olha a pontuação. Olha a estrada.']],
      [['joao', 'Esse número já dá pra colocar no currículo.'], ['selva', 'Em qual área?'], ['joao', 'Fuga.']],
      [['lucas', 'Cada ponto desse é um ano a menos da minha vida.']],
      [['selva', 'Se fosse dinheiro, a gente pagava o conserto.'], ['lucas', 'QUE CONSERTO? NÃO VAI TER CONSERTO!']],
      [['joao', 'Já passamos da média nacional de decisões ruins.']],
      [['selva', 'Quantos pontos pra ganhar um Gol novo?'], ['lucas', 'EU NÃO QUERO UM GOL NOVO, EU QUERO ESSE INTEIRO.']],
      [['joao', 'Essa pontuação é impressionante e preocupante na mesma proporção.']],
      [['selva', 'A gente devia mandar isso pra alguém.'], ['joao', 'Pra quem?'], ['selva', 'Pra todo mundo.']],
    ],
  },

  // v0.2 — EASTER EGG: partida iniciada entre 00:00 e 00:59 no relógio do aparelho (50% de chance)
  egg_midnight: {
    priority: 3, cooldown: 0, chance: 1,
    conversations: [
      [['joao', 'Meia-noite em ponto.'], ['selva', 'Hora das coisas estranhas.'], ['lucas', 'Mais estranhas que isso?']],
      [['selva', 'Depois da meia-noite o Gol vira abóbora?'], ['lucas', 'NÃO FALA ISSO NEM BRINCANDO.']],
    ],
  },

  // v0.2 — EASTER EGG: 25 segundos de corrida sem nenhum comando do jogador
  egg_no_touch: {
    priority: 3, cooldown: 0, chance: 1,
    conversations: [
      [['selva', 'Ninguém tá dirigindo?'], ['joao', 'Eu achei que era você.'], ['lucas', 'O CARRO TÁ SOZINHO?']],
      [['joao', 'Interessante. O Gol aprendeu a dirigir.'], ['lucas', 'Alguém segura esse volante, por favor.']],
    ],
  },

  // v0.2 — EASTER EGG: 20 segundos colado na beira da pista (25% de chance)
  egg_shoulder: {
    priority: 3, cooldown: 0, chance: 1,
    conversations: [
      [['lucas', 'Por que a gente tá andando no acostamento?'], ['joao', 'Não é acostamento. É faixa VIP.']],
      [['selva', 'Vamos colher umas flores ali do lado?'], ['lucas', 'SAI DA BEIRADA!']],
    ],
  },

  // v0.2 — EASTER EGG: 90 segundos sem near miss, a partir do 3º estágio (15% de chance)
  egg_clean_minute: {
    priority: 3, cooldown: 0, chance: 1,
    conversations: [
      [['lucas', 'Faz um minuto que ninguém quase morre.'], ['joao', 'Tá estranho, né?'], ['lucas', 'É O MELHOR MINUTO DA MINHA VIDA.']],
      [['selva', 'Tá tranquilo demais.'], ['joao', 'Não fala isso.'], ['selva', 'Tá tranquilo demais.'], ['lucas', 'ELE FALOU DUAS VEZES!']],
    ],
  },

  // v0.2 — EASTER EGG: velocímetro passa por 222 km/h (8% de chance)
  egg_222: {
    priority: 3, cooldown: 0, chance: 1,
    conversations: [
      [['selva', 'Duzentos e vinte e dois! Faz um pedido!'], ['lucas', 'MEU PEDIDO É PARAR!']],
    ],
  },

  // v0.2 — EASTER EGG: a cada 10 partidas no mesmo aparelho (50% de chance)
  egg_tenth_run: {
    priority: 3, cooldown: 0, chance: 1,
    conversations: [
      [['joao', 'Décima vez que a gente faz essa viagem.'], ['selva', 'E a décima vez que você fala isso.'], ['lucas', 'E a décima vez que eu me arrependo.']],
      [['lucas', 'Vocês sabem quantas vezes esse carro já passou por isso?'], ['selva', 'Dez?'], ['lucas', 'EU NÃO QUERIA UM NÚMERO, SELVA.']],
    ],
  },

  // v0.2 — EASTER EGG: 3 pausas em menos de 20 segundos
  egg_pause_spam: {
    priority: 3, cooldown: 0, chance: 1,
    conversations: [
      [['joao', 'Tá pausando pra quê?'], ['selva', 'Pra rezar.'], ['lucas', 'Reza por mim também.']],
      [['selva', 'Por que o tempo fica parando?'], ['joao', 'Alguém lá fora tá com medo.'], ['lucas', 'Eu entendo essa pessoa.']],
    ],
  },

  // Falas únicas para o fim de partida (uma é sorteada)
  game_over: {
    priority: 5, cooldown: 0, chance: 1,
    conversations: [
      [['joao', 'Bom, pelo menos chegamos mais longe que da última vez.']],
      [['selva', 'Alguém tirou print?']],
      [['lucas', 'EU VOU MANDAR A CONTA PRA VOCÊS.']],
      [['joao', 'Estatisticamente, isso era inevitável.']],
      [['selva', 'De novo! Agora eu dirijo.']],
      [['lucas', 'MEU GOL. MEU GOLZINHO.']],
      [['joao', 'Lucas, olha pelo lado bom: agora ele é conversível.']],
      [['selva', 'Será que o seguro cobre Peugeot?']],
      [['lucas', 'NINGUÉM MAIS ENTRA NO MEU CARRO. NUNCA MAIS.']],
      // v0.2
      [['selva', 'Acho que o Gol morreu feliz.']],
      [['joao', 'Bom, tecnicamente ainda é um carro.']],
      [['lucas', 'EU AVISEI. EU AVISEI NO COMEÇO.']],
      [['selva', 'Dá pra continuar de onde parou?']],
      [['joao', 'Vou ser sincero: a culpa foi do Peugeot.']],
      [['lucas', 'Alguém tem o número de um guincho?']],
      [['selva', 'Pelo menos ninguém derrubou o pastel.']],
    ],
  },

  busted: {
    priority: 5, cooldown: 0, chance: 1,
    conversations: [
      [['lucas', 'O CARRO TÁ NO MEU NOME!']],
      [['selva', 'Boa noite, seu guarda. A gente é fã.']],
      [['joao', 'Pois é, seu policial... é uma longa história.']],
      [['lucas', 'EU AVISEI. EU AVISEI. EU AVISEI.']],
      // v0.2
      [['selva', 'A gente pode tirar foto com a viatura?']],
      [['joao', 'Seu guarda, eu posso explicar. Mas não vou.']],
      [['lucas', 'O DOCUMENTO TÁ NO PORTA-LUVAS! PODE OLHAR!']],
      [['selva', 'É multa ou é bronca? Porque bronca a gente aguenta.']],
      [['joao', 'Tecnicamente a gente só tava dirigindo muito.']],
    ],
  },
};
