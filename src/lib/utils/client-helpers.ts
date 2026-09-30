export function capitalize(str: string): string {
  return (
    str
      // Insert space before capital letters and lowercase letters following digits
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      // Capitalize the first letter of every word
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

export const setTextColor = (varName: string, color: string) => {
  try {
    if (document) {
      const root = document.querySelector(':root') as HTMLElement;
      if (root) {
        root.style.setProperty(varName, color);
      }
    }
  } catch (err) {
    console.log('setTextColor', err);
  }
};

export const setCssVarColor = (varName: string, color: string) => {
  if (document) {
    document.documentElement.style.setProperty(varName, color);
    // setTextColor('--MESSAGE-COLOR', color === 'red' ? 'pink' : color);
  }
};
/* radio and checkbox list can accept new entry if in the following format
    'Brasilian French-Roast Coffee Melitta': 'Melitta',
    'Milka Chocolate Lila': ['Lila', true],
*/
export function isValidListFormat(input: string): boolean {
  const pattern = /["'](.+)['"]\s*["'](.+)['"]\s*,?\s*(\w+)\]?/
  // /^(?:'([^'\\]|\\.)*'|"([^"\\]|\\.)*")\s*:\s*(?:(?:'([^'\\]|\\.)*'|"([^"\\]|\\.)*")|\[\s*(?:'([^'\\]|\\.)*'|"([^"\\]|\\.)*")\s*,\s*(?:true|false)\s*\])$/;
  return pattern.test(input.trim().replace(/[\[\]:]/g, ''));
}