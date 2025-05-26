let hskData = []
let currentIndex = 0
let score = 0
let totalQuestions = 0
let currentQuizKeyHandler = null
let currentHSK = 3
let stopwatchInterval = null;
let startTime = null;

function updateStopwatch() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  document.getElementById('stopwatch').textContent = `Time: ${elapsed}s`;
}

function startStopwatch() {
  startTime = Date.now();
  updateStopwatch();
  stopwatchInterval = setInterval(updateStopwatch, 1000);
}

function stopStopwatch() {
  if (stopwatchInterval) {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
  }
}

async function loadHSKData() {
  const resp = await fetch(`./vocab/hsk${currentHSK}.json`)
  console.log(`Loading HSK data for level ${currentHSK} from fetch`)
  if (!resp.ok) throw new Error(`Could not load HSK data: ${resp.status}`)
  return resp.json()
}

function toggleHSK() {
  currentHSK = currentHSK === 3 ? 4 : 3;
  document.getElementById('change-hsk-btn').textContent = `Change to HSK ${currentHSK}`;
  loadHSKData().then(data => {
    hskData = data;
    console.log(`HSK data loaded for level ${currentHSK}`);
  });
}

function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  applyTheme(theme);
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    document.getElementById('theme-toggle').textContent = 'Light Mode';
  } else {
    document.documentElement.classList.remove('dark');
    document.getElementById('theme-toggle').textContent = 'Dark Mode';
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  const nextTheme = isDark ? 'light' : 'dark';
  applyTheme(nextTheme);
  localStorage.setItem('theme', nextTheme);
}

function updateScore() {
  document.getElementById('score')
          .textContent = `Score: ${score} / ${totalQuestions}`
}

function startFlashcards() {
  if (stopwatchInterval) {
    document.getElementById('stopwatch').style.display = 'none';
  }

  document.getElementById('score').textContent = ''
  currentIndex = 0
  const app = document.getElementById('app')
  app.innerHTML = '<div id="card">Click to reveal</div>'
  const card = document.getElementById('card')

  function showCard() {
    const item = hskData[currentIndex]
    card.textContent = item.hanzi
    card.onclick = () => {
      card.innerHTML = `
      <div>
        <div class="">
          ${item.hanzi}
        </div>

        <div class="definition-row">
          <span class="translation">Mandarin:<br>${item.pinyin}<br>${item.english}<br></span>
          <button
            class="audio-btn"
            onclick="event.stopPropagation(); playAudio(${currentHSK}, '${item.hanzi}')"
          >🔊</button>
        </div>
        <br>

        <div class="definition-row">
          <span class="translation">Cantonese:<br>${item.cantonese.hanzi}<br>${item.cantonese.jyutping}<br></span>
          <button
            class="audio-btn"
            onclick="event.stopPropagation(); playAudio(${currentHSK}, '${item.cantonese.hanzi}')"
          >🔊</button>
        </div>
      </div>
      `
      card.onclick = () => {
        currentIndex = (currentIndex + 1) % hskData.length
        showCard()
      }
    }
  }

  showCard();

  document.getElementById('change-hsk-btn').addEventListener('click', showCard);
}

