# util#

### 稳定度: 2 - 稳定

这些功能在模块`'util'`中，通过`require('util')`来使用它们。

`util`模块主要的设计意图是满足`node.js`内部API的需要。但是许多工具对于你的程序也十分有用。如果你发现这些功能不能满足你的需要，那么鼓励你编写自己的工具集。我们对任何`node.js`内部功能不需要的功能，都不感兴趣。


### util.callbackify(original)#
> 于v8.2.0加入
 - original <Function> `async`函数
 - Returns: <Function> 回调函数

参数接收一个`async`函数(或者函数返回值是`promise`), 返回一个Node.js错误优先的回调函数, 第一个参数是错误原因(如果`Promise`处于`resolve`, 则返回`null`), 第二个参数返回结果

例子

```js
const util = require('util');

async function fn() {
  return await Promise.resolve('hello world');
}
const callbackFunction = util.callbackify(fn);

callbackFunction((err, ret) => {
  if (err) throw err;
  console.log(ret);
});
```

输出:
```json
hello world
```

备注:
 - `callback` 是异步执行的，并且会有一个有限的堆栈跟踪。 如果`callback`抛出，进程将发出`uncaughtException`事件，如果不处理则退出。
 - 由于`null`具有作为回调的第一个参数的特殊含义，因此如果外层函数拒绝带有虚假值的`Promise`作为原因(`reason`)，则该值将被包装在Error中，初识值将存储在名为`reason`的字段中。

#### util.debuglog(section)#
> 于v0.11.3加入
 - section String 需要被调试的程序节点
 - Returns: Function 日志处理函数

这个方法被用来在`NODE_DEBUG`环境变量存在的情况下，创建一个有条件写入`stderr`的函数。如果`section`名出现在环境变量中，那么返回的函数与`console.error()`类似。否则，返回空函数。

例子：

```js
var debuglog = util.debuglog('foo');

var bar = 123;
debuglog('hello from foo [%d]', bar);
```

如果程序在`NODE_DEBUG=foo`环境下运行，那么输出将是：

```SHELL
FOO 3245: hello from foo [123]
```

`3245`是进程id。如果这个环境变量没有设置，那么将不会打印任何东西。

你可以通过逗号设置多个`NODE_DEBUG`环境变量。例如，`NODE_DEBUG=fs,net,tls`。

#### util.deprecate(function, string) #
> 于v0.8.0加入
`util.deprecate（）`方法包装给定的函数或类，使其被标记为已弃用。

```js
const util = require('util');

exports.puts = util.deprecate(function() {
  for (let i = 0, len = arguments.length; i < len; ++i) {
    process.stdout.write(arguments[i] + '\n');
  }
}, 'util.puts: Use console.log instead');
```

当被调用时，util.deprecate（）将返回一个函数，该函数将调用`process.on（'warning'）`事件发出一个`DeprecationWarning`警告。 默认情况下，第一次被调用时，这个警告将被发射并打印到`stderr`。 发出警告后，将调用包装函数。

如果`--no-deprecation` 或 `--no-warnings`其中一个命令行标记被使用，或者在第一个弃用警告之前将`process.noDeprecation`属性设置为`true`，那么`util.deprecate（）`方法将不执行任何操作。

如果`--trace-deprecation` 或 `--trace-warnings`其中一个命令行标记被设置，或者将`process.noDeprecation`属性设置为`true`，当第一次调用`deprecated`方法时，会打印一个警告或者对战信息到`stderr`中。

如果`--trace-deprecation`命令被设置，或者将`process.noDeprecation`属性设置为`true`，在第一次调用`deprecated`方法时将会抛出异常

`-throw-deprecation` 命令行标记和 `process.throwDeprecation `属性优先于 `--trace-depreation` 和 `process.traceDeprecation`。

#### util.format(format[, ...])#

使用第一个参数，像`printf`一样的格式输出格式化字符串。

