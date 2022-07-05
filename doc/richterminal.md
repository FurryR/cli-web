# RichTerminal 类

## 概述

RichTerminal 类是基于 Terminal 类的扩展实现。

## setContent

```ts
setContent(elem: HTMLElement[]): void;
```

对于 Terminal setContent 的包装。

示例：

```js
import {*} as cliweb from 'cli-web.js'
const term = new RichTerminal(new Terminal(document.getElementById('test')))
term.setContent([]); // 清屏
```

## clear

```ts
clear(): void;
```

清空 Terminal 的内容。

示例：

```js
import {*} as cliweb from 'cli-web.js'
const term = new RichTerminal(new Terminal(document.getElementById('test')))
term.clear(); // 清屏
```

## write

```ts
write(...str: (string | HTMLElement)[]): void;
```

向终端追加写入内容。str 可以为字符串，或者 HTML 元素。

string 特殊字符说明：'\n' 可以追加一个换行。

**注意：** DOM 元素将会被视作一个字符且特殊字符不会生效。

示例：

```js
import {*} as cliweb from 'cli-web.js'
const term = new RichTerminal(new Terminal(document.getElementById('test')))
term.write('Hello World\n');
```

## getline

```ts
getline(): Promise<string>;
```

读取一行字符串，回显在终端上。返回用于获得此字符串的 Promise。字符串不带换行。

示例：

```js
import {*} as cliweb from 'cli-web.js'
const term = new RichTerminal(new Terminal(document.getElementById('test')))
term.getline().then(val => {
  console.log(val); // 显示用户输入了什么
});
```

## getch

```ts
getch(): Promise<string>;
```

对于 Terminal getch 的包装。

示例：

```js
import {*} as cliweb from 'cli-web.js'
const term = new RichTerminal(new Terminal(document.getElementById('test')))
term.getch().then(val => {
  console.log(val); // 输出用户输入的字符
})
```

## cursor

```ts
get cursor(): number;
set cursor(newVal: number);
```

当前光标的位置。用于重定位光标。

**注意：** 当设定为超过`this.length`（不含等于）的数值时，会被赋值为`this.length`。

示例：

```js
import {*} as cliweb from 'cli-web.js'
const term = new RichTerminal(new Terminal(document.getElementById('test')))
term.write('Tell');
term.cursor = 0; // 重置term到0。
term.write('H'); // 将'T'变为'H'
term.cursor = term.length; // 光标回到末尾
term.write('o'); // 追加'o'
// 结果为'Hello'
```

## length

```ts
get length(): number;
```

当前屏幕上字符的数量，或缓冲区的长度。

示例：

```js
import {*} as cliweb from 'cli-web.js'
const term = new RichTerminal(new Terminal(document.getElementById('test')))
term.write('Hello');
console.log(term.length); // 5
```

## constructor

```ts
constructor(obj: Terminal);
```

由基本控制台 obj 构造一个扩展控制台。

示例：

```js
import {*} as cliweb from 'cli-web.js'
const term = new RichTerminal(new Terminal(document.body))
```
