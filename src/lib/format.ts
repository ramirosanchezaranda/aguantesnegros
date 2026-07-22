export function formatPrice(value: number): string {
  return '$' + value.toLocaleString('es-AR')
}

export function installments(value: number, n = 3): string {
  return `${n} cuotas sin interés de ${formatPrice(Math.round(value / n / 10) * 10)}`
}
