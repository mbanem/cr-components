function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  if (!value) return value
  switch (value.length) {
    case 3:
    case 7:
      return value + '-'
    case 13:
      return value + ' ext. '
  }
  return value
}
// Match 3, 3, 4, and up to 3 extension digits conditionally
// return digits.replace(
//   /^(\d{1,3})?(\d{1,3})?(\d{1,4})?(\d{1,3})?$/,
//   (_match, g1 = '', g2 = '', g3 = '', g4 = '') => {
//     let res = g1;
//     if (g2) res += `-${g2}`;
//     if (g3) res += `-${g3}`;
//     if (g4) res += ` .ext ${g4}`;
//     return res;
//   }
// );
export default formatPhoneNumber