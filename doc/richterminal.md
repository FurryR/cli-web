# RichTerminal 类

## 概述
RichTerminal类是基于Terminal类的扩展实现。

## setContent

```ts
setContent(elem: HTMLElement[]): void;
```

对于Terminal setContent的包装。

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

清空Terminal的内容。

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

向终端追加写入内容。str可以为字符串，或者HTML元素。

string特殊字符说明：'\b' 可以将光标回退到上个元素，'\n' 可以追加一个换行。

**注意：**DOM元素将会被视作一个字符且特殊字符不会生效。

示例：
```js
import {*} as cliweb from 'cli-web.js'
const term = new RichTerminal(new Terminal(document.getElementById('test')))
term.write('你好啊\b','世界\n');
```
## getline

```ts
getline(): Promise<string>;
```

读取一行字符串，回显在终端上。返回用于获得此字符串的Promise。字符串不带换行。

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

对于Terminal getch的包装。

示例：
```js
import {*} as cliweb from 'cli-web.js'
const term = new RichTerminal(new Terminal(document.getElementById('test')))
term.getch().then(val => {
  console.log(val); // 输出用户输入的字符
})
```

## constructor

```ts
constructor(obj: Terminal);
```

由基本控制台obj构造一个扩展控制台。

示例：
```js
import {*} as cliweb from 'cli-web.js'
const term = new RichTerminal(new Terminal(document.body))
```