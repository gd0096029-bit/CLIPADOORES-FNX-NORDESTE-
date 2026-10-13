/**
 * Conteúdo do Manual do clipador (vindo do "QG dos Clipadores Fênix").
 * Pra mudar um texto do manual, mude aqui.
 */

/** Contato do head do time. Deixe vazio enquanto não tiver o número. Ex.: "https://wa.me/5581999999999" */
export const HEAD_WHATSAPP = "";
/** Pasta com logo e materiais (Drive etc.). Deixe vazio enquanto não tiver o link. */
export const MATERIALS_URL = "";

export const WARMUP = [
  {
    when: "Dias 1 a 3",
    title: "Só consumir",
    text: 'Abre o app 2 a 3 vezes por dia, de 20 a 30 minutos. Pesquisa "concurso PM", "TAF PM" e "questões PM". Vídeo do nicho: assiste até o fim, curte e comenta. Vídeo fora do nicho: passa direto. Segue de 5 a 10 perfis por dia.',
  },
  {
    when: "Dias 3 a 5",
    title: "Montar o perfil",
    text: 'Foto, nome com a marca Fênix e bio curta, tipo "Questões e dicas pra PM todo dia". Continua consumindo o nicho todo dia.',
  },
  {
    when: "Tá pronta",
    title: "For You no nicho",
    text: "Quando quase todo vídeo do For You for de concurso policial, pode começar a postar.",
  },
  {
    when: "1ª semana",
    title: "Devagar e sempre",
    text: "1 clipe por dia. Depois sobe pra 2 a 4. Continua comentando e consumindo no nicho.",
  },
];

export const BURNS_ACCOUNT =
  "trocar de celular ou chip toda hora, usar VPN, seguir ou curtir em massa, postar logo depois de criar a conta, repostar clipe idêntico ao de outra conta (até do próprio time).";

export const STEPS = [
  {
    title: "Garimpar o momento",
    text: "Questão de prova resolvida, macete, frase forte, história de aprovado, notícia de edital, professor falando do curso.",
  },
  {
    title: "Editar o corte",
    text: 'Vertical 9:16, de 20 a 60 segundos, com começo, meio e fim. Corta silêncio e "ééé". Zoom leve a cada 3 a 5 segundos. Áudio ruim, descarta.',
  },
  {
    title: "Legenda e identidade",
    text: "Legenda grande, centralizada, no máximo 2 linhas, palavra-chave em dourado. Revisa o português. Logo da Fênix sempre no mesmo canto.",
  },
  {
    title: "Chamada pra ação",
    text: "Todo clipe manda pra algum lugar: link na bio e cupom na tela e na descrição. E 1 em cada 4 clipes é de venda direta, com o professor falando do curso.",
  },
  {
    title: "Postar",
    text: "De 2 a 4 por dia, espaçados. De 3 a 5 hashtags do nicho. Posta pelo app, sem marca d'água. Responde os comentários na primeira hora.",
  },
  {
    title: "Analisar os números",
    text: "Todo domingo, manda pro head os 3 melhores e os 3 piores clipes da semana, com retenção, visitas ao perfil e uso do cupom.",
  },
];

export interface ExampleAccount {
  label: string;
  handle: string;
  range: string;
  image: string;
  imageAlt: string;
  note?: string;
  tips: Array<{ title: string; text: string }>;
}

