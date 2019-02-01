# Child Process


### 稳定度: 2 - 稳定
`node.js`通过`child_process`模块提供了三向的`popen`功能。

可以无阻塞地通过子进程的`stdin`，`stdout`和`stderr`以流的方式传递数据。（注意某些程序在内部使用了行缓冲I/O，这不会影响`node.js`，但是这意味你传递给子进程的数据可能不会在第一时间被消费）。

可以通过`require('child_process').spawn()`或`require('child_process').fork()`创建子进程。这两者间的语义有少许差别，将会在后面进行解释。

当以写脚本为目的时，你可以会觉得使用同步版本的方法会更方便。

#### Class: ChildProcess#
`ChildProcess` 是一个`EventEmitter`。

子进程总是有三个与之相关的流。`child.stdin`，`child.stdout`和`child.stderr`。他们可能会共享父进程的stdio流，或者也可以是独立的被导流的流对象。

`ChildProcess`类并不是用来直接被使用的。应当使用`spawn()`,`exec()`,`execFile()`或`fork()`方法来创建一个子进程实例。

#### Event: 'error'#

 - err Error 错误对象

发生于：

进程不能被创建时，进程不能杀死时，给子进程发送信息失败时。
注意`exit`事件在一个错误发生后可能触发。如果你同时监听了这两个事件来触发一个函数，需要记住不要让这个函数被触发两次。

参阅 `ChildProcess.kill()` 和 `ChildProcess.send()`。

#### Event: 'exit'#

 - code Number 如果进程正常退出，则为退出码。如果进程被父进程杀死，则为被传递的信号字符串。这个事件将在子进程结束运行时被触发。

注意子进程的stdio流可能仍为打开状态。

还需要注意的是，`node.js`已经为我们添加了'SIGINT'信号和'SIGTERM'信号的事件处理函数，所以在父进程发出这两个信号时，进程将会退出。

参阅 `waitpid(2)`。

#### Event: 'close'#

 - code Number 如果进程正常退出，则为退出码。如果进程被父进程杀死，则为被传递的信号字符串。这个事件将在子进程结束运行时被触发。这个事件将会在子进程的`stdio`流都关闭时触发。这是与`exit`的区别，因为可能会有几个进程共享同样的`stdio`流。

#### Event: 'disconnect'#

在父进程或子进程中使用`.disconnect() `方法后这个事件会触发。在断开之后，将不能继续相互发送信息，并且子进程的`.connected`属性将会是`false`。

#### Event: 'message'#

 - message Object 一个已解析的JSON对象或一个原始类型值
 - sendHandle Handle object 一个`Socket`或`Server`对象

通过`.send(message, [sendHandle])`发送的信息可以通过监听`message`事件获取到。

#### child.stdin#

 - Stream object

一个代表了子进程的`stdin`的可写流。通过`end()`方法关闭此流可以终止子进程。

如果子进程通过`spawn`创建时`stdio`没有被设置为`pipe`，那么它将不会被创建。

`child.stdin`为`child.stdio`中对应元素的快捷引用。它们要么都指向同一个对象，要么都为null。

#### child.stdout#

 - Stream object

一个代表了子进程的`stdout`的可读流。

如果子进程通过`spawn`创建时`stdio`没有被设置为`pipe`，那么它将不会被创建。

`child.stdout`为`child.stdio`中对应元素的快捷引用。它们要么都指向同一个对象，要么都为null。

#### child.stderr#

 - Stream object

一个代表了子进程的`stderr`的可读流。

如果子进程通过`spawn`创建时`stdio`没有被设置为`pipe`，那么它将不会被创建。

`child.stderr`为`child.stdio`中对应元素的快捷引用。它们要么都指向同一个对象，要么都为null。

#### child.stdio#

 - Array

一个包含了子进程的管道的稀疏数组，元素的位置对应着利用`spawn`创建子进程时`stdio`配置参数里被设置为`pipe`的位置。注意索引为0-2的流分别与`ChildProcess.stdin`， `ChildProcess.stdout`和`ChildProcess.stderr`引用的是相同的对象。

在下面的例子中，在`stdio`参数中只有索引为1的元素被设置为了`pipe`，所以父进程中只有`child.stdio[1]`是一个流，其他的元素都为`null`。

