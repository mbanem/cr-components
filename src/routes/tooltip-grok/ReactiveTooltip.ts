import type { TTooltipOptions, THovered, TPosition, TContent, TStick, TZeroArgs, TUserStyles, TShow, THide, TOnClose, } from '$lib/types/tooltip-args'
import { isTPosition } from '$lib/utils/client-helpers';
import { ThemeState } from '$lib/utils/theme.svelte';
import { tick } from 'svelte';

// CRreactiveTooltip constructor arguments
// export type TooltipOptions<TPosition> = {
//   anchor: THovered;
//   content: HTMLElement | string;
//   timeout: number
//   showOn?: TShow;
//   hideOn?: THide
//   stick?: TStick;
//   userStyles?: TUserStyles;
//   onClose?: TOnClose;
// }
// flags for reshaping/destroying the existing instance 
// with previous tooltip options from the shapes array
const existing = true
const partly = true
const noCallback = true
/**
 * 
 * `CRTooltip constructor expects tooltipOptions like`
 * ```ts
 *  const ttOpt = {
 *    anchor: buttonOne,
 *    content: divEl,
 *    timeout: 0,
 *    chowOn: 'mouseenter|mouseleave',
 *    stick: 'above',
 *    userStyles: {...theStyles, color:'green'},
 *    onClose: tooltipClosed, // parent callback
 *  }
 * ```
 */
export class ReactiveTooltip {
  // constructor based args begin
  private _anchor: THovered | undefined = undefined
  private _content: HTMLElement | string
  private tooltipEl: HTMLElement | undefined;
  public stick: TStick = 'above';
  public showOn: TShow = 'click';
  public hideOn?: THide = 'mouseleave';
  public timeout = 3000;
  public userStyles: TUserStyles = {};
  public onClose?: TOnClose;
  // constructor based args end
  private anchorRect: DOMRect | undefined;
  private scrollHandler?: () => void;
  private autoCloseTimer?: ReturnType<typeof setTimeout>;

