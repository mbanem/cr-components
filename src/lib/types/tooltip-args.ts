export type TStick = 'left' | 'right' | 'above' | 'below';
export type TOnClose = (eventStr?: string, inners?: string) => void
export type TPosition = { x: number, y: number } | [x: number, y: number]
export type TContent = HTMLElement | string
export type TUserStyles = Record<string, string>
// A strict tuple requiring exactly one event, followed by exactly one number
export type TShow =
  | 'mouseenter'
  | 'mouseleave'
  | 'click'
export type THide = 'mouseleave'
export type THovered = MouseEvent | HTMLElement | TPosition;
// export interface ITooltipOptions {
//   anchor: THovered;
//   content: TContent;
//   timeout: number
//   showOn: TShow;
//   hideOn: THide
//   stick?: TStick;
//   userStyles?: TUserStyles;
//   onClose?: TOnClose;
// }
export type TTooltipOptions {
  /**
   * Target element or coordinates where the tooltip attaches.
   * - `HTMLElement` / `MouseEvent`: Attaches relative to the element.
   * - `[x, y]` or `{ x, y }`: Attaches to fixed pixel coordinates.
   */
  anchor: HTMLElement | MouseEvent | { x: number; y: number } | [number, number];

  /**
   * Tooltip content. Pass an `HTMLElement` or an HTML string to render.
   */
  content: HTMLElement | string;

  /**
   * Display duration in milliseconds. 
   * Set to `0` to show a manual close button (❌). Defaults to `3000`.
   */
  timeout?: number;

  /**
   * Trigger events to display the tooltip.
   * @example 'mouseenter|mouseleave' | 'click'
   */

  hideOn?: string;
  /**
   * Trigger events to hide the tooltip.
   * @example 'mouseenter|mouseleave' | 'click'
   */
  showOn?: string;

  /**
   * Positioning rule relative to the anchor.
   */
  stick?: 'above' | 'below' | 'left' | 'right';

  /**
   * Custom Inline CSS rules using camelCase keys.
   * @example { color: 'green', marginTop: '10px' }
   */
  userStyles?: Record<string, string>;

  /**
   * Callback fired when the tooltip is hidden/closed.
   * @param reason Method of closure ('❌' or 'timeout')
   * @param innerText Content text of the closed tooltip
   */
  onClose?: (reason?: string, innerText?: string) => void;
}

/**
 * Reactive Tooltip Component.
 * 
 * @example Short Template:
 * ```ts
 * const options: TooltipOptions = {
 *   anchor: buttonEl,
 *   content: 'Hello World',
 *   timeout: 0,
 *   stick: 'above'
 * };
 * const tooltip = ReactiveTooltip.createTooltip(options);
 * ```
 */
export class ReactiveTooltip {
  constructor(options: TTooltipOptions) { }
}
export type TZeroArgs<T extends (...args: any[]) => any> =
  [] extends Parameters<T>
  ? [Parameters<T>[number]] extends [never]
  ? T
  : never
  : never;
// import type { TTooltipOptions , THovered, TPosition, TContent, TStick, TZeroArgs, TUserStyles, TShow, THide, TOnClose, } from '$lib/types/tooltip-args'