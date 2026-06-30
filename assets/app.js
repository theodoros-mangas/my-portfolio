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
      window.open('https://github.com/teo-mgs', '_blank');
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
        .filter(([cmd]) => cmd !== 'matrixmode' && cmd !== 'python')
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
      return null;
    }
  },
  python: {
    description: 'My language of choice',
    execute: () => {
      return [
        '<span class="text-success">Python 3.13</span>',
        '<span class="hint">&gt;&gt;&gt;</span> from pysuperphysics import Antigravity',
        '<span class="hint">&gt;&gt;&gt;</span> class Me(Antigravity):',
        '<span class="hint">...</span>&nbsp;&nbsp;&nbsp;&nbsp;def __init__(self):',
        '<span class="hint">...</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.grounded = False',
        '<span class="hint">...</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;print("Time to fly")',
        '<span class="hint">...</span>',
        '<span class="hint">&gt;&gt;&gt;</span> me = Me()',
      ].join('<br>');
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

let commandHistory = [];
let historyIndex = -1;

function initializeTerminal() {
  const isMobile = /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

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
  terminalInput.setAttribute('maxlength', '256');

  terminalInput.style.position = 'fixed';
  terminalInput.style.left = '-9999px';
  terminalInput.style.top = '-9999px';
  terminalInput.style.opacity = '0';
  terminalInput.style.pointerEvents = 'none';

  document.body.appendChild(terminalInput);

  terminalBody.addEventListener('click', (e) => {
    e.preventDefault();
    const scrollPos = terminalBody.scrollTop;
    terminalInput.focus({ preventScroll: true });
    terminalBody.scrollTop = scrollPos;
  });

  terminalInput.addEventListener('input', (e) => {
    updateCommandDisplay(terminalInput.value);
  });

  terminalInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const input = terminalInput.value.trim().toLowerCase();
      terminalInput.value = '';
      clearCommandDisplay();

      if (input) {
        addCommandToHistory(input);
        handleCommand(input);
        if (!isMobile) {
          setTimeout(() => terminalInput.focus({ preventScroll: true }), 0);
        }
      }
    }
  });

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

  if (!isMobile) {
    setTimeout(() => {
      terminalInput.focus({ preventScroll: true });
    }, 100);
    terminalInput.addEventListener('blur', () => {
      setTimeout(() => terminalInput.focus({ preventScroll: true }), 0);
    });
  }

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
    lastLine.innerHTML = `<span class="prompt">teo@dev</span>:<span class="path">~</span>$ <span class="cmd">${text}</span><span class="cursor" aria-hidden="true"></span>`;
  }
}

function clearCommandDisplay() {
}

function handleCommand(input) {
  const activePrompt = terminalBody.querySelector('.line:last-child');
  if (activePrompt && activePrompt.querySelector('.cursor')) {
    activePrompt.className = 'line';
    activePrompt.innerHTML = `<span class="prompt">teo@dev</span>:<span class="path">~</span>$ <span class="cmd">${input}</span>`;
  } else {
    const commandLine = document.createElement('div');
    commandLine.className = 'line';
    commandLine.innerHTML = `<span class="prompt">teo@dev</span>:<span class="path">~</span>$ <span class="cmd">${input}</span>`;
    terminalBody.appendChild(commandLine);
  }


  const [cmd, ...args] = input.split(' ');
  const normalizedInput = input.trim().toLowerCase();

  if (normalizedInput === 'hello world' || normalizedInput === 'hello world!') {
    addOutput('print("Hello world!")');
  } else if (normalizedInput === 'cls') {
    terminalBody.innerHTML = '';
    const newPrompt = document.createElement('div');
    newPrompt.className = 'line mt-2';
    newPrompt.innerHTML = '<span class="prompt">teo@dev</span>:<span class="path">~</span>$ <span class="cursor" aria-hidden="true"></span>';
    terminalBody.appendChild(newPrompt);
    terminalBody.scrollTop = terminalBody.scrollHeight;
    return;
  } else if (normalizedInput === 'ls' || normalizedInput === 'ls -la' || normalizedInput === 'tree') {
    addOutput(
      '<pre class="mb-0" style="font-size:.85em;line-height:1.4">' +
      'theodoros/portfolio\n' +
      '├── index.html\n' +
      '├── README.md\n' +
      '├── LICENSE\n' +
      '└── assets/\n' +
      '    ├── app.js\n' +
      '    ├── style.css\n' +
      '    ├── files/\n' +
      '    │   └── Theodoros_Mangas_CV.pdf\n' +
      '    └── img/\n' +
      '        └── favicon.png</pre>'
    );
  } else if (normalizedInput === 'sudo' || normalizedInput.startsWith('sudo ')) {
    addOutput('Permission denied: You are not root.');
  } else if (normalizedInput === 'rm -rf /' || normalizedInput === 'rm -rf *' || normalizedInput === 'rm -rf') {
    addOutput('Nice try. This portfolio is read-only.');
  } else if (normalizedInput === 'vim' || normalizedInput === 'vi') {
    addOutput('You are now inside vim. Good luck getting out.');
  } else if (normalizedInput === 'exit' || normalizedInput === 'logout') {
    addOutput('Nice try. There is no escape.');
  } else if (normalizedInput === 'quit') {
    addOutput('No quitters here.');
  } else if (normalizedInput === 'pwd') {
    addOutput('/home/theodoros/portfolio');
  } else if (normalizedInput === 'whoami') {
    addOutput('visitor — but you\'re welcome here.');
  } else if (normalizedInput === ':(){ :|:& };:') {
    addOutput('Fork bomb detected. Nice try.');
  } else if (normalizedInput === 'make coffee') {
    addOutput('Error: No coffee machine connected to /dev/usb0.');
  } else if (normalizedInput === 'git blame') {
    addOutput('Blaming theodoros... (100% of commits, as expected)');
  } else if (normalizedInput === '42') {
    addOutput('The answer to life, the universe, and everything.');
  } else if (normalizedInput === 'ping') {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const date = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
    addOutput(`[${time} - ${date}] Pong!`);
  } else if (cmd === '/help' || cmd === 'help') {
    const output = commands.help.execute();
    addOutput(output);
  } else if (commands[cmd]) {
    const result = commands[cmd].execute();
    if (result !== null) {
      addOutput(result);
    }
  } else {
    addOutput(`<span class="error">Command not found: ${cmd}</span><br><span class="hint">Type</span> <span class="text-success">help</span> <span class="hint">to see available commands</span>`);
  }

  if (cmd === 'clear') {
    terminalBody.innerHTML = '';
  }

  const newPrompt = document.createElement('div');
  newPrompt.className = 'line mt-2';
  newPrompt.innerHTML = '<span class="prompt">teo@dev</span>:<span class="path">~</span>$ <span class="cursor" aria-hidden="true"></span>';
  terminalBody.appendChild(newPrompt);

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
