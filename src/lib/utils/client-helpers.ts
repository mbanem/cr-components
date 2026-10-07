import { type TPosition } from '$lib/types/tooltip-args'
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
export function isTPosition(anchor: any): anchor is TPosition {
  if (typeof anchor !== 'object' || anchor === null) return false;
  if (typeof anchor.x !== 'number' || Number.isNaN(anchor.x)) return false
  if (typeof anchor.y !== 'number' || Number.isNaN(anchor.y)) return false
  return Object.keys(anchor).length === 2;
}
export function isTStick(stick: any) {
  if (stick === undefined) {
    return false
  }
  return /(left|rightabove|below)/.test(stick)
}

export function isTOnCloseThrowable(onclose: any) {
  if (typeof onclose !== 'function' || onclose.length > 0) {
    throwErr('OnClose should be of type () => void')
  }
}
export function isTShowOnThrowable(showon: any) {
  if (showon === undefined) {
    return 'click'
  }
  if (!/(mouseenter|mouseleave|click)/.test(showon)) {
    throwErr('ShowOn should be mouseenter, mouseleave or click')
  }
}
export function isTHideOnThrowable(hideon: any) {
  if (hideon === undefined) {
    return 'mouseleave'
  }
  if (hideon !== 'mouseleave') {
    throwErr('HideOn should be mouseleave or undefined')
  }
  return hideon // as only mouseout is involved 
}

export function throwErr(msg: string) {
  throw new Error(msg)
}