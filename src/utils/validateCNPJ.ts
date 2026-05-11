// Remove qualquer caractere não-numérico (pontos, barras, hífens)
export function sanitizeCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

// Valida o CNPJ usando o algoritmo oficial de dígitos verificadores da Receita Federal.
// Rejeita sequências repetidas (ex: "00000000000000") que passariam no cálculo mas são inválidas.
export function validateCNPJ(cnpj: string): boolean {
  const digits = sanitizeCNPJ(cnpj);

  if (digits.length !== 14) return false;
  // Sequências com todos os dígitos iguais são matematicamente válidas, mas não existem na base
  if (/^(\d)\1{13}$/.test(digits)) return false;

  // Calcula um dígito verificador a partir dos pesos fornecidos pela Receita Federal
  const calcDigit = (weights: number[]): number => {
    const sum = weights.reduce((acc, w, i) => acc + Number(digits[i]) * w, 0);
    const remainder = sum % 11;
    // Resto 0 ou 1 resulta em dígito 0 (regra do algoritmo)
    return remainder < 2 ? 0 : 11 - remainder;
  };

  // Primeiro dígito verificador usa pesos 5 a 2 seguidos de 9 a 2
  const first = calcDigit([5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (first !== Number(digits[12])) return false;

  // Segundo dígito verificador inclui o primeiro dígito verificador calculado acima
  const second = calcDigit([6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return second === Number(digits[13]);
}
