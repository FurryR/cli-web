# Terminal 类

## 概述

Terminal 类是基本的终端实现。**不推荐直接使用此类，请用 RichTerminal 替代。**

## setContent

```ts
setContent(elem: HTMLElement[]): void;
```

将终端内容设置为 elem，其中 elem 为 HTMLElement 的 Array。

示例：

```js
import {*} as cliweb from 'cli-web.js'
const term = new Terminal(document.getElementById('test'))
term.setContent([]); // 清屏
```

## getch

```ts
getch(): Promise<string>;
```

从终端读取一个字符，不回显。返回用于获得此字符的 Promise。

示例：

```js
import {*} as cliweb from 'cli-web.js'
const term = new Terminal(document.getElementById('test'))
term.getch().then(val => {
  console.log(val); // 输出用户输入的字符
})
```

## constructor

```ts
constructor(obj: HTMLElement);
```

在 obj 内构造一个控制台。obj 一般为 div 或者 body。

示例：

```js
import {*} as cliweb from 'cli-web.js'
const term = new Terminal(document.body)
```
