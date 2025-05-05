let hskData = []
let currentIndex = 0
let score = 0
let totalQuestions = 0
let currentQuizKeyHandler = null

async function loadHSKData() {
  const resp = await fetch('./vocab/hsk3.json')
  console.log("Loading HSK data from fetch")
  if (!resp.ok) throw new Error(`Could not load HSK data: ${resp.status}`)
  return resp.json()
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  const btn = document.getElementById('theme-toggle');
  btn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
}

/** Flip theme and persist choice */
function toggleTheme() {
  const isCurrentlyDark = document.documentElement.classList.contains('dark');
  const next = isCurrentlyDark ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('theme', next);
}

function updateScore() {
  document.getElementById('score')
          .textContent = `Score: ${score} / ${totalQuestions}`
}

function startFlashcards() {
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
        <strong>${item.hanzi}</strong><br>

        <div class="definition-row">
          <span>Mandarin: ${item.pinyin} – ${item.english}</span>
          <button
            class="audio-btn"
            onclick="event.stopPropagation(); playAudio('${item.hanzi}')"
          >🔊</button>
        </div>

        <div class="definition-row">
          <span>Cantonese: ${item.cantonese.hanzi} (${item.cantonese.jyutping})</span>
          <button
            class="audio-btn"
            onclick="event.stopPropagation(); playAudio('${item.cantonese.hanzi}')"
          >🔊</button>
        </div>
      `
      card.onclick = () => {
        currentIndex = (currentIndex + 1) % hskData.length
        showCard()
      }
    }
  }

  showCard()
}

function startQuiz() {
  // 💡 If we left an old handler around, remove it
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
        <span>${item.hanzi} – ${item.pinyin}</span>
        <button
          class="audio-btn"
          onclick="event.stopPropagation(); playAudio('${item.hanzi}')"
        >🔊</button>
      </div>

      <div class="definition-row">
        <span>Cantonese: ${item.cantonese.hanzi} (${item.cantonese.jyutping})</span>
        <button
          class="audio-btn"
          onclick="event.stopPropagation(); playAudio('${item.cantonese.hanzi}')"
        >🔊</button>
        </div>
    </div>
    ` + shuffled.map((opt,i) => `
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
}

function checkAnswer(selected, correct) {
  // 💡 remove keyboard handler if we never used it
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

async function playAudio(filename) {
  const audio = new Audio(`./sounds/${filename}.mp3`);
  try {
    await audio.play();
  } catch (err) {
    console.error('🔊 Audio playback failed:', err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // 1) Apply saved theme
  const saved = localStorage.getItem('theme') || 'light';
  applyTheme(saved);

  // 2) Wire theme-toggle button
  document.getElementById('theme-toggle')
          .addEventListener('click', toggleTheme);

  // 3) Load data & wire up quiz/flashcard
  hskData = await loadHSKData();
  document.getElementById('flashcard-btn')
          .addEventListener('click', startFlashcards);
  document.getElementById('quiz-btn')
          .addEventListener('click', startQuiz);
});
