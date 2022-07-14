/**
 * This program was under the MIT license.
 * Copyright(c) FurryR 2022.
 */

/**
 * Terminal 类。
 * 基本终端实现。
 */
export class Terminal {
  private obj: HTMLElement
  private input: HTMLInputElement
  private buffer: string[] = []
  private inputlock = false
  private span(text: string): HTMLSpanElement {
    const d: HTMLSpanElement = document.createElement('span')
    d.appendChild(new Text(text))
    return d
  }
  private resolve: ((val: string) => void)[] = []
  private ret(val: string): void {
    this.resolve[0](val)
    this.resolve = this.resolve.slice(1)
  }
  /**
   * 设定 Terminal 的内容。
   * @param elem 要写入的内容。
   */
  setContent(elem: (string | HTMLElement)[]): void {
    while (this.obj.children.length != 1)
      this.obj.removeChild(this.obj.children[0])
    let temp = ''
    const f: DocumentFragment = new DocumentFragment()
    elem.forEach((obj: string | HTMLElement): void => {
      if (obj instanceof HTMLElement) {
        if (temp != '') {
          f.appendChild(this.span(temp))
          temp = ''
        }
        f.appendChild(obj)
      } else temp += obj
    })
    if (temp != '') f.appendChild(this.span(temp))
    this.obj.insertBefore(f, this.input)
  }
  /**
   * 从 Terminal 读取一个字。不回显。
   * @returns 用于获得用户输入内容的 Promise。
   */
  getch(): Promise<string> {
    return new Promise<string>((resolve): void => {
      if (this.buffer.length != 0) {
        resolve(this.buffer[0])
        this.buffer = this.buffer.slice(1)
        return
      }
      this.resolve.push((val: string): void => resolve(val))
    })
  }
  /**
   * 构造一个 Terminal。
   * @param obj 目标元素。
   */
  constructor(obj: HTMLElement) {
    // 初始化。
    ;[this.obj, this.input] = [
      obj,
      ((val: HTMLInputElement): HTMLInputElement => {
        // 设定input的样式。
        val.style.opacity = val.style.width = val.style.height = '0'
        // 允许辅助功能锁定此元素。
        val.title = val.placeholder = 'Cli-Web'
        // 多语言支持/输入法选字开始处理
        val.addEventListener(
          'compositionstart',
          (): void => void (this.inputlock = true)
        )
        // 多语言支持/输入法选字结束处理
        val.addEventListener('compositionend', (): void => {
          this.inputlock = false
          /**
           * compositionend会在input事件的前后不定触发，此句确保了:
           * - 若input事件在compositionend后触发，则此事件仅用于重置输入锁。事件执行顺序:compositionend->input(由compositionend触发)->input(由浏览器触发,无效)
           * - 若input事件在compositionend前触发，则此事件会先重置输入锁，然后第二次触发input事件。事件执行顺序：input(由浏览器触发,无效)->compositionend->input(由compositionend触发)
           * 即，此事件确保了实际的input一定会在compositionend后触发。
           */
          if (val.value != '') val.dispatchEvent(new InputEvent('input')) // 兼容性/触发输入事件
        })
        // 功能键处理
        val.addEventListener('keydown', (ev: KeyboardEvent): boolean => {
          if (ev.key.length > 1) {
            this.ret(ev.key)
            return false
          }
          return true
        })
        // 输入事件处理
        val.addEventListener('input', (): void => {
          if (!this.inputlock) {
            if (val.value.length > 1) this.buffer.push(...val.value.slice(1))
            this.ret(val.value[0])
            val.value = ''
          }
        })
        return val
      })(document.createElement('input'))
    ]
    // 追加input为最后一个元素。
    this.obj.appendChild(this.input)
    // 自动聚焦。
    this.obj.addEventListener('click', (): void => this.input.focus())
  }
}
/**
 * RichTerminal 类。
 * 更好的 Terminal 包装。
 * 注意:RichTerminal 和 Terminal 不应并用。
 */
export class RichTerminal {
  private obj: Terminal
  private term_buffer: (HTMLElement | string)[] = []
  private _cursor = 0
  private putchar(elem: HTMLElement | string): void {
    if (elem instanceof HTMLElement) {
      this.term_buffer[this.cursor] = elem
      this.cursor++
    } else {
      if (elem == '\n')
        this.term_buffer[this.cursor] = document.createElement('br')
      else this.term_buffer[this.cursor] = elem
      this.cursor++
    }
  }
  /**
   * 获得当前光标位置。
   */
  get cursor(): number {
    return this._cursor
  }
  /**
   * 设置当前光标位置。
   */
  set cursor(newVal: number) {
    if (newVal > this.length) this._cursor = this.length
    else this._cursor = newVal
  }
  /**
   * 获得当前缓冲区大小。
   */
  get length(): number {
    return this.term_buffer.length
  }
  /**
   * 清除 Terminal 的内容。
   */
  clear(): void {
    this.cursor = (this.term_buffer = []).length
    this.obj.setContent(this.term_buffer)
  }
  /**
   * 对 Terminal setContent 的包装。
   * @param elem 要写入的内容。
   */
  setContent(elem: HTMLElement[]): void {
    this.cursor = (this.term_buffer = elem).length
    this.obj.setContent(elem)
  }
  /**
   * 对 Terminal getch 的包装。
   * @returns 用于获得用户输入内容的Promise。
   */
  getch(): Promise<string> {
    return this.obj.getch()
  }
  /**
   * 在 Terminal 追加写入多个字符串或元素。
   * @param str 要写入的字符串。
   */
  write(...str: (string | HTMLElement)[]): void {
    for (const i of str) {
      if (i instanceof HTMLElement) {
        this.putchar(i)
      } else {
        for (const s of i) this.putchar(s)
      }
    }
    this.obj.setContent(this.term_buffer)
  }
  /**
   * 获得一行文字，不带换行。回显。
   */
  async getline(): Promise<string> {
    function updateStr(
      buffer: (string | HTMLElement)[],
      pos: number,
      str: string[]
    ): (string | HTMLElement)[] {
      return [...buffer.slice(0, pos), ...str]
    }
    const cursor_temp: number = this.cursor
    let fin = '',
      cursor = 0
    for (;;) {
      const i: string = await this.getch()
      switch (i) {
        case 'ArrowLeft': {
          if (cursor > 0) cursor--
          break
        }
        case 'ArrowRight': {
          if (cursor < fin.length) cursor++
          break
        }
        case 'Backspace': {
          if (cursor > 0) {
            fin = fin.slice(0, cursor - 1) + fin.slice(cursor--)
            this.term_buffer = updateStr(
              this.term_buffer,
              (this.cursor = cursor_temp),
              Array.from(fin)
            )
            this.obj.setContent(this.term_buffer)
          }
          break
        }
        case 'Enter': {
          this.cursor = this.length
          this.write('\n')
          return fin
        }
        default: {
          if (i.length == 1) {
            fin = fin.slice(0, cursor) + i + fin.slice(cursor++)
            this.term_buffer = updateStr(
              this.term_buffer,
              (this.cursor = cursor_temp),
              Array.from(fin)
            )
            this.obj.setContent(this.term_buffer)
          }
        }
      }
    }
  }
  /**
   * 构造一个 RichTerminal。
   * @param obj 目标 Terminal。
   */
  constructor(obj: Terminal) {
    this.obj = obj
  }
}
