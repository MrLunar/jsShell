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