```js
var assert = require('assert');
var fs = require('fs');
var child_process = require('child_process');

child = child_process.spawn('ls', {
    stdio: [
      0, // use parents stdin for child
      'pipe', // pipe child's stdout to parent
      fs.openSync('err.out', 'w') // direct child's stderr to a file
    ]
});

assert.equal(child.stdio[0], null);
assert.equal(child.stdio[0], child.stdin);

assert(child.stdout);
assert.equal(child.stdio[1], child.stdout);

assert.equal(child.stdio[2], null);
assert.equal(child.stdio[2], child.stderr);
```

#### child.pid#

 - Integer

子进程的`PID`。

例子：

```js
var spawn = require('child_process').spawn,
    grep  = spawn('grep', ['ssh']);

console.log('Spawned child pid: ' + grep.pid);
grep.stdin.end();
```

#### child.connected#

 - Boolean 在`.disconnect`方法被调用后将会被设置为`false`。如果`.connected`属性为`false`，那么将不能再向子进程发送信息。

#### child.kill([signal])#

 - signal String

给子进程传递一个信号。如果没有指定任何参数，那么将发送`'SIGTERM'`给子进程。更多可用的信号请参阅`signal(7)`。

```js
var spawn = require('child_process').spawn,
    grep  = spawn('grep', ['ssh']);

grep.on('close', function (code, signal) {
  console.log('child process terminated due to receipt of signal ' + signal);
});

// send SIGHUP to process
grep.kill('SIGHUP');
```

在信号不能被送达时，可能会产生一个`error`事件。给一个已经终止的子进程发送一个信号不会发生错误，但可以操作不可预料的后果：如果该子进程的`PID`已经被重新分配给了另一个进程，那么这个信号会被传递到另一个进程中。大家可以猜想这将会发生什么样的情况。

注意这个函数仅仅是名字叫kill，给子进程发送的信号可能不是去关闭它的。这个函数仅仅只是给子进程发送一个信号。

参阅`kill(2)`。

#### child.send(message[, sendHandle])#

 - message Object
 - sendHandle Handle object

当使用`child_process.fork()`时，你可以使用`child.send(message, [sendHandle])`向子进程发送信息，子进程里会触发`message`事件当收到信息时。

例子：

```js
var cp = require('child_process');

var n = cp.fork(__dirname + '/sub.js');

n.on('message', function(m) {
  console.log('PARENT got message:', m);
});

n.send({ hello: 'world' });
```

子进程代码, `sub.js`可能看起来类似这样:

```js
process.on('message', function(m) {
  console.log('CHILD got message:', m);
});

process.send({ foo: 'bar' });
```

在子进程中，`process`对象将有一个`send()`方法，在它的信道上收到一个信息时，信息将以对象的形式返回。

请注意父进程，子进程中的`send()`方法都是同步的，所以发送大量数据是不被建议的（可以使用管道代替，参阅`child_process.spawn`）。

发送`{cmd: 'NODE_foo'}`信息时是一个特殊情况。所有的在`cmd`属性中包含了`NODE_`前缀的信息都不会触发`message`事件，因为这是`node.js`内核使用的内部信息。包含这个前缀的信息都会触发`internalMessage`事件。请避免使用这个事件，它在改变的时候不会收到通知。

`child.send()`的`sendHandle`参数时用来给另一个进程发送一个`TCP服务器`或一个`socket`的。将之作为第二个参数传入，子进程将在`message`事件中会收到这个对象。

如果信息不能被发送的话将会触发一个`error`事件，比如子进程已经退出了。

例子：发送一个`server`对象

```js
var child = require('child_process').fork('child.js');

// Open up the server object and send the handle.
var server = require('net').createServer();
server.on('connection', function (socket) {
  socket.end('handled by parent');
});
server.listen(1337, function() {
  child.send('server', server);
});
```

子进程将会收到`server`对象：

```js
process.on('message', function(m, server) {
  if (m === 'server') {
    server.on('connection', function (socket) {
      socket.end('handled by child');
    });
  }
});
```

注意这个`server`现在已经被父进程和子进程所共享，这意味着链接将可能被父进程处理也可能被子进程处理。

