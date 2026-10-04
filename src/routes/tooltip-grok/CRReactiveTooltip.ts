import type { TStick, TUserStyles, TShow, THide, TOnClose, THovered } from '$lib/types/tooltip-args'
import { setupEventHandlers } from '$lib/utils/setupEventHandlers';
import { tick } from 'svelte';

export interface ITooltipOptions {
  anchor: THovered;
  content: HTMLElement | string;
  timeout: number
  showOn: TShow;
  hideOn?: THide
  stick?: TStick;
  userStyles?: TUserStyles;
  onClose?: TOnClose;
}

export class CRReactiveTooltip {
  private _anchor: THovered
  public content: HTMLElement | string
  private tooltipEl: HTMLElement | undefined;
  private anchorRect: DOMRect | undefined;
  public stick: TStick = 'above';
  public showOn: TShow = 'click';
  public hideOn?: THide = 'mouseleave';
  public timeout = 3000;
  public userStyles: TUserStyles = {};
  // private launchEvent: TLaunchEvent = 'click'
  public onClose?: () => void;
  private scrollHandler?: () => void;
  private autoCloseTimer?: ReturnType<typeof setTimeout>;
  // TODO temporary soontents below

  constructor(options: ITooltipOptions) {
    const {
      anchor,
      stick,
      content,
      showOn,
      hideOn,
      timeout,
      userStyles
    } = options;

    this.content = content;
    this.showOn = showOn
    this.hideOn = hideOn
    log('this.hideOn', this.hideOn)
    this._anchor = anchor;
    this.timeout = timeout
    if (anchor instanceof HTMLElement) {
      // 1. It is a DOM element
    } else if (anchor instanceof MouseEvent) {
      // 2. It is a MouseEvent
      // console.log('document when mouseEvent')
      this._anchor = document.elementFromPoint(anchor.clientX, anchor.clientY) as HTMLElement;
    }

    this.setAnchor()
    this.setShowHandler(this.showOn)
    this.setHideHandler(this.hideOn)
    this.stick = stick as TStick;
    // console.log('stick', stick)
    this.userStyles = { ...userStyles, boxSize: 'border-box' } as TUserStyles
    // this.onClose = onClose as TOnClose;
    this.createElement()
  }
  isActive() {
    return this.tooltipEl !== undefined;
  }
  // Type-safe Object.keys helper
  private typedKeys<T extends object>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
  }

  public reshape(options: Partial<ITooltipOptions>) {
    for (const key of this.typedKeys(options)) {
      const val = options[key]; // Fully typed! 'key' is keyof ITooltipOptions
      switch (key) {
        case 'anchor':
          this._anchor = val as THovered
          this.anchorRect = (this._anchor as HTMLElement).getBoundingClientRect()
          break
        case 'content':
          this.content = val as HTMLElement | string
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
    log('returned from reshape')
    return this as CRReactiveTooltip
  }
  private setAnchor() {
    if (!this._anchor) {
      throw new Error('constructor is missing anchor HTMLElement')
    }
    if (this._anchor && typeof this._anchor === typeof HTMLElement) {
      this._anchor = this._anchor
      this.anchorRect = (this._anchor as HTMLElement).getBoundingClientRect()
    }
  }
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

  private setHideHandler(str: string | undefined) {
    const hidehandler = (e: MouseEvent) => {
      this.fadeOut()
    }
    (this._anchor as HTMLElement).removeEventListener(this.showOn, hidehandler);
    if (!str) {
      return
    }
    tick().then(() => {
      return new Promise((resolve) => setTimeout(resolve, 300))
    });
    this.hideOn = str as THide
    (this._anchor as HTMLElement).addEventListener(this.hideOn, hidehandler)
  }
  private async fadeOut() {
    if (!this.tooltipEl) return;

    this.tooltipEl.style.opacity = '0';
    // await new Promise((r) => setTimeout(r, 300));
    // this.tooltipEl.remove();
    // this.tooltipEl = undefined;
    // this.anchorRect = undefined;

    // // cleanup listeners
    // if (this.scrollHandler) {
    //   window.removeEventListener('scroll', this.scrollHandler);
    //   window.removeEventListener('resize', this.scrollHandler);
    //   this.scrollHandler = undefined;
    // }
    // if (this.autoCloseTimer) {
    //   clearTimeout(this.autoCloseTimer);
    //   this.autoCloseTimer = undefined;
    // }
  }

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
      padding: this.timeout === 0 ? '6px 20px 8px 6px' : '6px 0 8px 6px',
      transition: 'opacity 0.3s ease, left 0.2s cubic-bezier(0.25, 1, 0.5, 1), top 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
      ...this.userStyles
    });
  }
  private createElement() {
    // Create element
    if (typeof this.content === 'string') {
      this.tooltipEl = document.createElement('div');
      this.tooltipEl.innerHTML = this.content
        .split(/,|\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p style="margin:0;padding:0;line-height:1.4">${p}</p>`)
        .join('');
    } else {
      this.tooltipEl = this.content;
    }

    this.tooltipEl.classList.add('dynamic-tooltip');
    Object.assign(this.tooltipEl.style, { position: 'fixed', opacity: '0', boxSizing: 'border-box' });

    // Resolve anchor
    if (this._anchor instanceof HTMLElement) {
      this.anchorRect = this._anchor.getBoundingClientRect();
    } else if (this._anchor && 'clientX' in this._anchor) {
      const el = document.elementFromPoint(this._anchor.clientX, this._anchor.clientY);
      this.anchorRect = el?.getBoundingClientRect();
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
        opacity: '0.7'
      });
      btn.onclick = (e) => {
        e.stopPropagation();
        this.hide();
      };
      this.tooltipEl.style.paddingRight = '20px';
      this.tooltipEl.appendChild(btn);
    }

    document.body.appendChild(this.tooltipEl);
    this.setupTracking();
    this.updatePosition();

    // Fade in
    this.tooltipEl.offsetHeight;
  }
  private setupTracking() {
    this.scrollHandler = () => {
      if (this.anchorRect && 'left' in this.anchorRect) {
        // if it was an element, we would need a reference to re-getBoundingClientRect
        // for simplicity we only track pure coordinates or initial rect
      }
      this.updatePosition();
    };

    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    window.addEventListener('resize', this.scrollHandler, { passive: true });
  }

  public async show(
    // anchor: THovered,
    // content: HTMLElement | string,
    // timeout = 3000,
    // stick: TStick = 'above',
    // customStyles: Record<string, string> = {},
    // onClose?: () => void
  ) {
    // If this instance is already showing something, close it first
    if (this.tooltipEl) {
      await this.hide();
    }

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

  async hide() {
    this.onClose?.();
    await this.fadeOut();
  }
}