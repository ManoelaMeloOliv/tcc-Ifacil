// Formato espelha o retorno previsto da API: GET /api/atendimentos
// Cada item corresponde a uma linha gravada pelo n8n no Postgres a cada conversa.

export const serviceStatus = {
  resolved: { label: 'Resolvido', className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  forwarded: { label: 'Encaminhado', className: 'bg-red-50 text-red-600 ring-red-100' },
  ongoing: { label: 'Em andamento', className: 'bg-amber-50 text-amber-700 ring-amber-100' },
}

export const serviceHistory = [
  { id: 1, initials: 'MM', name: 'Maria M.', phone: '+55 48 9****-1204', lastMessage: 'Qual o horário do curso técnico de informática?', topic: 'Horários', startedAt: '2026-06-17T10:31:00', messages: 6, responseTime: 1.2, status: 'resolved' },
  { id: 2, initials: 'JC', name: 'João C.', phone: '+55 48 9****-8871', lastMessage: 'Preciso de ajuda com minha matrícula.', topic: 'Matrícula', startedAt: '2026-06-17T09:13:00', messages: 11, responseTime: 2.4, status: 'forwarded' },
  { id: 3, initials: 'AS', name: 'Ana S.', phone: '+55 49 9****-3390', lastMessage: 'Quais documentos preciso para me inscrever no edital?', topic: 'Editais', startedAt: '2026-06-16T13:48:00', messages: 4, responseTime: 1.1, status: 'resolved' },
  { id: 4, initials: 'PL', name: 'Pedro L.', phone: '+55 48 9****-5527', lastMessage: 'O IFSC oferece curso de administração?', topic: 'Cursos', startedAt: '2026-06-16T11:20:00', messages: 3, responseTime: 0.9, status: 'resolved' },
  { id: 5, initials: 'FL', name: 'Fernanda L.', phone: '+55 49 9****-7412', lastMessage: 'Qual o prazo para entrega de documentos?', topic: 'Matrícula', startedAt: '2026-06-16T14:05:00', messages: 5, responseTime: 1.4, status: 'resolved' },
  { id: 6, initials: 'RB', name: 'Rafael B.', phone: '+55 48 9****-2098', lastMessage: 'Ainda não recebi resposta sobre a minha bolsa.', topic: 'Outros', startedAt: '2026-06-15T16:52:00', messages: 9, responseTime: 3.1, status: 'ongoing' },
  { id: 7, initials: 'CS', name: 'Carla S.', phone: '+55 48 9****-6631', lastMessage: 'Como funciona o curso de mecânica?', topic: 'Cursos', startedAt: '2026-06-15T08:37:00', messages: 7, responseTime: 1.3, status: 'resolved' },
  { id: 8, initials: 'LT', name: 'Lucas T.', phone: '+55 49 9****-4419', lastMessage: 'Quero falar com um atendente da secretaria.', topic: 'Outros', startedAt: '2026-06-14T15:26:00', messages: 12, responseTime: 2.8, status: 'forwarded' },
]

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' })
const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })

export function formatServiceDate(isoDate) {
  const date = new Date(isoDate)
  return `${dateFormatter.format(date)} ${timeFormatter.format(date)}`
}
