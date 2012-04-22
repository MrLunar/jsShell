/**
 * jsShell - Interactive command console.
 *
 * @author Mark Bowker
 */
(function ($)
{
  // Config
  // TODO: Create a proper method of managing plugin settings.
  var iCommandHeight;   // Height of a single line. Multi-line entries will be multiples of this.
  var iHistoryTop;      // The effective height of the command history (will be used as top offset for new entries)
  var command_outputs;

  // Some common elements we will be using throughout
  var $cmdInput,$cmdHistory,$cmdCursor,$cmdForm;


  /**
   * Main plugin definition.
   *
   * Based on the parameters given, calls the required method.
   */
  $.fn.jsShell = function ()
  {
    // Until multiple actions are supported, we just call init for now.
    return methods.init.apply(this, arguments);
  };


  /**
   * Public methods. Called from the main plugin definition.
   */
  var methods =
  {
    // Setup the console
    init: function(options)
    {
      var $this = this;

      if ($this.length == 0)
      {
        log('no element given');
        return $this;
      }

      // Create the console HTML
      jsConsole.createConsoleShell($this);

      // Common DOM elements we will be using throughout
      $cmdInputContainer = $('div#command_input_container');
      $cmdInput = $('input#command_entry');
      $cmdHistory = $('div#command_history');
      $cmdCursor = $('div#command_cursor');
      $cmdForm = $('form#command_entry_form');

      // Setup the settings
      command_outputs = options;

      // Required styling
      $cmdHistory.css('overflow', 'hidden');
      $cmdHistory.css('position', 'relative');
      //$cmdInputContainer.css('margin-top', '10px');
      $cmdInput.css({'display':'block', 'width':'100%', 'border-width':'0'});
      if (!$cmdHistory.height()) $cmdHistory.height('250');   // TODO: Use new method for default settings.

      // For some reason, browsers keep their own styling on input boxes unless specified directly on the element
      $cmdInput.css({'font-family':$this.css('font-family'), 'font-size':$this.css('font-size')});

      // Calculate height and offset for new history entries
      var iBrowserHack = $.browser.mozilla ? 3 : 0;           // Firefox seems to be 'lower down' and is cutting off the bottom of text
          iBrowserHack = $.browser.webkit ? -1 : iBrowserHack;
      iCommandHeight = $cmdInputContainer.height();           // TODO: Ability to get custom value from paramters.
      iHistoryTop = $cmdHistory.height() - iCommandHeight - iBrowserHack;

      // Capture command entries
      $cmdForm.bind('submit.jsShell', jsConsole.processCommand);

      // Create welcome message entries
      if (typeof(command_outputs.welcome.text) == 'object')
      {
        for (var iLoop = 0; iLoop < command_outputs.welcome.text.length; iLoop++)
        {
          jsConsole.createCommandHistoryEntry(command_outputs.welcome.text[iLoop]);
        }
      }

      // Reset the command entry (as some browsers can save the field value)
      jsConsole.resetCommandEntry();

      return $this;
    }
  };

  /**
   * All functions related to processing and outputting commands to the console shell.
   */
  var jsConsole =
  {
    resetCommandEntry: function()
    {
      $cmdInput.val('');
      $cmdInput.focus();
      $cmdCursor.addClass('cursor_focus');
    },

    processCommand: function()
    {
      // Get the entered command
      var strCommand = $cmdInput.val();

      // Create the output history entry of the command (hidden)
      var strNewID = jsConsole.createCommandHistoryEntry(strCommand, 'history_text_command');

      // Get the output of the command
      var arrOutput = jsConsole.getCommandOutput(strCommand);

      for (var iLoop = 0; iLoop < arrOutput.length; iLoop++)
      {
        jsConsole.createCommandHistoryEntry(arrOutput[iLoop]);
      }

      // Clear and re-focus the command entry
      jsConsole.resetCommandEntry();
    },

    getCommandOutput: function(strCommand)
    {
      var arrOutput = new Array();

      if (typeof command_outputs[strCommand] == "object")
      {
        if (command_outputs[strCommand].type == 'link')
        {
          window.open(command_outputs[strCommand].href, '_blank');
          window.focus();
          arrOutput.push(command_outputs[strCommand].text);
        }
        else if (command_outputs[strCommand].type == 'text')
        {
          if (typeof command_outputs[strCommand].text == 'string')
          {
            arrOutput.push(command_outputs[strCommand].text);
          }
          else
          {
            // Assume the output is in an array
            for (var iLoop = 0; iLoop < command_outputs[strCommand].text.length; iLoop++)
            {
              arrOutput.push(command_outputs[strCommand].text[iLoop]);
            }
          }
        }
      }
      else
      {
        arrOutput.push('command not found. type \'help\' for available commands');
      }

      return arrOutput;
    },

    moveCommandHistory: function(iTop, strIgnore)
    {
      $('div.history_text').each(function()
      {
        if (this.id == strIgnore) {
          return;
        }

        var currentOffset = $(this).offset();
        $(this).offset({ top: (currentOffset.top + iTop) });
      });
    },

    createCommandHistoryEntry: function(strEntry, strAdditionalClass)
    {
      var strClass = 'history_text';

      if (typeof strAdditionalClass == "string") {
        strClass += ' '+strAdditionalClass;
      }

      // Generate the ID of the new entry
      var strNewID = 'history_entry_' + new Date().getTime();

      // Parse the entry for display
      strEntry = strEntry.replace(/  /g, "&nbsp;&nbsp;");

      // Create the entry DIV and append to this history
      iNewTop = iHistoryTop - jsConsole.getCommandHistoryHeight();
      strNewHistoryEntry = '<div id="'+strNewID+'" style="display:block; visibility:hidden; position:relative; top:'+iNewTop+'px;" class="'+strClass+'">'+strEntry+'</div>';
      $cmdHistory.append(strNewHistoryEntry);

      // Move existing history up
      jsConsole.moveCommandHistory(-iCommandHeight, strNewID);

      // Show the new command now that the rest of the history has been moved
      $('div#'+strNewID).css({'visibility':'visible'});

      // Ensure we're scrolled to the bottom of the history
      $cmdHistory.attr({ scrollTop: $cmdHistory.attr("scrollHeight") });

      return strNewID;
    },

    calculateCommandHeight: function(strEntry)
    {
      var iLineBreakCount = strEntry.match(/<br \/>/g);

      return iLineBreakCount.length + 1;  // +1 as we will always have the first line
    },

    /**
     * Needed to determine the the total height of the command history.
     * Even though most of it is hidden, we still need this height to determine
     * the top value of the new entries.
     */
    getCommandHistoryHeight: function()
    {
      var iHistoryHeight = 0;
      $('div.history_text').each(function()
      {
        iHistoryHeight += $(this).height();
      });
      return iHistoryHeight;
    },

    /**
     * Creates the actual HTML for the shell.
     */
    createConsoleShell: function($container)
    {
      var $history = $('<div id="command_history_container"><div id="command_history"></div></div>');
      var strInputEntry = '<div><input type="text" id="command_entry" autocomplete="off" /></div>';
      var $inputForm = $('<div id="command_input_container"><form id="command_entry_form" action="#">'+strInputEntry+'</form></div>');
      $container.append($history).append($inputForm);
    }
  };

  /**
   * Simple wrapper function for console.log()
   */
  function log(msg)
  {
		if (window.console && window.console.log)
		{
		  window.console.log("jsShell ::", msg);
		}
	};

})(jQuery);