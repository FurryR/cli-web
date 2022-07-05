/**
 * This program was under the MIT license.
 * Copyright(c) FurryR 2022.
 */
/**
 * Terminal 类。
 * 基本终端实现。
 */
export class Terminal {
  private obj: HTMLElement;
  private input: HTMLInputElement;
  private buffer: string[];
  private lock: boolean;
  private rejectLast: () => void;
  private resolveLast: (val: string) => void;
  /**
   * 设定Terminal的内容。
   * @param elem 要写入的内容。
   */
  setContent(elem: HTMLElement[]): void {
    while (this.obj.children.length != 1)
      this.obj.removeChild(this.obj.children[0]);
    elem.forEach((obj: HTMLElement): void => {
      this.obj.insertBefore(obj, this.input);
    });
  }
  /**
   * 从Terminal读取一个字。不回显。
   * @returns 用于获得用户输入内容的Promise。
   */
  getch(): Promise<string> {
    this.rejectLast();
    return new Promise<string>((resolve, reject): void => {
      if (this.buffer.length != 0) {
        resolve(this.buffer[0]);
        this.buffer = this.buffer.slice(1);
        return;
      }
      this.resolveLast = (val: string): void => {
        this.rejectLast = this.resolveLast = (): void => void null;
        resolve(val);
      };
      this.rejectLast = reject;
    });
  }
  /**
   * 构造一个 Terminal。
   * @param obj 目标元素。
   */
  constructor(obj: HTMLElement) {
    [this.lock, this.buffer, this.input] = [
      false,
      [],
      (this.input = document.createElement('input')),
    ];
    this.input.style.opacity =
      this.input.style.width =
      this.input.style.height =
        '0';
    this.input.title = this.input.placeholder = 'Cli-Web';
    this.input.addEventListener('compositionstart', (): void => {
      this.lock = true;
    });
    this.input.addEventListener('compositionend', (): void => {
      this.lock = false;
      this.input.dispatchEvent(new InputEvent('input'));
    });
    this.input.addEventListener('keydown', (ev: KeyboardEvent): boolean => {
      if (ev.key.length > 1) {
        this.resolveLast(ev.key);
        return false;
      }
      return true;
    });
    this.input.addEventListener('input', (): void => {
      if (!this.lock) {
        if (this.input.value.length > 1)
          this.buffer.push(...this.input.value.slice(1));
        this.resolveLast(this.input.value.slice(0, 1));
        this.input.value = '';
      }
    });
    this.obj = obj;
    this.obj.appendChild(this.input);
    this.obj.addEventListener('focus', (): void => this.input.focus());
    this.rejectLast = (): void => void null;
    this.resolveLast = (): void => void null;
  }
}
/**
 * RichTerminal 类。
 * 更好的Terminal包装。
 * 注意：RichTerminal和Terminal不应并用。
 */
export class RichTerminal {
  private obj: Terminal;
  private term_buffer: HTMLElement[];
  private _cursor: number;
  private span(text: string): HTMLSpanElement {
    const d: HTMLSpanElement = document.createElement('span');
    d.appendChild(document.createTextNode(text));
    return d;
  }
  private putchar(elem: HTMLElement | string): void {
    if (elem instanceof HTMLElement) {
      this.term_buffer[this.cursor] = elem;
      this.cursor++;
    } else {
      if (elem == '\n')
        this.term_buffer[this.cursor] = document.createElement('br');
      else this.term_buffer[this.cursor] = this.span(elem);
      this.cursor++;
    }
  }
  /**
   * 获得当前光标位置。
   */
  get cursor(): number {
    return this._cursor;
  }
  /**
   * 设置当前光标位置。
   */
  set cursor(newVal: number) {
    if (newVal > this.length) this._cursor = this.length;
    else this._cursor = newVal;
  }
  /**
   * 获得当前缓冲区大小。
   */
  get length(): number {
    return this.term_buffer.length;
  }
  /**
   * 清除Terminal的内容。
   */
  clear(): void {
    this.term_buffer = [];
    this.cursor = 0;
    this.obj.setContent(this.term_buffer);
  }
  /**
   * 对Terminal setContent的包装。
   * @param elem 要写入的内容。
   */
  setContent(elem: HTMLElement[]) {
    this.term_buffer = elem;
    this.cursor = elem.length;
    this.obj.setContent(elem);
  }
  /**
   * 对Terminal getch的包装。
   * @returns 用于获得用户输入内容的Promise。
   */
  getch(): Promise<string> {
    return this.obj.getch();
  }
  /**
   * 在Terminal追加写入多个字符串或元素。
   * @param str 要写入的字符串。
   */
  write(...str: (string | HTMLElement)[]): void {
    for (const i of str) {
      if (i instanceof HTMLElement) {
        this.putchar(i);
      } else {
        for (const s of i) this.putchar(s);
      }
    }
    this.obj.setContent(this.term_buffer);
  }
  /**
   * 获得一行文字，不带换行。回显。
   */
  async getline(): Promise<string> {
    const updateStr: (
      buffer: HTMLElement[],
      pos: number,
      str: string[],
    ) => HTMLElement[] = (
      buffer: HTMLElement[],
      pos: number,
      str: string[],
    ): HTMLElement[] => {
      const d: HTMLElement[] = [...buffer.slice(0, pos)];
      for (const val of str) d.push(this.span(val));
      return d;
    };
    const cursor_temp: number = this.cursor;
    let fin = '',
      cursor = 0;
    for (;;) {
      const i: string = await this.getch();
      switch (i) {
        case 'ArrowLeft': {
          if (cursor > 0) cursor--;
          break;
        }
        case 'ArrowRight': {
          if (cursor < fin.length) cursor++;
          break;
        }
        case 'Backspace': {
          if (cursor > 0) {
            fin = fin.slice(0, cursor - 1) + fin.slice(cursor--);
            this.term_buffer = updateStr(
              this.term_buffer,
              (this.cursor = cursor_temp),
              Array.from(fin),
            );
            this.obj.setContent(this.term_buffer);
          }
          break;
        }
        case 'Enter': {
          this.cursor = this.length;
          this.write('\n');
          return fin;
        }
        default: {
          if (i.length == 1) {
            fin = fin.slice(0, cursor) + i + fin.slice(cursor++);
            this.term_buffer = updateStr(
              this.term_buffer,
              (this.cursor = cursor_temp),
              Array.from(fin),
            );
            this.obj.setContent(this.term_buffer);
          }
        }
      }
    }
  }
  /**
   * 构造一个 RichTerminal。
   * @param obj 目标Terminal。
   */
  constructor(obj: Terminal) {
    [this.obj, this._cursor, this.term_buffer] = [obj, 0, []];
  }
}
