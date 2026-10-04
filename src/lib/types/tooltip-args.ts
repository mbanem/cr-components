export type TStick = 'left' | 'right' | 'above' | 'below';

export type TLaunchEvent = 'mouseenter' | 'mouseleave' | 'click'
export type TSHE = 'mouseenter'
export type TSHL = 'mouseleave'
export type TSHC = 'click';
export type TOnClose = () => void
export type TUserStyles = Record<string, string>

// A strict tuple requiring exactly one event, followed by exactly one number
export type TShow =
  | TSHE
  | TSHL
  | TSHC
export type THide = TSHL
// | `${TSHE}|${TSHL}`
// | `${TSHL}|${TSHE}`
// | number
// | [TSHC, number]
// | [TSHE | TSHL, number]
// | [`${TSHE}|${TSHL}` | `${TSHL}|${TSHE}`, number];



export type THovered = MouseEvent | HTMLElement;

export interface ITooltipOptions {
  anchor: THovered;
  content: HTMLElement | string;
  timeout: number
  showOn: TShow;
  hideOn: THide
  stick?: TStick;
  userStyles?: TUserStyles;
  onClose?: TOnClose;
}

// import type { ITooltipOptions , TStick, TLaunchEvent, TUserStyles, TShow, THide, TOnClose, THovered} from '$lib/types/tooltip'