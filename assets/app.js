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
        .filter(([, obj]) => !obj.hidden)
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
    hidden: true,
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
    hidden: true,
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

const PROMPT_PREFIX = '<span class="prompt">teo@dev</span>:<span class="path">~</span>$ ';
const promptLineHTML = (cmdText) => `${PROMPT_PREFIX}<span class="cmd">${cmdText}</span>`;
const typingPromptHTML = (cmdText) => `${promptLineHTML(cmdText)}<span class="cursor" aria-hidden="true"></span>`;
const emptyPromptHTML = () => `${PROMPT_PREFIX}<span class="cursor" aria-hidden="true"></span>`;

function appendNewPrompt() {
  const newPrompt = document.createElement('div');
  newPrompt.className = 'line mt-2';
  newPrompt.innerHTML = emptyPromptHTML();
  terminalBody.appendChild(newPrompt);
}

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
  const lastLine = terminalBody.querySelector('.line:last-child');

  if (lastLine) {
    lastLine.innerHTML = typingPromptHTML(text);
  }
}

const easterEggs = [
  { match: (i) => i === 'hello world' || i === 'hello world!', run: () => 'print("Hello world!")' },
  {
    match: (i) => i === 'ls' || i === 'ls -la' || i === 'tree',
    run: () =>
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
  },
  { match: (i) => i === 'sudo' || i.startsWith('sudo '), run: () => 'Permission denied: You are not root.' },
  { match: (i) => i === 'rm -rf /' || i === 'rm -rf *' || i === 'rm -rf', run: () => 'Nice try. This portfolio is read-only.' },
  { match: (i) => i === 'vim' || i === 'vi', run: () => 'You are now inside vim. Good luck getting out.' },
  { match: (i) => i === 'exit' || i === 'logout', run: () => 'Nice try. There is no escape.' },
  { match: (i) => i === 'quit', run: () => 'No quitters here.' },
  { match: (i) => i === 'pwd', run: () => '/home/theodoros/portfolio' },
  { match: (i) => i === 'whoami', run: () => 'visitor — but you\'re welcome here.' },
  { match: (i) => i === ':(){ :|:& };:', run: () => 'Fork bomb detected. Nice try.' },
  { match: (i) => i === 'make coffee', run: () => 'Error: No coffee machine connected to /dev/usb0.' },
  { match: (i) => i === 'git blame', run: () => 'Blaming theodoros... (100% of commits, as expected)' },
  { match: (i) => i === '42', run: () => 'The answer to life, the universe, and everything.' },
  {
    match: (i) => i === 'ping',
    run: () => {
      const now = new Date();
      const pad = (n) => n.toString().padStart(2, '0');
      const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
      const date = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
      return `[${time} - ${date}] Pong!`;
    }
  }
];

function renderCommandLine(input) {
  const activePrompt = terminalBody.querySelector('.line:last-child');
  if (activePrompt && activePrompt.querySelector('.cursor')) {
    activePrompt.className = 'line';
    activePrompt.innerHTML = promptLineHTML(input);
  } else {
    const commandLine = document.createElement('div');
    commandLine.className = 'line';
    commandLine.innerHTML = promptLineHTML(input);
    terminalBody.appendChild(commandLine);
  }
}

function handleCommand(input) {
  renderCommandLine(input);

  const normalizedInput = input.trim().toLowerCase();

  if (normalizedInput === 'cls') {
    terminalBody.innerHTML = '';
    appendNewPrompt();
    terminalBody.scrollTop = terminalBody.scrollHeight;
    return;
  }

  let [cmd] = normalizedInput.split(' ');
  if (cmd === '/help') cmd = 'help';

  const easterEgg = easterEggs.find(({ match }) => match(normalizedInput));

  if (easterEgg) {
    addOutput(easterEgg.run());
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

  appendNewPrompt();
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