对于`dgram`服务器，流程也是完全一样的。使用`message`事件而不是`connection`事件，使用`server.bind`问不是`server.listen`（目前只支持`UNIX`平台）。

例子：发送一个`socket`对象

以下是发送一个`socket`的例子。创建了两个子进程。并且将地址为`74.125.127.100`的链接通过将`socket`发送给"special"子进程来视作VIP。其他的`socket`则被发送给"normal"子进程。

```js
var normal = require('child_process').fork('child.js', ['normal']);
var special = require('child_process').fork('child.js', ['special']);

// Open up the server and send sockets to child
var server = require('net').createServer();
server.on('connection', function (socket) {

  // if this is a VIP
  if (socket.remoteAddress === '74.125.127.100') {
    special.send('socket', socket);
    return;
  }
  // just the usual dudes
  normal.send('socket', socket);
});
server.listen(1337);

`child.js`:
```js
process.on('message', function(m, socket) {
  if (m === 'socket') {
    socket.end('You were handled as a ' + process.argv[2] + ' person');
  }
});
```

注意一旦一个单独的`socket`被发送给了子进程，那么父进程将不能追踪到这个`socket`被删除的时间，这个情况下`.connections`属性将会成为`null`。在这个情况下同样也不推荐使用`.maxConnections`属性。

#### child.disconnect()#

关闭父进程与子进程间的IPC信道，它让子进程非常优雅地退出，因为已经活跃的信道了。在调用了这个方法后，父进程和子进程的`.connected`标签都会被设置为`false`，将不能再发送信息。

`disconnect`事件在进程不再有消息接收时触发。

注意，当子进程中有与父进程通信的IPC信道时，你也可以在子进程中调用`process.disconnect()`。

### 异步进程的创建#
以下方法遵循普遍的异步编程模式（接受一个回调函数或返回一个`EventEmitter`）。

#### child_process.spawn(command[, args][, options])#

 - command String 将要运行的命令
 - args Array 字符串参数数组

 - __options Object__
  - cwd String 子进程的当前工作目录
  - env Object 环境变量键值对
  - stdio Array|String 子进程的stdio配置
  - detached Boolean 这个子进程将会变成进程组的领导
  - uid Number 设置用户进程的ID
  - gid Number 设置进程组的ID

 - return: ChildProcess object

利用给定的命令以及参数执行一个新的进程，如果没有参数数组，那么`args`将默认是一个空数组。

第三个参数时用来指定以为额外的配置，以下是它的默认值：

```js
{ cwd: undefined,
  env: process.env
}
```

使用`cwd`来指定子进程的工作目录。如果没有指定，默认值是当前父进程的工作目录。

使用`env`来指定子进程中可用的环境变量，默认值是`process.env`。

Example of running ls -lh /usr, capturing stdout, stderr, and the exit code:
一个运行`ls -lh /usr`，获取`stdout`，`stderr`和退出码得例子：

```js
var spawn = require('child_process').spawn,
    ls    = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});

ls.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

ls.on('close', function (code) {
  console.log('child process exited with code ' + code);
});
```

例子：一个非常精巧的运行`ps ax | grep ssh`的方式

```js
var spawn = require('child_process').spawn,
    ps    = spawn('ps', ['ax']),
    grep  = spawn('grep', ['ssh']);

ps.stdout.on('data', function (data) {
  grep.stdin.write(data);
});

ps.stderr.on('data', function (data) {
  console.log('ps stderr: ' + data);
});

ps.on('close', function (code) {
  if (code !== 0) {
    console.log('ps process exited with code ' + code);
  }
  grep.stdin.end();
});

grep.stdout.on('data', function (data) {
  console.log('' + data);
});

grep.stderr.on('data', function (data) {
  console.log('grep stderr: ' + data);
});

grep.on('close', function (code) {
  if (code !== 0) {
    console.log('grep process exited with code ' + code);
  }
});
```

一个检查执行失败的例子：

```js
var spawn = require('child_process').spawn,
    child = spawn('bad_command');

