export const monthlyContacts = [
  { month: 'Jan', fullMonth: 'Janeiro', contacts: 684, resolved: 548, questions: 1320, responseTime: 1.8, topics: [34, 32, 20, 14] },
  { month: 'Fev', fullMonth: 'Fevereiro', contacts: 742, resolved: 601, questions: 1486, responseTime: 1.7, topics: [35, 31, 21, 13] },
  { month: 'Mar', fullMonth: 'Março', contacts: 891, resolved: 721, questions: 1742, responseTime: 1.5, topics: [36, 30, 22, 12] },
  { month: 'Abr', fullMonth: 'Abril', contacts: 836, resolved: 694, questions: 1638, responseTime: 1.6, topics: [37, 27, 23, 13] },
  { month: 'Mai', fullMonth: 'Maio', contacts: 972, resolved: 826, questions: 1904, responseTime: 1.4, topics: [39, 26, 22, 13] },
  { month: 'Jun', fullMonth: 'Junho', contacts: 1108, resolved: 953, questions: 2187, responseTime: 1.3, topics: [40, 28, 20, 12] },
  { month: 'Jul', fullMonth: 'Julho', contacts: 1248, resolved: 1086, questions: 2461, responseTime: 1.2, topics: [41, 29, 19, 11] },
  { month: 'Ago', fullMonth: 'Agosto', contacts: 1086, resolved: 934, questions: 2128, responseTime: 1.3, topics: [39, 31, 19, 11] },
  { month: 'Set', fullMonth: 'Setembro', contacts: 1194, resolved: 1039, questions: 2356, responseTime: 1.2, topics: [37, 33, 20, 10] },
  { month: 'Out', fullMonth: 'Outubro', contacts: 1312, resolved: 1154, questions: 2589, responseTime: 1.1, topics: [36, 32, 21, 11] },
  { month: 'Nov', fullMonth: 'Novembro', contacts: 1426, resolved: 1269, questions: 2814, responseTime: 1.1, topics: [37, 30, 22, 11] },
  { month: 'Dez', fullMonth: 'Dezembro', contacts: 1538, resolved: 1384, questions: 3042, responseTime: 1.0, topics: [38, 29, 21, 12] },
]

export const topicDistribution = [
  { name: 'Cursos', value: 38, color: '#059669' },
  { name: 'Matrícula', value: 29, color: '#10b981' },
  { name: 'Horários', value: 21, color: '#ef4444' },
  { name: 'Outros', value: 12, color: '#cbd5e1' },
]

export const frequentQuestions = [
  { position: 1, question: 'Quando começa o período de matrícula?', topic: 'Matrícula', amount: 486, trend: '+12%' },
  { position: 2, question: 'Quais cursos estão com inscrições abertas?', topic: 'Cursos', amount: 392, trend: '+8%' },
  { position: 3, question: 'Qual é o horário das aulas?', topic: 'Horários', amount: 347, trend: '+5%' },
]

export const dashboardSummary = {
  totalQuestions: 24667,
  totalContacts: 13037,
  botResolved: 11129,
  resolutionRate: 85.4,
  averageResponseTime: 1.3,
}

export function getTopicsForMonth(monthData) {
  return topicDistribution.map((topic, index) => ({
    ...topic,
    value: monthData.topics[index],
  }))
}

export function getQuestionsForMonth(monthData) {
  const baseContacts = monthlyContacts.at(-1).contacts
  const scale = monthData.contacts / baseContacts

  return frequentQuestions.map((question, index) => ({
    ...question,
    amount: Math.round(question.amount * scale * (1 + index * 0.025)),
  }))
}
