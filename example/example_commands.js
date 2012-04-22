command_outputs = new Object();

command_outputs.welcome = new Object();
command_outputs.welcome.type = 'text';
command_outputs.welcome.text = new Array();
command_outputs.welcome.text[0] = 'type \'help\' for command list';

command_outputs.help = new Object();
command_outputs.help.type = 'text';
command_outputs.help.text = new Array();
command_outputs.help.text[0] = 'Available commands:';
command_outputs.help.text[1] = '  welcome';
command_outputs.help.text[2] = '  help';
command_outputs.help.text[3] = '  math [operation]';

command_outputs.math = new Object();
command_outputs.math.type = 'function';
command_outputs.math.callback = function(args) { return math_function(args) };

function math_function(args)
{
  if (args == '')
    return 'usage: math [operation]';

  // DO MATH OPERATION ON args

  // Send Output
  var output = ['I would solve \'' + args + '\' but you wouldn\'t ', 'learn anything if I did everything for you.'];
  return output;
}