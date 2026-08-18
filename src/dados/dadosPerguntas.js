// Formato espelha o retorno previsto da API: GET /api/respostas
// Ao ligar no backend, trocar este import por um fetch mantendo os mesmos campos.

export const categories = [
  { id: 1, name: 'Cursos', color: 'emerald' },
  { id: 2, name: 'Matrícula', color: 'amber' },
  { id: 3, name: 'Horários', color: 'red' },
  { id: 4, name: 'Editais', color: 'sky' },
  { id: 5, name: 'Outros', color: 'slate' },
]

export const standardAnswers = [
  {
    id: 1,
    question: 'Qual o horário de aula dos cursos?',
    answer: 'Os horários variam por curso. Consulte o site oficial do IFSC Tubarão na seção "Cursos" para ver o turno e os horários de cada turma.',
    categoryId: 3,
    active: true,
    updatedAt: '2026-06-14T10:32:00',
  },
  {
    id: 2,
    question: 'Como me inscrever no ensino médio integrado?',
    answer: 'As inscrições são realizadas pelo edital publicado no site do IFSC. É necessário ter concluído o ensino fundamental e realizar a inscrição dentro do prazo divulgado.',
    categoryId: 2,
    active: true,
    updatedAt: '2026-06-12T15:04:00',
  },
  {
    id: 3,
    question: 'Quais documentos preciso para a matrícula?',
    answer: 'RG, CPF, comprovante de residência, histórico escolar, certidão de nascimento e uma foto 3x4. A lista completa consta no edital vigente.',
    categoryId: 2,
    active: true,
    updatedAt: '2026-06-10T09:21:00',
  },
  {
    id: 4,
    question: 'Quais cursos o IFSC Tubarão oferece?',
    answer: 'O câmpus oferece cursos técnicos, superiores e de formação inicial e continuada (FIC). A oferta de cada semestre é publicada no edital do processo seletivo.',
    categoryId: 1,
    active: true,
    updatedAt: '2026-06-08T14:47:00',
  },
  {
    id: 5,
    question: 'Quando sai o resultado do processo seletivo?',
    answer: 'A data do resultado está no cronograma do edital. Acompanhe pelo site oficial e pelo e-mail informado na inscrição.',
    categoryId: 4,
    active: true,
    updatedAt: '2026-06-05T11:15:00',
  },
  {
    id: 6,
    question: 'O IFSC oferece curso de administração?',
    answer: 'A oferta varia a cada processo seletivo. Consulte o edital vigente para conferir os cursos disponíveis no câmpus Tubarão.',
    categoryId: 1,
    active: false,
    updatedAt: '2026-05-28T16:39:00',
  },
]

export function getCategory(categoryId) {
  return categories.find((category) => category.id === categoryId) ?? categories.at(-1)
}