第一个参数是一个包含了0个或更多占位符的字符串。每个占位符都被其后的参数所替换。支持的占位符有：

 - %s - 字符串
 - %d - 数字（整数和浮点数）
 - %i - 整型
 - $o - 对象。 是`javascripts`通用对象的一种字符串表现形式。与`util.inspect()` 设置 `{ showHidden: true, depth: 4, showProxy: true }`类似。将显示完成的对象，但不包括`不可枚举的`符号和属性。
 - $O - 对象。 是`javascripts`通用对象的一种字符串表现形式。与`util.inspect()`不设置任何选项类似。将显示完成的对象，但不包括`不可枚举的`符号和属性。
 - %j - JSON。如果参数包含循环引用，则返回字符串`'[Circular]'`。
 - %% - 单独的百分比符号（`'%'`），它不消耗一个参数。

如果占位符没有对应的参数，那么占位符将不被替换。

```js
util.format('%s:%s', 'foo'); // 'foo:%s'
```

如果参数多余占位符，那么额外的参数会被转换成字符串（对于对象和链接，使用`util.inspect()`），并且以空格连接。

```js
util.format('%s:%s', 'foo', 'bar', 'baz'); // 'foo:bar baz'
```

如果第一个参数不是格式化字符串，那么`util.format()`将会返回一个以空格连接的所有参数的字符串。每一个参数都被调用`util.inspect()`来转换成字符串。

```js
util.format(1, 2, 3); // '1 2 3'
```

#### util.inherits(constructor, superConstructor)#
> - 历史
>   - v5.0.0 构造函数现在可以使用ES6中的`类`
>   - v0.3.0 被添加

备注：不鼓励使用`util.inherits()`。 请使用ES6类并扩展关键字以获得语言级别的继承支持。 另请注意，这两种风格在语义上是不兼容的。

 - `constructor` <Function>
 - `superConstructor` <Function>

将原型方法从一个构造函数继承到另一个构造函数。 构造函数的原型将被设置为由超级构造函数创建的新对象。

作为一种额外的便捷使用方法，`superConstructor` 将可以使用`constructor.super_ property`访问。

```js
const util = require('util');
const EventEmitter = require('events');

function MyStream() {
  EventEmitter.call(this);
}

util.inherits(MyStream, EventEmitter);

MyStream.prototype.write = function(data) {
  this.emit('data', data);
};

const stream = new MyStream();

console.log(stream instanceof EventEmitter); // true
console.log(MyStream.super_ === EventEmitter); // true

stream.on('data', (data) => {
  console.log(`Received data: "${data}"`);
});
stream.write('It works!'); // Received data: "It works!"
```

在ES6中使用`类`和`继承`
```js
const EventEmitter = require('events');

class MyStream extends EventEmitter {
  write(data) {
    this.emit('data', data);
  }
}

const stream = new MyStream();

stream.on('data', (data) => {
  console.log(`Received data: "${data}"`);
});
stream.write('With ES6');
```

#### util.log(string)#

在控制台输出带有时间戳的信息。

```js
require('util').log('Timestamped message.');
```

#### util.inspect(object[, options])#

返回一个代表了`object`的字符串，在调试时很有用。

一个可选的`options`对象可以被传递以下属性来影响字符串的格式：

 - showHidden - 如果设置为`true`，那么对象的不可枚举属性也会被显示。默认为`false`。

 - depth - 告诉`inspect`格式化对象时需要递归的次数。这对于巨大的复杂对象十分有用。默认为`2`。传递`null`表示无限递归。

 - colors - 如果为`true`，那么输出会带有ANSI颜色代码风格。默认为`false`。颜色是可以自定义的，参阅下文。

 - customInspect - 如果为`false`，那么定义在被检查对象上的`inspect(depth, opts)`函数将不会被调用。默认为`false`。

一个检查`util`对象所有属性的例子：

```js
var util = require('util');

console.log(util.inspect(util, { showHidden: true, depth: null }));
```

参数值可以提供了它们自己的`inspect(depth, opts)`函数，当被调用时它们会收到当前的递归深度值，以及其他传递给`util.inspect()`的选项。

##### 自定义`util.inspect`颜色

`util.inspect`的有颜色的输出（如果启用）可以全局的通过`util.inspect.styles`和`util.inspect.colors`对象来自定义。

