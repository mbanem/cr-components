import { ECDH } from 'crypto';
import { threadCpuUsage } from 'process';
import { tick } from 'svelte';
import { runInThisContext } from 'vm';
import type { TStick, TLaunchEvent, TSHE, TSHL, TSHC, TOnClose, THovered, ITooltipOptions } from '$lib/types/tooltip-args'



export class CRReactiveTooltip {
  private _anchor: HTMLElement | undefined
  private abortController: AbortController;
  private tooltipEl: HTMLElement | undefined;
  private anchorRect: DOMRect | undefined;
  private preferredStick: TStick = 'above';
  private userStyles: Record<string, string> = {};
  // private showHide: TShowHide = 3000;
  private timeout: number | undefined;
  private onmouseEnter: ((e: MouseEvent) => void) | undefined = undefined;
  private onmouseLeave: ((e: MouseEvent) => void) | undefined = undefined;
  private onclick: ((e: MouseEvent) => void) | undefined = undefined;
  private onClose?: TOnClose;
  private scrollHandler?: () => void;
  private autoCloseTimer?: ReturnType<typeof setTimeout>;

  constructor(options: ITooltipOptions) {
    const {
      anchor,
      content,
      showHide = ['mouseenter|mouseleave', 3000],
      stick = 'above',
      userStyles = {},
      onClose
    } = options;
    this._anchor = anchor;
    if (anchor instanceof HTMLElement) {
      // 1. It is a DOM element
      this._anchorType = 'htmlElement'
    } else if (anchor instanceof MouseEvent) {
      // 2. It is a MouseEvent
      // console.log('document when mouseEvent')
      this._anchor = document.elementFromPoint(anchor.clientX, anchor.clientY) as HTMLElement | undefined;
      this._anchorType = 'fromMouseEvent'
    }
    this.showHide = showHide  // this aasignement will create mouse handlers
    this.preferredStick = stick;
    this.userStyles = userStyles;
    this.onClose = onClose as TOnClose;

    // An AbortController allows removing all listeners in a single line
    this.abortController = new AbortController();
    const { signal } = this.abortController;
    if (this._anchor) {
      this.attachListeners(signal);
    }
    this.preferredStick = stick;
    this.userStyles = userStyles;
    this.onClose = onClose as TOnClose;

    // Create element
    if (typeof content === 'string') {
      // console.log('dovument when content is a string')
      this.tooltipEl = document.createElement('div') as HTMLElement;
      this.tooltipEl.innerHTML = content
        .split(/,|\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p style="margin:0;padding:0;line-height:1.4">${p}</p>`)
        .join('');
    } else {
      this.tooltipEl = content;
    }

    this.tooltipEl.classList.add('dynamic-tooltip');
    Object.assign(this.tooltipEl.style, { position: 'fixed', opacity: '0' });

    if (this.timeout !== undefined && this.timeout === 0) {
      // console.log('document adding x button')
      const btn = document.createElement('button');
      if (!btn) {
        console.log("document.createElement('button') failed")
      }
      btn.innerHTML = '❌';
      btn.setAttribute('aria-label', 'Close');
      Object.assign(btn.style, {
        position: 'absolute',
        top: '6px',
        right: '8px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        opacity: '1'
      });
      btn.onclick = (e) => {
        e.stopPropagation();
        this.hide();
      };
      this.tooltipEl.style.paddingRight = '28px'; // widen for close icon X
      this.tooltipEl.appendChild(btn);  // add button icon to the tooltip
    }
  }
  isActive() {
    return this.tooltipEl !== undefined;
  }
  public set anchor(anchor: HTMLElement) {
    if (anchor && typeof anchor === typeof HTMLElement) {
      this._anchor = anchor
      this.anchorRect = anchor.getBoundingClientRect()
    }
  }
  public set showHide(sh: TShowHide) {
    if (typeof sh === 'number') {
      this.timeout = sh as number
    } else if (typeof sh === 'string') {
      let meml = String(sh.match(/mouseenter/))
      if (meml && this._anchor) {
        const handler = (e: MouseEvent) => {
          this.show()
        }
        this.anchor?.addEventListener('mouseenter', handler)
      }
      meml = String(sh.match(/mouseleave/))
      if (meml) {
        const handler = (e: MouseEvent) => {
          this.hide()
        }
        (this._anchor as HTMLElement).addEventListener('mouseleave', handler)
      }
    }
  }
  // Called to completely destroy the instance and release memory
  public destroy(): void {
    // Aborts and removes all event listeners attached with this signal
    this.abortController.abort();

    // Optional: Hide element or remove tooltip DOM node if created dynamically
    this.hide();
    if (this.tooltipEl) {
      this.tooltipEl.remove();
      this.tooltipEl = undefined;
      this.anchorRect = undefined;
    }

    // cleanup listeners
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      window.removeEventListener('resize', this.scrollHandler);
      this.scrollHandler = undefined;
    }
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = undefined;
    }
  }
  private attachListeners(signal: AbortSignal): void {
    (this._anchor as HTMLElement).addEventListener('mouseenter', this.show, { signal });
    (this._anchor as HTMLElement).addEventListener('mouseleave', this.hide, { signal });
    (this._anchor as HTMLElement).addEventListener('click', this.show, { signal });
  }
  private async fadeOut() {
    if (!this.tooltipEl) return;

    this.tooltipEl.style.opacity = '0';
    await new Promise((r) => setTimeout(r, 300));
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
      const rect = this.anchorRect as DOMRect;
      const order: TStick[] = ['left', 'above', 'right', 'below'];
      const start = order.indexOf(this.preferredStick);
      const sequence = start === -1 ? order : [...order.slice(start), ...order.slice(0, start)];

      // position below
      let chosenX = rect.left;
      let chosenY = rect.bottom + gap;

      for (const dir of sequence) {
        let testX = 0;
        let testY = 0;
        let fits = false;

        switch (dir) {
          case 'right':
            testX = rect.right + gap;
            testY = rect.top;
            // rect.right = rect.x + rect.width
            fits = viewportWidth - rect.right >= tooltipRect.width + gap;
            break;
          case 'left':
            testX = rect.left - tooltipRect.width - gap;
            testY = rect.top;
            fits = rect.left >= tooltipRect.width + gap;
            break;
          case 'below':
            testX = rect.left + rect.width / 2 - tooltipRect.width / 2;
            testY = rect.bottom + gap;
            fits = viewportHeight - rect.bottom >= tooltipRect.height + gap;
            break;
          case 'above':
            testX = rect.left + rect.width / 2 - tooltipRect.width / 2;
            testY = rect.top - tooltipRect.height - 2 * gap;
            fits = rect.top >= tooltipRect.height + 2 * gap;
            break;
        }

        if (fits) {
          chosenX = testX;
          chosenY = testY;
          break;
        }
        // not chosen in this loop step but if preferreedStick take that position
        if (dir === this.preferredStick) {
          chosenX = testX;
          chosenY = testY;
        }
      }
      // this is final after loop is done
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
      width: 'auto',
      padding: typeof this.showHide === "number" && this.showHide === 0 ? '12px 32px 8px 12px' : '12px 12px 8px 12px',
      transition: 'opacity 0.3s ease, left 0.2s cubic-bezier(0.25, 1, 0.5, 1), top 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
      ...this.userStyles
    });
  }

  private setupTracking() {
    this.scrollHandler = () => {
      if (this.anchorRect && 'left' in this.anchorRect) {
        // if it was an element, we would need a reference to re-getBoundingClientRect
        // for simplicity we only track pure coordinates or initial rect
      }
      this.updatePosition();
    };

    // passive: true -- handler won't call preventDefault to disable scrolling
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    window.addEventListener('resize', this.scrollHandler, { passive: true });
  }

  // NOTE when showHide = 'mouseenter' | 3000, 3000 is timeout to hide
  //      when 'mouseleave', 3000 if not mouseleave then hide wjen time ellapsed
  async show() {

    if (!this.tooltipEl) {
      console.log('show -- no this.tooltipEl')
    }
    // console.log('document appendChild', this.tooltipEl)
    document.body.appendChild(this.tooltipEl as HTMLElement);
    this.setupTracking();  // react on scroll event
    this.updatePosition();

    // Fade in with full height and opacity
    if (this.tooltipEl && typeof this.tooltipEl === typeof HTMLElement) {
      this.tooltipEl.offsetHeight;  // refresh
      this.tooltipEl.style.opacity = '1';
    }

    if (this.timeout && this.timeout > 0) {
      this.autoCloseTimer = setTimeout(() => this.hide(), this.timeout);
    }
    return this.tooltipEl;
  }
  async hide() {
    this.onClose?.();
    await this.fadeOut();
  }
}