export const EXAMPLES: ExampleAccount[] = [
  {
    label: "Conta 1",
    handle: "@rodrigueswwz",
    range: "Vídeos de 17,8 mil a 111,9 mil visualizações",
    image: "/manual/conta-1.jpg",
    imageAlt: "Grade de vídeos da conta de exemplo 1 no TikTok",
    tips: [
      { title: "Capa com frase grande", text: "Texto enorme no meio do vídeo, legível só pela miniatura. A pessoa entende o assunto antes de dar play." },
      { title: "Meme de concurseiro", text: '"Estudamos por 4 horas, vamos tirar 700 no Enem" é a frase mais vista da conta (111,9 mil). Ironia que todo estudante reconhece gera identificação e compartilhamento.' },
      { title: "Sonho da farda", text: "Aprovados fardados, brasões da EsPCEx, ESA e EFOMM. Mostra onde o aluno quer chegar." },
      { title: "Frase motivacional forte", text: '"A prova não tem pena de quem não estudou." Curta, direta, dá vontade de salvar.' },
      { title: "Fênix no meme", text: "Comparativos e memes em que a fênix aparece como a escolha certa. Marca a Fênix sem parecer propaganda." },
      { title: "Print de aprovado", text: "Conversa real de quem passou e fez a mentoria da Fênix. Prova social sem precisar falar do curso." },
      { title: "Desafio de questão", text: '"Questão mais difícil de medicina" com a questão na tela. Provoca a pessoa a tentar resolver e comentar.' },
    ],
  },
  {
    label: "Conta 2",
    handle: "@bizu.abibreboucas",
    range: "Vídeos de 218 a 6.466 visualizações",
    image: "/manual/conta-2.jpg",
    imageAlt: "Grade de vídeos da conta de exemplo 2 no TikTok",
    note: "Ponto de atenção: os números são bem menores que os das outras contas. Funciona como referência de edição, mas falta gancho forte e meme pra estourar.",
    tips: [
      { title: "Corte puro do professor", text: "É o modelo mais parecido com o nosso: trecho de vídeo do professor falando direto pra câmera, sem cenário inventado." },
      { title: "Uma palavra por vez na tela", text: 'Legenda palavra por palavra, grande e no centro ("funciona", "vai", "hoje"). Prende o olho e dá ritmo.' },
      { title: "Palavra-tema gigante", text: '"POLÍCIA", "CONCURSO", "PREÇO" em letra enorme por cima do professor. Na grade do perfil já dá pra saber o assunto de cada vídeo.' },
      { title: "Preto e branco nos momentos fortes", text: "Os trechos mais sérios ficam em preto e branco. Muda o clima e destaca a frase." },
      { title: "Frase de impacto no topo", text: '"O mais difícil não é estudar, o mais difícil é pagar o preço." Frase que o concurseiro salva e manda pro amigo.' },
      { title: "Identidade fixa", text: "Mesmo enquadramento, mesma moldura arredondada e o @ sempre no mesmo lugar. Todo vídeo tem a cara da conta." },
    ],
  },
  {
    label: "Conta 3",
    handle: "@avante.concurseiro",
    range: "Vídeos fixados com 59,6 mil a 89,3 mil visualizações",
    image: "/manual/conta-3.jpg",
    imageAlt: "Vídeos fixados da conta de exemplo 3 no TikTok",
    tips: [
      { title: "Iceberg", text: '"Iceberg dos maiores concurseiros do Brasil" (59,6 mil). Formato de curiosidade que faz a pessoa assistir até o fim pra ver o fundo.' },
      { title: "Post estilo tweet", text: '"Define aura" (72,9 mil). Print simples de tweet, sem vídeo elaborado, que provoca muito comentário.' },
      { title: "Corte de podcast com faixa", text: 'Trecho de conversa com faixa vermelha e pergunta polêmica: "Beijar na boca ou matar questão?" (89,3 mil, o mais visto).' },
      { title: "Meme com a Fênix", text: 'O mesmo vídeo junta o corte com o meme dos dois caminhos e a marca "Banco Fênix Concursos Militares". Divulga sem parecer anúncio.' },
      { title: "Fixados escolhidos a dedo", text: "Os 3 vídeos fixados são os que mais bombaram. Quem cai no perfil vê logo o melhor conteúdo." },
    ],
  },
];

export const CHECKLIST = [
  "Gancho começa na frase mais forte, sem enrolação",
  "Texto do gancho no topo da tela",
  "Clipe entre 20 e 60 segundos, com começo, meio e fim",
  'Silêncios e "ééé" cortados',
  "Legenda revisada, sem erro de português",
  "Logo da Fênix no canto e cores do padrão",
  "Chamada pra ação no final",
  "Cupom na tela, na descrição e no comentário fixado",
  "Informação de edital conferida na fonte oficial",
  "Trecho anotado na planilha do time",
];

export const COMPETITION_RULES = [
  { title: "Postado no mês da competição.", text: "Post antigo não vale (herda views acumuladas) e é removido automaticamente. O clipe conta no mês em que foi enviado na área. Teu total é a soma das views dos clipes válidos." },
  { title: "Views atualizam sozinhas.", text: "Atualizam ao longo do dia, em todas as plataformas. Pode levar um tempo até o número mais recente aparecer." },
  { title: "Só @ cadastrado.", text: "Só contam clipes postados nos @ cadastrados e confirmados na tua conta." },
  { title: "Perfil limpo.", text: "O @ não pode divulgar casa de aposta ou jogo de azar, conteúdo ilegal, nem ter vínculo com concorrentes da Fênix (outros cursos). Violou, é banimento direto, sem advertência e sem prêmio." },
  { title: "Fraude tira da disputa.", text: "Views compradas, clipe de outra pessoa, conteúdo sem relação com a Fênix ou spam são removidos e podem levar a banimento." },
  { title: "Advertências.", text: '3 clipes removidos pela equipe valem 1 advertência. 3 advertências em 6 meses tiram o clipador da competição por 3 meses. Acompanha na aba "Advertências".' },
  { title: "Fechamento do mês.", text: 'O ranking é congelado. O prêmio aparece em "Prêmio" e é pago via Pix até o 5º dia útil do mês seguinte.' },
  { title: "Uso dos clipes.", text: "Ao enviar um clipe, tu autoriza a Fênix a repostar e reutilizar o conteúdo nos canais e materiais da marca." },
  { title: "Zera todo mês.", text: "A contagem recomeça do zero pra todo mundo no início de cada mês." },
  { title: "Termos de participação.", text: "Participar é aceitar os Termos: responsabilidade pelo que posta, conduta, fraude, uso dos clipes pela Fênix e participação de menor de 18 com responsável." },
];

export const GOLDEN_RULES = [
  "Nunca prometer aprovação garantida.",
  "Nunca inventar vaga, salário, data ou número. Edital só depois de conferir na fonte oficial.",
  "Nunca falar mal de outro cursinho ou professor.",
  "Nunca cortar o professor mudando o sentido do que ele falou.",
  "Nunca usar música ou imagem de terceiros sem permissão.",
  "Sempre deixar claro que o perfil é ligado à Fênix.",
  "Anotar o trecho na planilha do time antes de cortar.",
  "Responder comentário com educação, até crítica.",
];
