const terminalBody = document.getElementById('terminalBody');
const MATRIX_MODE_CLASS = 'matrixmode-active';

let terminalReady = false;

const commands = {
  whoareyou: {
    description: 'Display current user',
    execute: () => 'Theodoros Mangas — Software engineer (Python · Django · PostgreSQL), backend-focused, surveying & geoinformatics background'
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
      window.open('https://github.com/Teo-Mgs', '_blank');
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
  phone: {
    description: 'Call me',
    execute: () => {
      window.location.href = 'tel:+306972690483';
      return 'Calling +30 697 269 0483...';
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
          helpText += `<div><span class="text-success">${cmd}</span> - ${obj.description}</div>`;
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
let terminalInput = null;
let scrollFrame = 0;

// scrollHeight is stale until the browser reflows the nodes we just appended,
// so defer the write to the next frame and coalesce bursts into one.
function scrollToBottom() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    terminalBody.scrollTop = terminalBody.scrollHeight;
  });
}

function focusInput() {
  if (terminalInput) terminalInput.focus({ preventScroll: true });
}

// Wipes the rendered lines without detaching the input that lives alongside them.
function clearTerminalLines() {
  terminalBody.querySelectorAll('.line').forEach((line) => line.remove());
}

const escapeHTML = (text) => text.replace(/[&<>"']/g, (ch) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[ch]);

const PROMPT_PREFIX = '<span class="prompt">teo@dev</span>:<span class="path">~</span>$ ';
const promptLineHTML = (cmdText) => `${PROMPT_PREFIX}<span class="cmd">${escapeHTML(cmdText)}</span>`;
const typingPromptHTML = (cmdText) => `${promptLineHTML(cmdText)}<span class="cursor" aria-hidden="true"></span>`;
const emptyPromptHTML = () => `${PROMPT_PREFIX}<span class="cursor" aria-hidden="true"></span>`;

function appendNewPrompt() {
  const newPrompt = document.createElement('div');
  newPrompt.className = 'line mt-2';
  newPrompt.innerHTML = emptyPromptHTML();
  terminalBody.appendChild(newPrompt);
}

function initializeTerminal() {
  terminalInput = document.createElement('input');
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
  terminalInput.setAttribute('enterkeyhint', 'go');
  terminalInput.setAttribute('inputmode', 'text');
  terminalInput.style.fontSize = '16px';

  // Kept visually hidden but focusable. Anchored to the top of the scroll
  // content rather than the viewport edge: an absolutely positioned box with
  // bottom:0 sits wherever the container is scrolled, and the browser's
  // scroll-focused-element-into-view then fights our own scrollToBottom.
  terminalInput.style.position = 'absolute';
  terminalInput.style.opacity = '0';
  terminalInput.style.width = '1px';
  terminalInput.style.height = '1px';
  terminalInput.style.padding = '0';
  terminalInput.style.border = 'none';
  terminalInput.style.background = 'transparent';
  terminalInput.style.left = '0';
  terminalInput.style.top = '0';
  terminalInput.style.pointerEvents = 'none';
  terminalBody.style.position = 'relative';
  terminalBody.appendChild(terminalInput);

  terminalBody.addEventListener('click', (e) => {
    if (e.target.closest('.chip')) return;
    // Don't steal focus or yank the view while the user is selecting text.
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) return;
    focusInput();
    scrollToBottom();
  });

  terminalInput.addEventListener('input', () => {
    updateCommandDisplay(terminalInput.value);
  });

  const recallHistory = (value) => {
    terminalInput.value = value;
    updateCommandDisplay(value);
    // Caret to the end, after the value assignment has been applied.
    terminalInput.setSelectionRange(value.length, value.length);
  };

  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = terminalInput.value.trim().toLowerCase();
      terminalInput.value = '';

      if (input) {
        addCommandToHistory(input);
        handleCommand(input);
      } else {
        // Bare Enter: retire the current prompt and open a fresh one.
        renderCommandLine('');
        appendNewPrompt();
        scrollToBottom();
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      if (commandHistory.length === 0) return;
      e.preventDefault();
      if (historyIndex === -1) {
        historyIndex = commandHistory.length - 1;
      } else if (historyIndex > 0) {
        historyIndex--;
      }
      recallHistory(commandHistory[historyIndex]);
    } else if (e.key === 'ArrowDown') {
      if (commandHistory.length === 0 || historyIndex === -1) return;
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        recallHistory(commandHistory[historyIndex]);
      } else {
        historyIndex = -1;
        recallHistory('');
      }
    }
  });

  scrollToBottom();
}

function addCommandToHistory(cmd) {
  if (cmd && (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== cmd)) {
    commandHistory.push(cmd);
  }
  historyIndex = -1;
}

function lastLine() {
  const lines = terminalBody.querySelectorAll('.line');
  return lines.length ? lines[lines.length - 1] : null;
}

