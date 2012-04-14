// Instantiate some global vars
var iCommandHeight, iHistoryTop, iCursorLeftMargin, iCursorWidth;
var jCommandEntry, jCommandHistory, jCommandCursor, jCommandForm;

$(function()
{
  // Config
  iCommandHeight = 18;  // Height of a single line. Multi-line entries will be multiples of this.
  iHistoryTop = 182;    // The effective height of the command history (will be used as top offset for new entries)
  iCursorLeftMargin = 17;
  iCursorWidth = 8;

  // Some common elements we will be using throughout
  jCommandEntry = $('input#command_entry');
  jCommandHistory = $('div#command_history');
  jCommandCursor = $('div#command_cursor');
  jCommandCarotOverlay = $('div#command_carot_overlay');
  jCommandForm = $('form#command_entry_form');
  jCommandShellWindow = $('div#command_shell_window');
  jCommandClipboardTip = $('div#copy_clipboard_tip');

  // Create welcome message entries
  if (typeof command_outputs.welcome.text == 'object')
  {
    for (var iLoop = 0; iLoop < command_outputs.welcome.text.length; iLoop++)
    {
      createCommandHistoryEntry(command_outputs.welcome.text[iLoop]);
    }
  }

  // Reset the command entry (as some browsers can save the field value)
  resetCommandEntry();

  // Set the window as draggable
  //$("div#command_shell_window").draggable({ cancel: 'div#command_history' });

  // New command entered.
  $('form#command_entry_form').submit(function()
  {
    // Get the entered command
    var strCommand = jCommandEntry.val();

    // Create the output history entry of the command (hidden)
    var strNewID = createCommandHistoryEntry(' > '+strCommand, 'history_text_command');

    // Get the output of the command
    var arrOutput = processCommand(strCommand);

    for (var iLoop = 0; iLoop < arrOutput.length; iLoop++)
    {
      createCommandHistoryEntry(arrOutput[iLoop]);
    }

    // Clear and re-focus the command entry
    resetCommandEntry();

    return false;
  });

  jCommandEntry.keydown(function(e)
  {
    // TODO: Better method of determine which keys to prevent actioning on
    if ((e.keyCode < 48 || e.keyCode > 90) && e.keyCode != 8 && e.keyCode != 116 && e.keyCode != 32 && e.keyCode != 13 && e.keyCode != 16 && e.keyCode != 189)
    {
      // Not a supported keypress. Stop the action.
      e.preventDefault();
      return;
    }

    switch (e.keyCode)
    {
      case 116: // f5
        // not refreshing the page was just getting annoying :)
        return;

      // Any other keys we want to perform custom actions on?
    }

    // Move the currsor
    // val() will not be populated immediately, so we just set the slightlest of delays
    setTimeout(function()
    {
      doCursorPosition();
    }, 5);
  });

  jCommandEntry.bind('paste', function(e) {
    // Because the 'pasting' is not immediate, we need to set a delay
    setTimeout(function()
    {
      doCursorPosition();
    }, 50);
  });


  jCommandEntry.click(function()
  {
    jCommandEntry.focus();

    // Move the cursor/carot to the end of the input field
    jCommandEntry.focus().val(jCommandEntry.val());
  });

  $('div#main_inner_container').click(function()
  {
    //jCommandEntry.focus();
    //jCommandCursor.addClass('cursor_focus');
  });

  jCommandEntry.focus(function()
  {
    jCommandCursor.addClass('cursor_focus');
  });
  jCommandEntry.focusout(function()
  {
    jCommandCursor.removeClass('cursor_focus');
  });

  // Show/hide the drag handle cursor
  jCommandShellWindow.mouseover(function()
  {
    jCommandShellWindow.addClass('drag_handle');
  });
  jCommandShellWindow.mouseleave(function()
  {
    jCommandShellWindow.removeClass('drag_handle');
  });
  jCommandHistory.mousemove(function()
  {
    jCommandShellWindow.removeClass('drag_handle');
  });

}); // END document ready


function processCommand(strCommand)
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
}

function resetCommandEntry()
{
  jCommandEntry.val('');
  jCommandEntry.focus();
  jCommandCursor.css({ 'margin-left' : iCursorLeftMargin+'px' });
  jCommandCarotOverlay.css({ 'margin-left' : iCursorLeftMargin+'px' });
  jCommandCursor.addClass('cursor_focus');
}

function moveCommandHistory(iTop, strIgnore)
{
  $('div.history_text').each(function()
  {
    if (this.id == strIgnore) {
      return;
    }

    var currentOffset = $(this).offset();
    $(this).offset({ top: (currentOffset.top + iTop) });
  });
}

function createCommandHistoryEntry(strEntry, strAdditionalClass)
{
  var strClass = 'history_text';

  if (typeof strAdditionalClass == "string") {
    strClass += ' '+strAdditionalClass;
  }

  // Generate the ID of the entry
  var strNewID = 'history_entry_' + new Date().getTime();

  // Parse the entry for display
  strEntry = strEntry.replace(/  /g, "&nbsp;&nbsp;");

  // Create the entry DIV and append to this history
  iNewTop = iHistoryTop - getCommandHistoryHeight();
  strNewHistoryEntry = '<div id="'+strNewID+'" style="display:block; visibility:hidden; position:relative; top:'+iNewTop+'px;" class="'+strClass+'">'+strEntry+'</div>';
  jCommandHistory.append(strNewHistoryEntry);

  // Move existing history up
  moveCommandHistory(-iCommandHeight, strNewID);

  // Show the new command now that the rest of the history has been moved
  $('div#'+strNewID).css({'visibility':'visible'});

  // Ensure we're scrolled to the bottom of the history
  jCommandHistory.attr({ scrollTop: jCommandHistory.attr("scrollHeight") });

  return strNewID;
}

function calculateCommandHeight(strEntry)
{
  var iLineBreakCount = strEntry.match(/<br \/>/g);

  return iLineBreakCount.length + 1;  // +1 as we will always have the first line
}

function getCommandHistoryHeight()
{
  var iHistoryHeight = 0;
  $('div.history_text').each(function()
  {
    iHistoryHeight += $(this).height();
  });
  return iHistoryHeight;
}

function doCursorPosition()
{
  var iCommandLength = jCommandEntry.val().length;
  var iCursorPosition = iCursorLeftMargin + (iCursorWidth * iCommandLength);

  jCommandCursor.css({ 'margin-left' : iCursorPosition+'px' });
  jCommandCarotOverlay.css({ 'margin-left' : iCursorPosition+'px' });
}

// Not currently used
function copyTextToClipboard(strText)
{
  // trim whitespace
  strText = $.trim(strText);

  // copy to clipboard
  Copied = strText.createTextRange();
  Copied.execCommand("Copy");

  $('div#copy_clipboard_tip').css({ top: window.event.pageY - 30, left: window.event.pageX - 10 });
  $('div#copy_clipboard_tip').show();

  setTimeout(function()
  {
    $('div#copy_clipboard_tip').fadeOut();
  }, 1000);
}