import { type TPosition } from '$lib/types/tooltip-args'

export function formatPhoneNumber(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '');
  const mainDigits = digits.slice(0, 10);
  const extDigits = digits.slice(10, 15);

  let formatted = mainDigits;

  // Progressive formatting: append dash as soon as 3 or 6 digits are reached
  if (mainDigits.length >= 6) {
    formatted = `${mainDigits.slice(0, 3)}-${mainDigits.slice(3, 6)}-${mainDigits.slice(6)}`;
  } else if (mainDigits.length >= 3) {
    formatted = `${mainDigits.slice(0, 3)}-${mainDigits.slice(3)}`;
  }

  // Handle extension triggering
  if (rawValue.includes(',') || extDigits.length > 0) {
    formatted += `, ext. ${extDigits}`;
  }

  return formatted;
}
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
export function isTPosition(anchor: any): { x: number, y: number } | boolean {
  let res = true
  if (typeof anchor !== 'object' && !Array.isArray(anchor) || Object.keys(anchor).length !== 2 || anchor === null) {
    return false;
  } else {
    let [a, b] = Array.isArray(anchor) ? anchor : [anchor.x, anchor.y];
    if (typeof a !== 'number' || Number.isNaN(a)) {
      res = false
    }
    if (typeof b !== 'number' || Number.isNaN(b)) {
      res = false
    }
    return res ? { x: a, y: b } : false
  }
}
export function isTStick(stick: any) {
  if (stick === undefined) {
    return false
  }
  return /(left|right|above|below)/.test(stick)
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