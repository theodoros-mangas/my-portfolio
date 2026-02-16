// CLI Handler
const terminalBody = document.getElementById('terminalBody');

const commands = {
  whoami: {
    description: 'Display current user',
    execute: () => 'Theodoros Mangas — Python/Django Full-Stack Engineer'
  },
  projects: {
    description: 'View my projects',
    execute: () => {
      document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
      return 'Navigating to projects section...';
    }
  },
  cv: {
    description: 'Download my CV',
    execute: () => {
      window.open('assets/files/Theodoros_Mangas_CV.pdf', '_blank');
      return 'Opening CV...';
    }
  },
  github: {
    description: 'Visit my GitHub profile',
    execute: () => {
      window.open('https://github.com/theodoros-mangas', '_blank');
      return 'Opening GitHub...';
    }
  },
  about: {
    description: 'Read about me',
    execute: () => {
      document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
      return 'Navigating to about section...';
    }
  },
  contact: {
    description: 'View contact information',
    execute: () => {
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
      return 'Navigating to contact section...';
    }
  },
  help: {
    description: 'Display available commands',
    execute: () => {
      let helpText = '<span class="hint">Available commands:</span><div class="mt-2">';
      Object.entries(commands).forEach(([cmd, obj]) => {
        helpText += `<div><span class="text-success">${cmd}</span> — ${obj.description}</div>`;
      });
      helpText += '</div>';
      return helpText;
    }
  },
  clear: {
    description: 'Clear terminal',
    execute: () => {
      // Signal handled by handleCommand: do not modify DOM here
      return null;
    }
  }
};

// Initialize terminal input
function initializeTerminal() {
  const terminalInput = document.createElement('input');
  terminalInput.type = 'text';
  terminalInput.id = 'cliInput';
  terminalInput.className = 'cli-input';
  terminalInput.placeholder = '';
  terminalInput.setAttribute('aria-label', 'Terminal input');
  terminalInput.setAttribute('autocomplete', 'off');
  terminalInput.setAttribute('autocorrect', 'off');
  terminalInput.setAttribute('autocapitalize', 'off');
  terminalInput.setAttribute('spellcheck', 'false');
  
  // Style the input to be functional and capture input
  terminalInput.style.position = 'fixed';
  terminalInput.style.left = '-9999px';
  terminalInput.style.top = '-9999px';
  terminalInput.style.opacity = '0';
  terminalInput.style.pointerEvents = 'none';
  
  document.body.appendChild(terminalInput);

  // Focus on terminal body click - prevent scroll
  terminalBody.addEventListener('click', (e) => {
    e.preventDefault();
    const scrollPos = terminalBody.scrollTop;
    terminalInput.focus();
    terminalBody.scrollTop = scrollPos;
  });

  // Show typed text in real-time
  terminalInput.addEventListener('input', (e) => {
    updateCommandDisplay(terminalInput.value);
  });

  // Handle command input
  terminalInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const input = terminalInput.value.trim().toLowerCase();
      terminalInput.value = '';
      clearCommandDisplay();
      
      if (input) {
        handleCommand(input);
        // Re-focus after command
        setTimeout(() => terminalInput.focus(), 0);
      }
    }
  });
  
  // Keep focus on terminal
  terminalInput.addEventListener('blur', () => {
    setTimeout(() => terminalInput.focus(), 0);
  });

  // Auto-focus on load
  setTimeout(() => {
    terminalInput.focus();
  }, 100);
}

function updateCommandDisplay(text) {
  let lastLine = terminalBody.querySelector('.line:last-child');
  
  if (lastLine) {
    // Update the existing last line instead of creating a new one
    lastLine.innerHTML = `<span class="prompt">theodoros@dev</span>:<span class="path">~</span>$ <span class="cmd">${text}</span><span class="cursor" aria-hidden="true"></span>`;
  }
}

function clearCommandDisplay() {
  // DisplayLine cleanup handled by keypress handler
}

function handleCommand(input) {
  // Remove cursor from last line
  const cursor = terminalBody.querySelector('.cursor');
  if (cursor) cursor.remove();

  // Add the command line
  const commandLine = document.createElement('div');
  commandLine.className = 'line';
  commandLine.innerHTML = `<span class="prompt">theodoros@dev</span>:<span class="path">~</span>$ <span class="cmd">${input}</span>`;
  terminalBody.appendChild(commandLine);

  // Process command
  const [cmd, ...args] = input.split(' ');
  
  if (cmd === '/help' || cmd === 'help') {
    // Help command
    const output = commands.help.execute();
    addOutput(output);
  } else if (commands[cmd]) {
    // Known command
    const result = commands[cmd].execute();
    if (result !== null) {
      addOutput(result);
    }
  } else {
    // Unknown command
    addOutput(`<span class="error">Command not found: ${cmd}</span><br><span class="hint">Type</span> <span class="text-success">help</span> <span class="hint">to see available commands</span>`);
  }

  // If command was `clear`, clear the terminal body now (so the previous command line is removed)
  if (cmd === 'clear') {
    terminalBody.innerHTML = '';
  }

  // Add new prompt
  const newPrompt = document.createElement('div');
  newPrompt.className = 'line mt-2';
  newPrompt.innerHTML = '<span class="prompt">theodoros@dev</span>:<span class="path">~</span>$ <span class="cursor" aria-hidden="true"></span>';
  terminalBody.appendChild(newPrompt);

  // Scroll to bottom
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

function addOutput(output) {
  const outputLine = document.createElement('div');
  outputLine.className = 'line output';
  outputLine.innerHTML = output;
  terminalBody.appendChild(outputLine);
}

// Handle chip clicks (existing functionality)
document.addEventListener('DOMContentLoaded', () => {
  initializeTerminal();
  
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.getAttribute('data-cmd');
      handleCommand(cmd);
    });
  });
});
