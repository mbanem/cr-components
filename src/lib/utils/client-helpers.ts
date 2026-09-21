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