  constructor(options: TTooltipOptions) {
    // destructure options items
    const {
      anchor,
      stick,
      content,
      showOn,
      hideOn,
      timeout,
      onClose,
      userStyles
    } = options;
    this._content = content;    // HTMLElement or string to maake <div
    this.showOn = showOn as TShow
    this.hideOn = hideOn as THide
    this.anchor = anchor;       // hovering element or a point of TPosition
    this.timeout = timeout as number     // 0 X close or timeout > o to timeout

    this.stick = stick as TStick; ``
    this.userStyles = { ...userStyles, boxSize: 'border-box' } as TUserStyles
    let result: any
    if (result = isTPosition(anchor)) {
      this._anchor = result
      this.createElement(result);   // no anchor no showOn so display immediately at point TPosition
      (this.tooltipEl as HTMLElement).style.opacity = '1' // and make it visible
    } else {
      this.createElement()    // if HTMLElement is is tooltipEl or sreing to create tooltipEl
      this.setShowHandler(this.showOn)
      this.setHideHandler(this.hideOn)
    }
    this.onClose = onClose as TOnClose;
  }
  isActive() {
    return this.tooltipEl !== undefined;
  }
  // Type-safe Object.keys helper
  private typedKeys<T extends object>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
  }
  // what would be shown as a tooltip is in the content
  // as an HTMLElement or a string to make <div element
  public set content(cnt: TContent) {
    if (cnt instanceof HTMLElement) {
      this._content = cnt as TContent
    } else if (typeof cnt === 'string') {
      this._content = cnt
      this.createElement()
    }
  }
  // an array holding previous class options when a reshape
  // change tooltip properties where reverse revives previous
  // options on every call
  private shapes: Partial<TTooltipOptions>[] = []

  // anchor is an HTMLElement or new element created from a given
  // string in content argument or a point(x,y) where tooltip
  // is immediatelly displayed and faded via timeout or close by x
  private set anchor(anchor: any) {
    let result: any
    if (anchor instanceof HTMLElement) {
      this._anchor = anchor
    } else if (anchor instanceof MouseEvent) {
      this._anchor = document.elementFromPoint(anchor.clientX, anchor.clientY) as HTMLElement;
    } else if (result = isTPosition(anchor)) {
      this._anchor = result
    } else {
      throw new Error('anchor is not THovered -- HTMLElement, string or {x:number, y:number}')
    }
  }

  // when an anchor is created its Bounding Client Rect is set
  // as this.anchorRect or a new DOMRect(anchor.x, anchor.y) is
  // created when anchor is TPosition point given (x,y) coordinates
  private set anchorrect(anchor: any) {
    if (anchor instanceof HTMLElement || anchor instanceof MouseEvent) {
      this.anchorRect = (this._anchor as HTMLElement).getBoundingClientRect()
    } else if (isTPosition(anchor)) {
      this.anchorRect = new DOMRect(anchor.x, anchor.y) as DOMRect
    }
  }

  // if the shapes array is not empty it pops the last saved options
  // and revive the same tooltip instance with them calling this.reshape 
  // and setting new timeout is this.timeout is not null
  public reverse() {
    const opt = this.shapes.pop()
    if (opt) {
      this.reshape(opt, existing)
    }
  }

  // existing tooltip gets different options properties, so it saves
  // the previous options and generate tooltip witj new ones
  public reshape(options: Partial<TTooltipOptions>, existing?: boolean) {
    console.log(options)
    this.shapes.push(options)
    let result: any
    for (const key of this.typedKeys(options)) {
      const val = options[key]; // Fully typed! 'key' is keyof ITooltipOptions
      switch (key) {
        case 'anchor':
          console.log('case anchor', val)
          this.anchor = val as THovered
          console.log('now this._anchor', this._anchor)
          if (result = isTPosition(this._anchor)) {
            this.anchorRect = new DOMRect(result.x, result.y, 0, 0)
          } else {
            this.anchorRect = (this._anchor as HTMLElement).getBoundingClientRect()
          }
          console.log('this.anchorRect', this.anchorRect)
          break
        case 'content':
          this._content = val as HTMLElement | string
          if (typeof this._content === 'string') {
            this.createElement()
          }
          break
        case 'timeout':
          this.timeout = val as number
          break
        case 'showOn':
          this.setShowHandler(val as TShow)
          break
        case 'hideOn':
          this.setHideHandler(val as TShow)
          break
        case 'stick':
          this.stick = val as TStick
          break
        case 'userStyles':
          this.userStyles = val as TUserStyles
          break
        case 'onClose':
          this.onClose = val as TOnClose
          break

      }
    }
    if (!existing) {
      this.createElement()
    } else {
      this.destroy(partly)
    }
    console.log('returned from reshape')
    return this as ReactiveTooltip
  }

  // this is a hendler for displaying current tooltip instance
  private setShowHandler(str: string) {
    const showhandler = (e: MouseEvent) => {
      this.show()
    }
    (this._anchor as HTMLElement).removeEventListener(this.showOn, showhandler);
    tick().then(() => {
      return new Promise((resolve) => setTimeout(resolve, 300))
    });
    this.showOn = str as TShow
    (this._anchor as HTMLElement).addEventListener(this.showOn, showhandler)
  }

  // this is a hendler for hiding current tooltip instance
  private setHideHandler(str: string | undefined) {
    const hidehandler = (e: MouseEvent) => {
      this.fadeOut(partly)
    }
    (this._anchor as HTMLElement).removeEventListener(this.hideOn as THide, hidehandler);
    if (!str) {
      return
    }
    tick().then(() => {
      return new Promise((resolve) => setTimeout(resolve, 300))
    });
    this.hideOn = str as THide
    (this._anchor as HTMLElement).addEventListener(this.hideOn, hidehandler)
  }

  // clears timeout if in progress hide the tooltip setting opacity to zero
  // and if required calls destroy with partly flag for eentually deleting
  // this.tooltipEl and its eent handlers
  private async fadeOut(partly?: boolean) {
    if (!this.tooltipEl) return;
    clearTimeout(this.autoCloseTimer)
    this.tooltipEl.style.opacity = '0';
    if (partly) {
      this.destroy(partly)
    }
  }

  // depending on TStick the function set proper coordinates to tooltip
  private updatePosition() {
    if (!this.tooltipEl || !this.anchorRect) return;

    const tooltipRect = this.tooltipEl.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const gap = 8;

    let x = 0;
    let y = 0;

    if (!('width' in this.anchorRect)) {
      // pure coordinate
      x = this.anchorRect.x + gap;
      y = this.anchorRect.y + gap;
    } else {
      const anchorRect = this.anchorRect as DOMRect;
      const order: TStick[] = ['left', 'above', 'right', 'below'];
      const start = order.indexOf(this.stick);
      const sequence = start === -1 ? order : [...order.slice(start), ...order.slice(0, start)];

      let chosenX = anchorRect.left;
      let chosenY = anchorRect.bottom + gap;

      for (const dir of sequence) {
        let testX = 0;
        let testY = 0;
        let fits = false;

        switch (dir) {
          case 'right':
            testX = anchorRect.right + gap;
            testY = anchorRect.top;
            fits = viewportWidth - anchorRect.right >= tooltipRect.width + gap;
            break;
          case 'left':
            const f = this.timeout === 0 ? 1 : 2
            testX = anchorRect.left - tooltipRect.width - f * gap;
            testY = anchorRect.top;
            fits = anchorRect.left >= tooltipRect.width + f * gap;
            break;
          case 'below':
            testX = anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2;
            testY = anchorRect.bottom + gap;
            fits = viewportHeight - anchorRect.bottom >= tooltipRect.height + gap;
            break;
          case 'above':
            testX = anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2;
            testY = anchorRect.top - tooltipRect.height - 2 * gap;
            fits = anchorRect.top >= tooltipRect.height + 2 * gap;
            break;
        }

        if (fits) {
          chosenX = testX;
          chosenY = testY;
          break;
        }
        if (dir === this.stick) {
          chosenX = testX;
          chosenY = testY;
        }
      }
      x = chosenX;
      y = chosenY;
    }

    // keep inside viewport
    x = Math.max(8, Math.min(x, viewportWidth - tooltipRect.width - 8));
    y = Math.max(8, Math.min(y, viewportHeight - tooltipRect.height - 8));

    Object.assign(this.tooltipEl.style, {
      position: 'fixed',
      top: `${y}px`,
      left: `${x}px`,
      zIndex: '9999',
      borderRadius: '8px',
      border: '1px solid #ccc',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      width: 'max-content',
      boxSizing: 'border-box',
      padding: this.timeout === 0 ? '6px 20px 8px 6px' : '6px 6px 8px 6px',
      transition: 'opacity 0.3s ease, left 0.2s cubic-bezier(0.25, 1, 0.5, 1), top 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
      ...this.userStyles
    });
  }

  // create a new element if string is given and hnndles differently
  // case when a point(x,y) is given as an hovering anchor element

  private createElement(pos?: TPosition) {
    if (this.tooltipEl) {
      this.fadeOut()
      tick().then(() => { return new Promise((resolve) => setTimeout(resolve, 300)) })
    }
    // Create element
    if (typeof this._content === 'string') {
      this.tooltipEl = document.createElement('div');
      this.tooltipEl.innerHTML = this._content
        .split(/,|\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p style="margin:0;padding:0;line-height:1.4;">${p}</p>`)
        .join('');
    } else {
      this.tooltipEl = this._content;
    }

    // this.tooltipEl.classList.add('dynamic-tooltip');
    Object.assign(this.tooltipEl.style, { position: 'fixed', opacity: '0', boxSizing: 'border-box', zIndex: 9999 });

    // Resolve anchor
    if (this._anchor instanceof HTMLElement) {
      this.anchorRect = this._anchor.getBoundingClientRect();
    } else if (this._anchor && 'clientX' in this._anchor) {
      const el = document.elementFromPoint(this._anchor.clientX, this._anchor.clientY);
      this.anchorRect = el?.getBoundingClientRect();
    } else if (pos) {
      const x = `${pos.x}px`
      const y = `${pos.y}px`
      Object.assign(this.tooltipEl.style, {
        position: 'absolute',
        top: y,
        left: x,
        opacity: '1',
        zIndex: 9999,
        ...this.userStyles
      })
    }


    // Close button
    if (this.timeout === 0 && !this.hideOn) {
      const btn = document.createElement('button');
      btn.innerHTML = '❌';
      btn.setAttribute('aria-label', 'Close');
      Object.assign(btn.style, {
        position: 'absolute',
        top: '6px',
        right: '0',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '12px',
        boxSizing: 'border-box',
        opacity: '0.7',
        zIndex: 9999,
      });
      btn.onclick = (e) => {
        e.stopPropagation();
        this.hide();
      };
      this.tooltipEl.style.paddingRight = '20px';
      this.tooltipEl.appendChild(btn);
    } else if (pos) {
      if (this.timeout > 0) {
        this.autoCloseTimer = setTimeout(() => this.hide(), this.timeout);
      }
    }

    document.body.appendChild(this.tooltipEl);
    this.setupTracking();
    this.updatePosition();

    // refresh CSS
    this.tooltipEl.offsetHeight;
  }

  // adjust tooltip position based on page scrolling
  private setupTracking() {
    this.scrollHandler = () => {
      if (this.anchorRect && 'left' in this.anchorRect) {
        // if it was an element, we would need a reference to re-getBoundingClientRect
        // for simplicity we only track pure coordinates or initial rect
      }
      this.updatePosition();
    };

    // adjust tooltip position when window scrolls
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    window.addEventListener('resize', this.scrollHandler, { passive: true });
  }

  // when the instance is hidden after closing or timeout
  // this will revive it by starting a new timeout if necessary
  public wakeUp() {
    if (this.tooltipEl) {
      this.tooltipEl.style.opacity = '1';
      if (this.timeout > 0) {
        this.autoCloseTimer = setTimeout(() => this.hide(), this.timeout);
      }
    }
  }

  // clean up of the tooltip instance
  public destroy(partly?: boolean) {
    this.hide()
    try {
      this.tooltipEl?.remove();
    } catch { }
    this.tooltipEl = undefined;
    this.anchorRect = undefined;

    // cleanup listeners
    if (this.scrollHandler && !partly) {
      window.removeEventListener('scroll', this.scrollHandler);
      window.removeEventListener('resize', this.scrollHandler);
      this.scrollHandler = undefined;
    }
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = undefined;
    }
  }

  // called on an instance hiding tooltip before re-creating it
  // as options could be changed in between
  public async show(
    // anchor: THovered,
    // content: HTMLElement | string,
    // timeout = 3000,
    // stick: TStick = 'above',
    // customStyles: Record<string, string> = {},
    // onClose?: TOnClose
  ) {
    // If this instance is already showing something, close it first
    if (this.tooltipEl) {
      await this.hide(noCallback);
    }
    this.createElement()
    // this.timeout = this.timeout;
    // this.stick = this.stick;
    // this.userStyles = customStyles;
    // this.onClose = onClose;

    // constructor must get anchor as HTMLElement or string to build this._anchor
    this.tooltipEl!.style.opacity = '1';

    if (this.timeout > 0) {
      this.autoCloseTimer = setTimeout(() => this.hide(), this.timeout);
    }

    return this.tooltipEl;
  }

  // hide the tooltip and execute callback if defined
  async hide(noCallback?: boolean) {
    const it = (this.tooltipEl)?.innerText as string
    await this.fadeOut();
    const retval = it?.includes('❌') ? '❌' : 'timeout'
    if (!noCallback) {
      this.onClose?.(retval, it);
    }
  }

  static async optionsToClipboard(withDetails?: boolean) {
    const tooltipOptions = withDetails ? `const tooltipOptions = {
      // HTMLElement or MouseEvent to get element that mouse clicked on, 
      // or a Point coordinates as an object {x:number, y:number} or a
      // tuple [number,number] e.g. [40,80]
      anchor: buttonOne,   // HTMLElement is this case

      // tooltip itself as an HTMLElement or a string to build a <div from
      content: divEl,   // to be displayed when triggered

      // when 0 tooltip will get ❌ icon for closing or as a positive
      // number to setTimeout when tooltip is displayed and fade out
      // when timeout number of seconds ellapse
      timeout: 0,  // or 3000 as default wne not specified

      // what event should display (mouseenter, click) and hide (mouseleave, timeout) 
      // NOTE when, anchor is Point coordinates it is shown immediately when
      // tooltip is instantiated and closed according to timeout
      chowOn: 'mouseenter|mouseleave', // or 'click' with tineout

      // oonly mouseleave is allowed, though timeout has its say
      hideOn: 'mouseleave',

      // tooltip is position around anchor as 'above|below|left|right'
      // when there is not enough space it could change position
      stick: 'above',

      // styles are specified in TypeScript Record<string,string> format so it
      // differs from CSS: rule names with dashes go into camelCase format
      // margin-top -> marginTop, and values are just encapsulated in quotes
      // or apostrophies: border: '1px solid gray' entries are comma-separated
      // {color: 'blue', margin:'1px solid gray',...}
      // If there was a ready styles object 'theStyles' we include it at the
      // beginning so we can override them or at the end to enforce them 
      userStyles: {...theStyles, color:'green'},

      // if program wants to know when tooltip close (fadeOut) it could specify
      // callback function reference accepting two arguments
      // eventStr:string -- which os a close button font-icon ❌ or 'timeout'
      // and inners:innerText from the tooltip
      // e.g. function tooltipClosed(eventStr?: string, inners?: string) {
      onClose: tooltipClosed,

      After you finalaze the content of tooltipOptions variable and eventually rename
      the varible itself just call static ReactiveTooltip method 'createTooltip'

          ReactiveTooltip.createTooltip(tooltipOptions)
      to
      get tooltip instance. If anckor is not a Poiint you should call show on instance

        const tooltipNextStep = ReactiveTooltip.createTooltip(tooltipOptions)

      then on button event handler (click, mouseenter) in the handler function call
      tooltipNextStep.show()

      if needed to close it before scheduled call tooltipNextStep.hide()

      You can call reshape method on tooltipNextStep specifying apdated options.
      It will display tooltip with new options and remember previous options, so
      you can call reverse to go to previous options as deep as there are saved
      previous options.
    }`:
      `
const tooltipOptions = {
  anchor: buttonOne,
  content: divEl,
  timeout: 0,
  chowOn: 'mouseenter|mouseleave',
  //hideOn: 'mouseleave',
  stick: 'above',
  userStyles: { ...theStyles, color: 'green' },
  onClose: tooltipClosed, // parent callback
}

const tooltipEl = ReactiveTooltip.createTooltip(tooltipOptions)
`
    console.log(tooltipOptions)
    await navigator.clipboard.writeText(tooltipOptions);
  }
}