child.on('error', function (err) {
  console.log('Failed to start child process.');
});
```

##### options.stdio

作为快捷方式，`stdio`的值可以是一下字符串之一：

'pipe' - ['pipe', 'pipe', 'pipe'], 这是默认值
'ignore' - ['ignore', 'ignore', 'ignore']
'inherit' - [process.stdin, process.stdout, process.stderr]或[0,1,2]

否则，`child_process.spawn()`的`stdio`参数时一个数组，数组中的每一个索引的对应子进程中的一个文件标识符。可以是下列值之一：

'pipe' - 创建一个子进程与父进程之间的管道，管道的父进程端已父进程的`child_process`对象的属性（`ChildProcess.stdio[fd]`）暴露给父进程。为文件表示（fds）0 - 2 创建的管道也可以通过`ChildProcess.stdin`，`ChildProcess.stdout`和`ChildProcess.stderr`分别访问。

'ipc' - 创建一个子进程和父进程间 传输信息/文件描述符 的IPC信道。一个子进程最多可能有一个IPC stdio 文件描述符。设置该选项将激活`ChildProcess.send()`方法。如果子进程向此文件描述符中写入JSON数据，则会触发`
ChildProcess.on('message')`。如果子进程是一个`node.js`程序，那么IPC信道的存在将会激活`process.send()`和`process.on('message')`。

'ignore' - 不在子进程中设置文件描述符。注意`node.js`总是会为通过`spawn`创建的子进程打开文件描述符(fd) 0 - 2。如果这其中任意一项被设置为了`ignore`，`node.js`会打开`/dev/null`并将其附给子进程对应的文件描述符（fd）。

Stream object - 与子进程共享一个与tty，文件，socket，或管道相关的可读/可写流。该流底层（underlying）的文件标识在子进程中被复制给stdio数组索引对应的文件描述符（fd）。

Positive integer - 该整形值被解释为父进程中打开的文件标识符。他与子进程共享，和Stream被共享的方式相似。

null, undefined - 使用默认值。For 对于stdio fds 0,1,2（或者说`stdin`,`stdout`和`stderr`），pipe管道被建立。对于fd 3及往后，默认为`ignore`。

例子：

```js
var spawn = require('child_process').spawn;

// Child will use parent's stdios
spawn('prg', [], { stdio: 'inherit' });

// Spawn child sharing only stderr
spawn('prg', [], { stdio: ['pipe', 'pipe', process.stderr] });

// Open an extra fd=4, to interact with programs present a
// startd-style interface.
spawn('prg', [], { stdio: ['pipe', null, null, null, 'pipe'] });
```

##### options.detached

如果`detached`选项被设置，子进程将成为新进程组的领导。这使得在父进程退出后，子进程继续执行成为可能。

默认情况下，父进程会等待脱离了的子进程退出。要阻止父进程等待一个给出的子进程，请使用`child.unref()`方法，则父进程的事件循环的计数中将不包含这个子进程。

一个脱离的长时间运行的进程，以及将它的输出重定向到文件中的例子：

```js
 var fs = require('fs'),
     spawn = require('child_process').spawn,
     out = fs.openSync('./out.log', 'a'),
     err = fs.openSync('./out.log', 'a');

 var child = spawn('prg', [], {
   detached: true,
   stdio: [ 'ignore', out, err ]
 });

 child.unref();
```

当使用`detached`选项创建一个长时间运行的进程时，进程不会保持运行除非向它提供了一个不连接到父进程的`stdio`的配置。如果继承了父进程的`stdio`，那么子进程将会继续附着在控制终端。

参阅： `child_process.exec()` 和 `child_process.fork()`

#### child_process.exec(command[, options], callback)#

 - command String 将要运行的命令，参数使用空格隔开

 - __options Object__
  - cwd String 子进程的当前工作目录
  - env Object 环境变量键值对
  - encoding String 字符编码（默认： 'utf8'）
  - shell String 将要执行命令的Shell（默认: 在UNIX中为`/bin/sh`， 在Windows中为`cmd.exe`， Shell应当能识别 `-c`开关在UNIX中，或 `/s /c` 在Windows中。 在Windows中，命令行解析应当能兼容`cmd.exe`）
  - timeout Number 超时时间（默认： 0）
  - maxBuffer Number 在stdout或stderr中允许存在的最大缓冲（二进制），如果超出那么子进程将会被杀死 （默认: 200*1024）
  - killSignal String 结束信号（默认：'SIGTERM'）
  - uid Number 设置用户进程的ID
  - gid Number 设置进程组的ID

 - __callback Function__
  - error Error
  - stdout Buffer
  - stderr Buffer

- Return: ChildProcess object

在Shell中运行一个命令，并缓存命令的输出。

```js
var exec = require('child_process').exec,
    child;

