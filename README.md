jsShell - An interactive command line interface.
===========================================

Generates a simple command entry shell for a set of pre-defined commands and outputs.

It can be used to provide an interactive demo of command line interface (CLI) commands for any program. Currently, it can handle:

* Simple text output
* Browser links
* Custom callback functions

Requirements
------------
* jQuery (only tested on 1.7.2)

Example Usage
-------------
To create the command shell:

````javascript
$('div#jsshell_container').jsShell(command_outputs);
````
where ```command_outputs``` is a previously defined set of commands and outputs.

For example, a simple 'welcome' command could be:

```javascript
command_outputs = new Object();

command_outputs.welcome = new Object();
command_outputs.welcome.type = 'text';
command_outputs.welcome.text = new Array();
command_outputs.welcome.text[0] = 'type \'help\' for command list';
```

Or to open a link in a new window/tab with the command 'github'

```javascript
command_outputs.github = new Object();
command_outputs.github.type = 'link';
command_outputs.github.href = 'http://github.com/';
command_outputs.github.text = 'opening GitHub...';
```

### Custom Callback Functions ###
Create your very own callback function to perform...well...anything you want.

Let's say we have a program called 'math' that we want to emulate. We could enter the following command into the shell

```javascript
math 20 + 1
```

The shell would call the 'math' callback function, as defined below, and pass through '20 + 1' as the first parameter. The math callback function could then process the command and output the result. The return value of the function should be a string or an array of strings.

```javascript
command_outputs.math = new Object();
command_outputs.math.type = 'function';
command_outputs.math.callback = function(args) { return math_function(args) };

function math_function(args)
{
  // DO MATH OPERATION ON args

  // Send Output as string or array (for multi-line)
  return 'Math output';
}
```