export const periodoVazio = { dia: '', horaInicio: '', horaFim: '' }

export function diaLocal(deslocamentoDias = 0) {
  const data = new Date()
  data.setDate(data.getDate() + deslocamentoDias)
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${data.getFullYear()}-${mes}-${dia}`
}

// "09/11" ou "09/11, 14:00–15:30"
export function descreverPeriodo({ dia, horaInicio, horaFim }) {
  if (!dia) return ''
  const [, mes, diaMes] = dia.split('-')
  const horas = horaInicio || horaFim ? `, ${horaInicio || '00:00'}–${horaFim || '23:59'}` : ''
  return `${diaMes}/${mes}${horas}`
}