function startQuiz() {
  document.getElementById('stopwatch').style.display = 'block';
  startStopwatch();

  // if we left an old handler around, remove it
  if (currentQuizKeyHandler) {
    document.removeEventListener('keydown', currentQuizKeyHandler)
    currentQuizKeyHandler = null
  }

  // pick a random item + build 4 options
  const item    = hskData[Math.floor(Math.random() * hskData.length)]
  const correct = item.english
  const options = new Set([correct])
  while (options.size < 4) {
    const r = hskData[Math.floor(Math.random() * hskData.length)].english
    options.add(r)
  }

  // shuffle into an array
  const shuffled = Array.from(options).sort(() => Math.random() - .5)

  // render the quiz prompt + buttons
  const app = document.getElementById('app')
  app.innerHTML = `
    <div id="quiz">
      <div class="definition-row">
        <span class="translation">Mandarin: ${item.hanzi} (${item.pinyin})</span>
        <button
          class="audio-btn"
          onclick="event.stopPropagation(); playAudio(${currentHSK}, '${item.hanzi}')"
        >🔊</button>
      </div>

      <div class="definition-row">
        <span class="translation">Cantonese: ${item.cantonese.hanzi} (${item.cantonese.jyutping})</span>
        <button
          class="audio-btn"
          onclick="event.stopPropagation(); playAudio(${currentHSK}, '${item.cantonese.hanzi}')"
        >🔊</button>
        </div>
    </div>
    ` + shuffled.map((opt, i) => `
      <button class="quiz-option"
              onclick="checkAnswer('${opt}', '${correct}')">
              ${opt}
      </button>
    `).join('')
  
  // keyboard listener for options
  currentQuizKeyHandler = function onKey(e) {
    const k = e.key
    if (k >= '1' && k <= '4') {
      e.preventDefault()
      // remove listener right away
      document.removeEventListener('keydown', onKey)
      currentQuizKeyHandler = null

      // map '1'→0, '2'→1, etc.
      const idx      = Number(k) - 1
      const selected = shuffled[idx]
      checkAnswer(selected, correct)
    }
  }
  document.addEventListener('keydown', currentQuizKeyHandler)
  document.getElementById('change-hsk-btn').addEventListener('click', startQuiz);
}

function checkAnswer(selected, correct) {
  stopStopwatch();

  // remove keyboard handler if we never used it
  if (currentQuizKeyHandler) {
    document.removeEventListener('keydown', currentQuizKeyHandler)
    currentQuizKeyHandler = null
  }

  totalQuestions++
  if (selected === correct) score++
  updateScore()

  // render result + retry button
  const app = document.getElementById('app')
  app.innerHTML = `
    <p>${selected === correct
          ? '✅ Correct!'
          : `❌ Wrong — the answer is ${correct}`}</p>
    <button id="retry">Try another</button>
  `

  const retryButton = document.getElementById('retry')

  // 1) click handler: remove Enter‐listener & restart quiz
  retryButton.onclick = () => {
    document.removeEventListener('keydown', onEnter)
    startQuiz()
  }

  // keydown handler: on Enter → click the retry button
  function onEnter(e) {
    if (e.key === 'Enter' || e.key === '5') {
      e.preventDefault()
      retryButton.click()
    }
  }
  document.addEventListener('keydown', onEnter)

  // focus on the Enter button
  retryButton.focus()
}

async function playAudio(hsk_version, filename) {
  const audio = new Audio(`./sounds/hsk${hsk_version}/${filename}.mp3`);
  try {
    await audio.play();
  } catch (err) {
    console.error('🔊 Audio playback failed:', err);
  }
}

async function loadMotivation() {
  const today = new Date().toISOString().slice(0,10);
  let lastDate = localStorage.getItem('lastLoginDate');
  let streak = Number(localStorage.getItem('currentStreak') || 0);

  // update streak
  if (lastDate === today) {
    // already counted today
  } else if (
    lastDate
    && new Date(today) - new Date(lastDate) === 24*60*60*1000
  ) {
    // yesterday → continue streak
    streak += 1;
  } else {
    // gap or first run → reset
    streak = 1;
  }

  // persist
  localStorage.setItem('lastLoginDate', today);
  localStorage.setItem('currentStreak', streak);

  // load motivational quotes
  const resp = await fetch('./data/motivations.json');
  const quotes = await resp.json();
  const quote  = quotes[Math.floor(Math.random() * quotes.length)];

  // render banner
  const banner = document.getElementById('motivation-banner');
  // <strong>"${quote}"</strong> 
  banner.innerHTML = `
    <span id="close-banner" class="close-btn">✖</span>
    <div class="streak">🔥 Current streak: ${streak} day${streak > 1 ? 's' : ''}</div>
  `;

  // event listener to close the banner
  document.getElementById('close-banner').addEventListener('click', () => {
    banner.style.display = 'none';
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initializeTheme();
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  loadMotivation();

  // load data & wire up quiz/flashcard
  hskData = await loadHSKData();
  document.getElementById('flashcard-btn')
          .addEventListener('click', startFlashcards);
  document.getElementById('quiz-btn')
          .addEventListener('click', startQuiz);
  document.getElementById('change-hsk-btn')
          .addEventListener('click', toggleHSK);
});