child = exec('cat *.js bad_file | wc -l',
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});
```

回调函数的参数是`error`，`stdout`，`stderr`。在成功时，`error`将会是`null`。在发生错误时，`error`将会是一个`Error`实例，`error.code`将会是子进程的退出码，`error.signal`将会被设置为结束进程的信号。

第二个可选的参数用于指定一些配置，默认值为：

```js
{ encoding: 'utf8',
  timeout: 0,
  maxBuffer: 200*1024,
  killSignal: 'SIGTERM',
  cwd: null,
  env: null }
```

如果`timeout`大于0，那么子进程在运行时超过`timeout`时将会被杀死。子进程使用`killSignal`信号结束（默认为: 'SIGTERM'）。`maxBuffer`指定了`stdout`，`stderr`中的最大数据量（字节），如果超过了这个数据量子进程也会被杀死。

注意：不像POSIX中的`exec()`，`child_process.exec()`不替换已经存在的进程并且使用一个SHELL去执行命令。

#### child_process.execFile(file[, args][, options][, callback])#

 - file String 将要运行的命令，参数使用空格隔开
 - args 字符串参数数组

 - __options Object__
  -cwd String 子进程的当前工作目录
  -env Object 环境变量键值对
  - encoding String 字符编码（默认： 'utf8'）
  - timeout Number 超时时间（默认： 0）
  - maxBuffer Number 在stdout或stderr中允许存在的最大缓冲（二进制），如果超出那么子进程将会被杀死 （默认: 200*1024）
  - killSignal String 结束信号（默认：'SIGTERM'）
  - uid Number 设置用户进程的ID
  - gid Number 设置进程组的ID
 - __callback Function__
  - error Error
  - stdout Buffer
  - stderr Buffer

 - Return: ChildProcess object

这个方法和`child_process.exec()`相似，除了它不是使用一个子SHELL执行命令而是直接执行文件。因此它比`child_process.exec`稍许精简一些。它们有相同的配置。

#### child_process.fork(modulePath[, args][, options])#

 - modulePath String 将要在子进程中运行的模块
 - args Array 字符串参数数组

 - __options Object__
 - cwd String 子进程的当前工作目录
 - env Object 环境变量键值对
 - execPath String 创建子进程的可执行文件
 - execArgv Array 子进程的可执行文件的字符串参数数组（默认： process.execArgv）
 - silent Boolean 如果为`true`，子进程的`stdin`，`stdout`和`stderr`将会被关联至父进程，否则，它们将会从父进程中继承。（默认为：`false`）
 - uid Number 设置用户进程的ID
 - gid Number 设置进程组的ID

Return: ChildProcess object

这个方法是`spawn() `的特殊形式，用于创建`node.js`进程。返回的对象除了拥有`ChildProcess`实例的所有方法，还有一个内建的通信信道。详情参阅`child.send(message, [sendHandle])`。

这些`node.js`子进程都是全新的V8实例。每个新的`node.js`进程都至少需要30ms启动以及10mb的内存。所以，你不能无休止地创建它们。

`options`对象中的`execPath`属性可以用非当前`node.js`可执行文件来创建子进程。这需要小心使用，并且缺省情况下会使用子进程上的`NODE_CHANNEL_FD`环境变量所指定的文件描述符来通讯。该文件描述符的输入和输出假定为以行分割的JSON对象。

注意：不像POSIX中的`fork()`，`child_process.fork()`不会复制当前进程。

### 同步进程创建
以下这些方法是同步的，意味着它们会阻塞事件循环。直到被创建的进程退出前，代码都将停止执行。

这些同步方法对简化大多数脚本任务都十分有用，并对简化应用配置的加载/执行也之分有用。

#### child_process.spawnSync(command[, args][, options])

 - command 将要运行的命令
 - args Array 字符串参数数组

 - __options Object__
  - cwd String 子进程的当前工作目录
  - input String|Buffer 将要被作为`stdin`传入被创建的进程的值，提供这个值将会覆盖`stdio[0]`
  - stdio Array 子进程的`stdio`配置
  - env Object 环境变量键值对
  - uid Number 设置用户进程的ID
  - gid Number 设置进程组的ID
  - timeout Number 毫秒数，子进程允许运行的最长时间（默认：`undefined`）
  - killSignal String 结束信号（默认：'SIGTERM'）
  - maxBuffer Number 在stdout或stderr中允许存在的最大缓冲（二进制），如果超出那么子进程将会被杀死
  - encoding String 被用于所有`stdio`输入和输出的编码（默认：'buffer'）

 - __return: Object__
  - pid Number 子进程的PID
  - output Array `stdio`输出结果的数组
  - stdout Buffer|String 子进程`stdout`的内容
  - stderr Buffer|String 子进程`stderr`的内容
  - status Number 子进程的退出码
  - signal String 被用于杀死自进程的信号
  - error Error 若子进程运行失败或超时，它将会是对应的错误对象

`spawnSync`会在子进程完全结束后才返回。当运行超时或被传递`killSignal`时，这个方法会等到进程完全退出才返回。也就是说，如果子进程处理了`SIGTERM`信号并且没有退出，你的父进程会继续阻塞。

#### child_process.execFileSync(command[, args][, options])#

 - command String 将要运行的命令
 - args Array 字符串参数数组

 - __options Object__
  - cwd String 子进程的当前工作目录
  - input String|Buffer 将要被作为`stdin`传入被创建的进程的值，提供这个值将会覆盖`stdio[0]`
  - stdio Array 子进程的`stdio`配置（默认: 'pipe'），`stderr`默认得将会输出到父进程的`stderr`，除非指定了`stdio`
  - env Object 环境变量键值对
  - uid Number 设置用户进程的ID
  - gid Number 设置进程组的ID
  - timeout Number 毫秒数，子进程允许运行的最长时间（默认：`undefined`）
  - killSignal 结束信号（默认：'SIGTERM'）
  - maxBuffer Number 在stdout或stderr中允许存在的最大缓冲（二进制），如果超出那么子进程将会被杀死
  - encoding String 被用于所有`stdio`输入和输出的编码（默认：'buffer'）

 - return: Buffer|String 此命令的`stdout`

`execFileSync`会在子进程完全结束后才返回。当运行超时或被传递`killSignal`时，这个方法会等到进程完全退出才返回。也就是说，如果子进程处理了`SIGTERM`信号并且没有退出，你的父进程会继续阻塞。

如果子进程超时或有一个非零的状态码，这个方法会抛出一个错误。这个错误对象与`child_process.spawnSync`的错误对象相同。

#### child_process.execSync(command[, options])#

 - command 将要运行的命令

 - __options Object__
  - cwd String 子进程的当前工作目录
  - input String|Buffer 将要被作为`stdin`传入被创建的进程的值，提供这个值将会覆盖`stdio[0]`
  - stdio Array 子进程的`stdio`配置（默认: 'pipe'），`stderr`默认得将会输出到父进程的`stderr`，除非指定了`stdio`
  - env Object 环境变量键值对
  - uid Number 设置用户进程的ID
  - gid Number 设置进程组的ID
  - timeout Number 毫秒数，子进程允许运行的最长时间（默认：`undefined`）
  - killSignal String 结束信号（默认：'SIGTERM'）
  - maxBuffer Number  在stdout或stderr中允许存在的最大缓冲（二进制），如果超出那么子进程将会被杀死
  - encoding String 被用于所有`stdio`输入和输出的编码（默认：'buffer'）

 - return: Buffer|String 此命令的`stdout`

`execSync`会在子进程完全结束后才返回。当运行超时或被传递`killSignal`时，这个方法会等到进程完全退出才返回。也就是说，如果子进程处理了`SIGTERM`信号并且没有退出，你的父进程会继续阻塞。

如果子进程超时或有一个非零的状态码，这个方法会抛出一个错误。这个错误对象与`child_process.spawnSync`的错误对象相同。