// The prompt currently accepting input, recreated if a clear removed it.
function activePromptLine() {
  let line = lastLine();
  if (!line || !line.querySelector('.cursor')) {
    appendNewPrompt();
    line = lastLine();
  }
  return line;
}

function updateCommandDisplay(text) {
  activePromptLine().innerHTML = typingPromptHTML(text);
  scrollToBottom();
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
      '        ├── favicon.png\n' +
      '        ├── og-card.png\n' +
      '        └── screenshots/</pre>'
  },
  { match: (i) => i === 'sudo' || i.startsWith('sudo '), run: () => 'Permission denied: You are not root.' },
  { match: (i) => i === 'rm -rf /' || i === 'rm -rf *' || i === 'rm -rf', run: () => 'Nice try. This portfolio is read-only.' },
  { match: (i) => i === 'vim' || i === 'vi', run: () => 'You are now inside vim. Good luck getting out.' },
  { match: (i) => i === 'exit' || i === 'logout', run: () => 'Nice try. There is no escape.' },
  { match: (i) => i === 'quit', run: () => 'No quitters here.' },
  { match: (i) => i === 'pwd', run: () => '/home/theodoros/portfolio' },
  { match: (i) => i === 'whoami', run: () => 'visitor - but you\'re welcome here.' },
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
  const line = activePromptLine();
  line.className = 'line';
  line.innerHTML = promptLineHTML(input);
}

function handleCommand(input) {
  renderCommandLine(input);

  const normalizedInput = input.trim().toLowerCase();

  if (normalizedInput === 'cls') {
    clearTerminalLines();
    appendNewPrompt();
    scrollToBottom();
    focusInput();
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
    addOutput(`<span class="error">Command not found: ${escapeHTML(cmd)}</span><br><span class="hint">Type</span> <span class="text-success">help</span> <span class="hint">to see available commands</span>`);
  }

  if (cmd === 'clear') {
    clearTerminalLines();
  }

  appendNewPrompt();
  scrollToBottom();
  focusInput();
}

function addOutput(output) {
  const outputLine = document.createElement('div');
  outputLine.className = 'line output';
  outputLine.innerHTML = output;
  terminalBody.appendChild(outputLine);
}

function initializeBackToTop() {
  const backToTop = document.getElementById('backToTop');
  if (!backToTop) return;

  const toggleButtonVisibility = () => {
    backToTop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.7);
  };

  backToTop.addEventListener('click', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    // Drop the stale section hash left by the nav anchors. replaceState rather
    // than location.hash = '', which leaves a bare '#' and adds a history entry.
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  });

  window.addEventListener('scroll', toggleButtonVisibility, { passive: true });
  window.addEventListener('resize', toggleButtonVisibility);
  toggleButtonVisibility();
}

function initializeGalleries() {
  document.querySelectorAll('[data-gallery]').forEach((card) => {
    const shots = card.querySelectorAll('.shot-frame img');
    const thumbs = card.querySelectorAll('.shot-thumb');
    const caption = card.querySelector('[data-caption-target]');
    if (shots.length < 2 || thumbs.length !== shots.length) return;

    const show = (index) => {
      shots.forEach((img, i) => img.classList.toggle('is-active', i === index));
      thumbs.forEach((btn, i) => {
        const active = i === index;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
        btn.tabIndex = active ? 0 : -1;
      });
      if (caption) {
        caption.textContent = shots[index].dataset.caption || '';
      }
    };

    thumbs.forEach((btn, i) => {
      btn.addEventListener('click', () => show(i));

      btn.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const next = e.key === 'ArrowRight'
          ? (i + 1) % thumbs.length
          : (i - 1 + thumbs.length) % thumbs.length;
        show(next);
        thumbs[next].focus();
      });
    });
  });
}

