// CLI Handler
const terminalBody = document.getElementById('terminalBody');
const MATRIX_MODE_CLASS = 'matrixmode-active';

const commands = {
  whoareyou: {
    description: 'Display current user',
    execute: () => 'Theodoros Mangas — Software Engineer (Python/Django)'
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
  linkedin: {
    description: 'Visit my LinkedIn profile',
    execute: () => {
      window.open('https://www.linkedin.com/in/theodorosmaggas/', '_blank');
      return 'Opening LinkedIn...';
    }
  },
  email: {
    description: 'Send me an email',
    execute: () => {
      window.location.href = 'mailto:magg_theod@live.com';
      return 'Opening email client...';
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
      Object.entries(commands)
        .filter(([cmd]) => cmd !== 'matrixmode')
        .forEach(([cmd, obj]) => {
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
  },
  matrixmode: {
    description: '',
    execute: () => {
      const isActive = document.body.classList.toggle(MATRIX_MODE_CLASS);
      return isActive
        ? '<span class="text-secondary">matrixmode enabled</span>'
        : '<span class="text-secondary">matrixmode disabled</span>';
    }
  }
};

// Command history for bash console
let commandHistory = [];
let historyIndex = -1;

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
        addCommandToHistory(input);
        handleCommand(input);
        // Re-focus after command
        setTimeout(() => terminalInput.focus(), 0);
      }
    }
  });

  // Handle up/down arrow for command history
  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      if (commandHistory.length > 0) {
        if (historyIndex === -1) {
          historyIndex = commandHistory.length - 1;
        } else if (historyIndex > 0) {
          historyIndex--;
        }
        terminalInput.value = commandHistory[historyIndex];
        updateCommandDisplay(terminalInput.value);
        setTimeout(() => {
          terminalInput.selectionStart = terminalInput.selectionEnd = terminalInput.value.length;
        }, 0);
        e.preventDefault();
      }
    } else if (e.key === 'ArrowDown') {
      if (commandHistory.length > 0 && historyIndex !== -1) {
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          terminalInput.value = commandHistory[historyIndex];
        } else {
          historyIndex = -1;
          terminalInput.value = '';
        }
        updateCommandDisplay(terminalInput.value);
        setTimeout(() => {
          terminalInput.selectionStart = terminalInput.selectionEnd = terminalInput.value.length;
        }, 0);
        e.preventDefault();
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

  // Keep startup aligned with normal CLI behavior:
  // show the active prompt position reliably on first load and restore.
  const scrollToLatestPrompt = () => {
    terminalBody.scrollTop = terminalBody.scrollHeight;
  };
  const scheduleInitialSync = () => {
    requestAnimationFrame(scrollToLatestPrompt);
    setTimeout(scrollToLatestPrompt, 80);
    setTimeout(scrollToLatestPrompt, 240);
    setTimeout(scrollToLatestPrompt, 600);
  };

  scheduleInitialSync();
  window.addEventListener('load', scrollToLatestPrompt, { once: true });
  window.addEventListener('pageshow', scrollToLatestPrompt);
}

function addCommandToHistory(cmd) {
  if (cmd && (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== cmd)) {
    commandHistory.push(cmd);
  }
  historyIndex = -1;
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
  // Reuse the active prompt line when available to avoid duplicate command rows
  const activePrompt = terminalBody.querySelector('.line:last-child');
  if (activePrompt && activePrompt.querySelector('.cursor')) {
    activePrompt.className = 'line';
    activePrompt.innerHTML = `<span class="prompt">theodoros@dev</span>:<span class="path">~</span>$ <span class="cmd">${input}</span>`;
  } else {
    const commandLine = document.createElement('div');
    commandLine.className = 'line';
    commandLine.innerHTML = `<span class="prompt">theodoros@dev</span>:<span class="path">~</span>$ <span class="cmd">${input}</span>`;
    terminalBody.appendChild(commandLine);
  }

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

function initializeBackToTop() {
  const backToTop = document.getElementById('backToTop');
  const scrollContainer = document.querySelector('.portfolio-container');
  if (!backToTop) return;

  const toggleButtonVisibility = () => {
    const scrollTop = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
    const viewportHeight = scrollContainer ? scrollContainer.clientHeight : window.innerHeight;
    const shouldShow = scrollTop > viewportHeight * 0.7;
    backToTop.classList.toggle('is-visible', shouldShow);
  };

  backToTop.addEventListener('click', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    }
  });

  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', toggleButtonVisibility, { passive: true });
  } else {
    window.addEventListener('scroll', toggleButtonVisibility, { passive: true });
  }
  window.addEventListener('resize', toggleButtonVisibility);
  toggleButtonVisibility();
}

// Handle chip clicks (existing functionality)
document.addEventListener('DOMContentLoaded', () => {
  initializeTerminal();
  initializeBackToTop();
  
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.getAttribute('data-cmd');
      handleCommand(cmd);
    });
  });
});
