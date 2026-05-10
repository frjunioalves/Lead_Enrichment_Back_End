export function sanitizeCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

export function validateCNPJ(cnpj: string): boolean {
  const digits = sanitizeCNPJ(cnpj);

  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const calcDigit = (weights: number[]): number => {
    const sum = weights.reduce((acc, w, i) => acc + Number(digits[i]) * w, 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const first = calcDigit([5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (first !== Number(digits[12])) return false;

  const second = calcDigit([6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return second === Number(digits[13]);
}