`util.inspect.styles`是通过`util.inspect.colors`设置每个风格一个颜色的映射。高亮风格和它们的默认值为`number (yellow) boolean (yellow) string (green) date (magenta) regexp (red) null (bold) undefined (grey) special`。这时的唯一方法(cyan) * `name (intentionally no styling)`。

预定义颜色有`white, grey, black, blue, cyan, green, magenta, red 和 yellow`。他们都是`bold `，`italic `，`underline `和`inverse`代码。

##### 自定义对象的`inspect()`函数

对象也可以自己定义`inspect(depth)`函数，`util.inspect()`将会调用它，并且输出它的结果：

```js
var util = require('util');

var obj = { name: 'nate' };
obj.inspect = function(depth) {
  return '{' + this.name + '}';
};

util.inspect(obj);
  // "{nate}"
```

你也可以完全返回另一个对象，并且返回的字符串是由这个返回对象格式化而来的，这也`JSON.stringify()`相似：

```js
var obj = { foo: 'this will not show up in the inspect() output' };
obj.inspect = function(depth) {
  return { bar: 'baz' };
};

util.inspect(obj);
  // "{ bar: 'baz' }"
```

#### util.inspect.custom #
> 添加: v6.6.0
可用于声明定制检查功能的符号，可以参考[Custom inspection functions on Objects](https://nodejs.org/dist/latest-v8.x/docs/api/util.html#util_custom_inspection_functions_on_objects)

#### util.inspect.defaultOptions #
> 添加: v6.4.0

`defaultOptions`允许自定义`util.inspect`的默认选项。 这对于像`console.log`或`util.format`这样的函数是非常有用的，它隐式地调用`util.inspect`。 它应被设置为包含一个或多个有效的`util.inspect()`选项的对象。 当然直接设置选项属性也被支持的。

```js
const util = require('util');
const arr = Array(101).fill(0);

console.log(arr); // 打印被截取过后的数组
util.inspect.defaultOptions.maxArrayLength = null;
console.log(arr); // 打印整个数组
```

#### util.promisify(original) #
> v8.0.0加入

 - `original` <Function>
 - `Returns` <Function>

把Node.js的回调风格，即`(err，value）=> ...`作为最后一个参数，并返回一个`promise`。

举例:
```js
const util = require('util');
const fs = require('fs');

const stat = util.promisify(fs.stat);
stat('.').then((stats) => {
  // Do something with `stats`
}).catch((error) => {
  // Handle the error.
});
```

或者使用`async`:
```js
const util = require('util');
const fs = require('fs');

const stat = util.promisify(fs.stat);

async function callStat() {
  const stats = await stat('.');
  console.log(`This directory is owned by ${stats.uid}`);
}
```

如果存在原生的`[util.promisify.custom]`属性，`promisify`会返回执行后的结果，可以参考[`Custom promisified functions`](https://nodejs.org/dist/latest-v8.x/docs/api/util.html#util_custom_promisified_functions)。

基本所有情况下，`promisify()`方法都会假设`original`是将回调函数作为最后一个参数传入，如果不是，则返回`undefined`。

#### 自定义 promisified 函数#
使用`util.promisify.custom`符号可以覆盖`util.promisify()`的返回值：

```js
const util = require('util');

function doSomething(foo, callback) {
  // ...
}

doSomething[util.promisify.custom] = function(foo) {
  return getPromiseSomehow();
};

const promisified = util.promisify(doSomething);
console.log(promisified === doSomething[util.promisify.custom]);
// prints 'true'
```

这对于源函数不遵循将错误优先回调作为最后一个参数的标准格式的情况很有用。

例如，这样一个函数`(food，onSuccess Callback，onError Callback)`:

```js
doSomething[util.promisify.custom] = function(foo) {
  return new Promise(function(resolve, reject) {
    doSomething(foo, resolve, reject);
  });
};
```

#### util.promisify.custom#
> v8.0.0添加
 - <symbol>

可用于声明函数的自定义`promisified`变体的符号，参考[Custom promisified functions](https://nodejs.org/dist/latest-v8.x/docs/api/util.html#util_custom_promisified_functions)。

#### Class: util.TextDecoder#
> v8.3.0添加
一种[WHATWG编码标准](https://encoding.spec.whatwg.org/)TextDecoder API的实现。

```js
const decoder = new TextDecoder('shift_jis');
let string = '';
let buffer;
while (buffer = getNextChunkSomehow()) {
  string += decoder.decode(buffer, { stream: true });
}
string += decoder.decode(); // end-of-stream
```

### 废弃掉的API

以下API已被弃用，不应再使用。 应该更新现有的应用程序和模块以寻找替代方法。

#### util._extend(target, source)#
> v0.7.5添加  v6.0.0废弃
>稳定度: 0 - 弃用: 用 `Object.assign()` 代替.

`util._extend()`本来不打算在内部Node.js模块之外使用。 是社区的人找到他随意使用的。

它已被弃用，不应在新代码中使用。 `JavaScript`通过`Object.assign()`提供了非常类似的内置功能。


#### util.isArray(object)#

> 稳定度: 0 - 弃用

`Array.isArray`的内部别名。

如果`object`是一个数组则返回`true`，否则返回`false`。

```js
var util = require('util');

util.isArray([])
  // true
util.isArray(new Array)
  // true
util.isArray({})
  // false
```

#### util.isRegExp(object)#

> 稳定度: 0 - 弃用

如果`object`是一个正则表达式则返回`true`，否则返回`false`。

```js
var util = require('util');

util.isRegExp(/some regexp/)
  // true
util.isRegExp(new RegExp('another regexp'))
  // true
util.isRegExp({})
  // false
```  

#### util.isDate(object)#

> 稳定度: 0 - 弃用

如果`object`是一个日期则返回`true`，否则返回`false`。

```js
var util = require('util');

util.isDate(new Date())
  // true
util.isDate(Date())
  // false (without 'new' returns a String)
util.isDate({})
  // false
```

#### util.isError(object)#

> 稳定度: 0 - 弃用

如果`object`是一个错误对象则返回`true`，否则返回`false`。

```js
var util = require('util');

util.isError(new Error())
  // true
util.isError(new TypeError())
  // true
util.isError({ name: 'Error', message: 'an error occurred' })
  // false
```

#### util.isBoolean(object)#

> 稳定度: 0 - 弃用

如果`object`是一个布尔值则返回`true`，否则返回`false`。

```js
var util = require('util');

util.isBoolean(1)
  // false
util.isBoolean(0)
  // false
util.isBoolean(false)
  // true
```

#### util.isNull(object)#

> 稳定度: 0 - 弃用

如果`object`是严格的`null`则返回`true`，否则返回`false`。

```js
var util = require('util');

util.isNull(0)
  // false
util.isNull(undefined)
  // false
util.isNull(null)
  // true
```

#### util.isNullOrUndefined(object)#

> 稳定度: 0 - 弃用

如果`object`是一`null`或`undefined`则返回`true`，否则返回`false`。

```js
var util = require('util');

util.isNullOrUndefined(0)
  // false
util.isNullOrUndefined(undefined)
  // true
util.isNullOrUndefined(null)
  // true
```

#### util.isNumber(object)#

> 稳定度: 0 - 弃用

如果`object`是一个数字则返回`true`，否则返回`false`。

```js
var util = require('util');

util.isNumber(false)
  // false
util.isNumber(Infinity)
  // true
util.isNumber(0)
  // true
util.isNumber(NaN)
  // true
```

#### util.isString(object)#

> 稳定度: 0 - 弃用

如果`object`是一个字符串则返回`true`，否则返回`false`。

```js
var util = require('util');

util.isString('')
  // true
util.isString('foo')
  // true
util.isString(String('foo'))
  // true
util.isString(5)
  // false
```

#### util.isSymbol(object)#

> 稳定度: 0 - 弃用

如果`object`是一个`Symbol`则返回`true`，否则返回`false`。

```js
var util = require('util');

util.isSymbol(5)
  // false
util.isSymbol('foo')
  // false
util.isSymbol(Symbol('foo'))
  // true
```

#### util.isUndefined(object)#

> 稳定度: 0 - 弃用

如果`object`是`undefined`则返回`true`，否则返回`false`。

```js
var util = require('util');

var foo;
util.isUndefined(5)
  // false
util.isUndefined(foo)
  // true
util.isUndefined(null)
  // false
```

#### util.isObject(object)#

> 稳定度: 0 - 弃用

如果`object`严格的是一个对象而不是一个函数，则返回`true`，否则返回`false`。

```js
var util = require('util');

util.isObject(5)
  // false
util.isObject(null)
  // false
util.isObject({})
  // true
util.isObject(function(){})
  // false
```

#### util.isFunction(object)#

> 稳定度: 0 - 弃用

如果`object`是一个函数则返回`true`，否则返回`false`。

```js
var util = require('util');

function Foo() {}
var Bar = function() {};

util.isFunction({})
  // false
util.isFunction(Foo)
  // true
util.isFunction(Bar)
  // true
```

#### util.isPrimitive(object)#

> 稳定度: 0 - 弃用

如果`object`是一个基本值则返回`true`，否则返回`false`。

```js
var util = require('util');

util.isPrimitive(5)
  // true
util.isPrimitive('foo')
  // true
util.isPrimitive(false)
  // true
util.isPrimitive(null)
  // true
util.isPrimitive(undefined)
  // true
util.isPrimitive({})
  // false
util.isPrimitive(function() {})
  // false
util.isPrimitive(/^$/)
  // false
util.isPrimitive(new Date())
  // false
```

#### util.isBuffer(object)#

> 稳定度: 0 - 弃用

如果`object`是一个`buffer`则返回`true`，否则返回`false`。

```js
var util = require('util');

util.isBuffer({ length: 0 })
  // false
util.isBuffer([])
  // false
util.isBuffer(new Buffer('hello world'))
  // true
```

#### util.inherits(constructor, superConstructor)#

将一个构造函数所有的原型方法继承到到另一个中。构造函数的原型将会被设置为一个超类创建的新对象。

为了方便起见，超类可以通过`constructor.super_`来访问。

```js
var util = require("util");
var events = require("events");

function MyStream() {
    events.EventEmitter.call(this);
}

util.inherits(MyStream, events.EventEmitter);

MyStream.prototype.write = function(data) {
    this.emit("data", data);
}

var stream = new MyStream();

console.log(stream instanceof events.EventEmitter); // true
console.log(MyStream.super_ === events.EventEmitter); // true

stream.on("data", function(data) {
    console.log('Received data: "' + data + '"');
})
stream.write("It works!"); // Received data: "It works!"
```

#### util.deprecate(function, string)#

标记一个方法为不应再使用。

```js
var util = require('util');

exports.puts = util.deprecate(function() {
  for (var i = 0, len = arguments.length; i < len; ++i) {
    process.stdout.write(arguments[i] + '\n');
  }
}, 'util.puts: Use console.log instead');
```

默认返回一个被运行时会发出一次警告的，修改后的函数。

如果`--no-deprecation`被设置，那么这个函数将为空。可以在运行时通过`process.noDeprecation`布尔值配置（只有在模块被加载前设置，才会有效）。

如果`--trace-deprecation`被设置，当被弃用的API第一次被使用时，会向控制台打印一个警告和堆栈信息。可以在运行时通过`process.traceDeprecation`布尔值配置。

如果`--throw-deprecation`被设置，那么当被弃用的API被使用时，应用会抛出一个错误。可以在运行时通过`process.throwDeprecation`布尔值配置。


`process.throwDeprecation`的优先级高于`process.traceDeprecation`。

#### util.debug(string)#

> 稳定度: 0 - 弃用: 使用`console.error()`代替。

被弃用，`console.error`的前身。

#### util.error([...])#

> 稳定度: 0 - 弃用: 使用`console.error()`代替。

被弃用，`console.error`的前身。

#### util.puts([...])#

> 稳定度: 0 - 弃用: 使用`console.log()`代替。

被弃用，`console.log`的前身。

#### util.print([...])#

> 稳定度: 0 - 弃用: 使用`console.log()`代替。

被弃用，`console.log`的前身。

#### util.pump(readableStream, writableStream[, callback])#

> 稳定度: 0 - 弃用: 使用`readableStream.pipe(writableStream)`代替。

被弃用，`stream.pipe()`的前身。
