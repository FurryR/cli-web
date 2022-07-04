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
  private rejectLast: () => void;
  private resolveLast: (val: string) => void;
  /** 
* 设定Terminal的内容。
* @param elem 要写入的内容。
*/
  setContent(elem: HTMLElement[]): void {
    while (this.obj.firstChild) this.obj.removeChild(this.obj.firstChild);
    elem.forEach((obj: HTMLElement): void => {
      this.obj.appendChild(obj);
    });
  }
  /**
* 从Terminal读取一个字。不回显。
* @returns 用于获得用户输入内容的Promise。
*/
  getch(): Promise<string> {
    this.rejectLast();
    this.rejectLast = (): void => void null;
    this.resolveLast = (): void => void null;
    return new Promise<string>((resolve, reject) => {
      this.resolveLast = resolve;
      this.rejectLast = reject;
    });
  }
  /**
* 构造一个 Terminal。
* @param obj 目标元素。
*/
  constructor(obj: HTMLElement) {
    this.obj = obj;
    this.obj.onkeydown = (ev: KeyboardEvent) => {
      this.resolveLast(ev.key);
    };
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
  private current_cursor: number;
  private span(text: string): HTMLSpanElement {
    const d: HTMLSpanElement = document.createElement('span');
    d.appendChild(document.createTextNode(text));
    return d;
  }
  private putchar(elem: HTMLElement | string): void {
    if (elem instanceof HTMLElement) {
      this.term_buffer[this.current_cursor++] = elem;
    } else {
      if (elem == '\b') this.current_cursor--;
      else if (elem == '\n') this.term_buffer[this.current_cursor++] = document.createElement('br');
      else this.term_buffer[this.current_cursor++] = this.span(elem);
    }
  }
  /**
* 清除Terminal的内容。
*/
  clear(): void {
    this.term_buffer = [];
    this.current_cursor = 0;
    this.obj.setContent(this.term_buffer);
  }
  /**
   * 对Terminal setContent的包装。
   * @param elem 要写入的内容。
   */
  setContent(elem: HTMLElement[]) {
    this.term_buffer = elem;
    this.current_cursor = elem.length;
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
    const updateStr: (buffer: HTMLElement[], pos: number, str: string[]) => HTMLElement[] = (buffer: HTMLElement[], pos: number, str: string[]): HTMLElement[] => {
      const d: HTMLElement[] = [...buffer.slice(0, pos)];
      for (const val of str) d.push(this.span(val));
      return d;
    };
    const cursor_temp: number = this.current_cursor;
    let fin = '', cursor = 0;
    for (; ;) {
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
            this.term_buffer = updateStr(this.term_buffer, this.current_cursor = cursor_temp, Array.from(fin));
            this.obj.setContent(this.term_buffer);
          }
          break;
        }
        case 'Enter': {
          this.current_cursor = this.term_buffer.length;
          this.write('\n');
          return fin;
        }
        default: {
          if (i.length == 1) {
            fin = fin.slice(0, cursor) + i + fin.slice(cursor++);
            this.term_buffer = updateStr(this.term_buffer, this.current_cursor = cursor_temp, Array.from(fin));
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
    [this.obj, this.current_cursor, this.term_buffer] = [obj, 0, []];
  }

}