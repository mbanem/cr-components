export type TStick = 'left' | 'right' | 'above' | 'below';
export type TOnClose = () => void
export type TPosition = { x: number, y: number }
export type TContent = HTMLElement | string
export type TUserStyles = Record<string, string>

// A strict tuple requiring exactly one event, followed by exactly one number
export type TShow =
  | 'mouseenter'
  | 'mouseleave'
  | 'click'
export type THide = 'mouseleave'
export type THovered = MouseEvent | HTMLElement | TPosition;
export interface ITooltipOptions {
  anchor: THovered;
  content: TContent;
  timeout: number
  showOn: TShow;
  hideOn: THide
  stick?: TStick;
  userStyles?: TUserStyles;
  onClose?: TOnClose;
}
export type TZeroArgs<T extends (...args: any[]) => any> =
  [] extends Parameters<T>
  ? [Parameters<T>[number]] extends [never]
  ? T
  : never
  : never;
// import type { ITooltipOptions , THovered, TPosition, TContent, TStick, TZeroArgs, TUserStyles, TShow, THide, TOnClose, } from '$lib/types/tooltip-args'