function initializeLightbox() {
  const lightbox = document.getElementById('lightbox');
  const frames = document.querySelectorAll('.shot-frame');
  if (!lightbox || !frames.length) return;

  const image = lightbox.querySelector('.lightbox-img');
  const closeButton = lightbox.querySelector('.lightbox-close');
  const prevButton = lightbox.querySelector('.lightbox-prev');
  const nextButton = lightbox.querySelector('.lightbox-next');
  let shots = [];
  let index = 0;
  let gallery = null;
  let lastTrigger = null;

  const render = () => {
    const shot = shots[index];
    image.src = shot.currentSrc || shot.src;
    image.alt = shot.alt || '';
    lightbox.setAttribute('aria-label', shot.alt || 'Full size screenshot');
  };

  const step = (delta) => {
    if (shots.length < 2) return;
    index = (index + delta + shots.length) % shots.length;
    render();
    // Keep the card's own gallery in step, so closing lands on the same shot.
    gallery?.querySelectorAll('.shot-thumb')[index]?.click();
  };

  const close = () => {
    lightbox.classList.remove('is-open');
    lightbox.hidden = true;
    document.body.style.overflow = '';
    image.src = '';
    // Return focus to the card's active thumbnail (it may have moved while browsing).
    const target = gallery?.querySelector('.shot-thumb.is-active') || lastTrigger;
    if (target) target.focus();
    lastTrigger = null;
    gallery = null;
  };

  const open = (shot, frame) => {
    shots = Array.from(frame.querySelectorAll('img'));
    index = Math.max(0, shots.indexOf(shot));
    gallery = frame.closest('[data-gallery]');
    lastTrigger = document.activeElement;

    const multiple = shots.length > 1;
    prevButton.hidden = !multiple;
    nextButton.hidden = !multiple;

    render();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    // Next frame, so the fade-in transition runs.
    requestAnimationFrame(() => lightbox.classList.add('is-open'));
    closeButton.focus();
  };

  frames.forEach((frame) => {
    // Delegated to the image, so the letterbox area stays inert.
    frame.addEventListener('click', (e) => {
      const shot = e.target.closest('img');
      if (shot) open(shot, frame);
    });
  });

  closeButton.addEventListener('click', close);
  prevButton.addEventListener('click', () => step(-1));
  nextButton.addEventListener('click', () => step(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  // Horizontal swipe on touch screens.
  let touchStartX = null;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.touches.length === 1 ? e.touches[0].clientX : null;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      step(e.key === 'ArrowRight' ? 1 : -1);
      return;
    }
    // Focus trap: cycle through the visible lightbox buttons.
    if (e.key === 'Tab') {
      e.preventDefault();
      const focusables = [prevButton, nextButton, closeButton].filter((btn) => !btn.hidden);
      const current = focusables.indexOf(document.activeElement);
      const next = (current + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length;
      focusables[next].focus();
    }
  });
}

function buildTerminalOnce() {
  if (terminalReady) return;
  terminalReady = true;

  initializeTerminal();

  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const cmd = chip.getAttribute('data-cmd');
      if (!cmd) return;
      if (terminalInput) terminalInput.value = '';
      addCommandToHistory(cmd.trim().toLowerCase());
      handleCommand(cmd);
    });
  });
}

function initializeTerminalToggle() {
  const toggle = document.getElementById('terminalToggle');
  const wrap = document.getElementById('terminalWrap');
  if (!toggle || !wrap) return;

  const label = toggle.querySelector('.toggle-label');
  const setLabel = (open) => {
    if (label) label.textContent = open ? 'close' : 'open';
  };

  const startOpen = toggle.getAttribute('aria-expanded') === 'true';
  wrap.hidden = !startOpen;
  setLabel(startOpen);
  if (startOpen) buildTerminalOnce();

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    wrap.hidden = isOpen;
    setLabel(!isOpen);

    if (!isOpen) {
      buildTerminalOnce();
      const input = document.getElementById('cliInput');
      if (input) input.focus({ preventScroll: true });
    }
  });
}

// Case studies are native <dialog>s addressed by #case-* hashes, so a single
// case study can be linked directly. Opening from a card pushes a history entry,
// which lets the Back button (and swipe-back on phones) close the dialog.
function initializeCaseStudies() {
  const dialogs = new Map();
  document.querySelectorAll('dialog.case-study').forEach((d) => dialogs.set(`#${d.id}`, d));
  if (!dialogs.size) return;

  let pushedEntry = false;
  let lastTrigger = null;

  const syncToHash = () => {
    const target = dialogs.get(window.location.hash);
    dialogs.forEach((d) => {
      if (d !== target && d.open) d.close();
    });
    if (target && !target.open) {
      target.showModal();
      target.querySelector('.case-body').scrollTop = 0;
      document.body.style.overflow = 'hidden';
    }
  };

  document.querySelectorAll('[data-case-open]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const hash = link.getAttribute('href');
      if (!dialogs.has(hash)) return;
      e.preventDefault();
      lastTrigger = link;
      history.pushState(null, '', hash);
      pushedEntry = true;
      syncToHash();
    });
  });

  dialogs.forEach((d) => {
    d.addEventListener('close', () => {
      document.body.style.overflow = '';
      // Closed by Esc, the close button or the backdrop: drop the hash too.
      if (window.location.hash === `#${d.id}`) {
        if (pushedEntry) {
          pushedEntry = false;
          history.back();
        } else {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
      if (lastTrigger) {
        lastTrigger.focus({ preventScroll: true });
        lastTrigger = null;
      }
    });

    d.querySelector('[data-case-close]')?.addEventListener('click', () => d.close());

    // Clicks on the backdrop land on the <dialog> itself, outside its content.
    d.addEventListener('click', (e) => {
      if (e.target === d) d.close();
    });
  });

  window.addEventListener('popstate', () => {
    if (!dialogs.has(window.location.hash)) pushedEntry = false;
    syncToHash();
  });

  syncToHash();
}

function initializeStickyHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const update = () => header.classList.toggle('is-stuck', window.scrollY > 8);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

document.addEventListener('DOMContentLoaded', () => {
  initializeGalleries();
  initializeLightbox();
  initializeTerminalToggle();
  initializeCaseStudies();
  initializeStickyHeader();
  initializeBackToTop();
});
