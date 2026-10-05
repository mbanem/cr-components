export type TStick = 'left' | 'right' | 'above' | 'below';
export type TOnClose = () => void
export type TContent = HTMLElement | string
export type TUserStyles = Record<string, string>

// A strict tuple requiring exactly one event, followed by exactly one number
export type TShow =
  | 'mouseenter'
  | 'mouseleave'
  | 'click'
export type THide = 'mouseleave'
export type THovered = MouseEvent | HTMLElement;
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

// import type { ITooltipOptions , THovered, TContent, TStick, TUserStyles, TShow, THide, TOnClose, } from '$lib/types/tooltip-args'