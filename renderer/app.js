let hskData = []
let currentIndex = 0
let score = 0
let totalQuestions = 0

async function loadHSKData() {
  const resp = await fetch('./vocab/hsk3.json')
  console.log("Loading HSK data from fetch")
  if (!resp.ok) throw new Error(`Could not load HSK data: ${resp.status}`)
  return resp.json()
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
  const item = hskData[Math.floor(Math.random() * hskData.length)]
  const options = new Set([item.english])
  while (options.size < 4) {
    options.add(hskData[Math.floor(Math.random() * hskData.length)].english)
  }
  const shuffled = Array.from(options).sort(() => Math.random() - .5)

  const app = document.getElementById('app')
  app.innerHTML = `
    <div id="quiz">
      ${item.hanzi} (${item.pinyin})<br>
      Cantonese: ${item.cantonese.hanzi} (${item.cantonese.jyutping})
    </div>
  ` + shuffled.map(opt => `
    <button class="quiz-option"
            onclick="checkAnswer('${opt}', '${item.english}')">
      ${opt}<br><small>
      </small>
    </button>
  `).join('')
}

function checkAnswer(selected, correct) {
  totalQuestions++
  if (selected === correct) score++
  updateScore()
  document.getElementById('app').innerHTML = `
    <p>${selected === correct ? '✅ Correct!' : `❌ Wrong — the answer is ${correct}`}</p>
    <button id="retry">Try another</button>
  `
  document.getElementById('retry').onclick = startQuiz
}

async function playAudio(filename) {
  const audio = new Audio(`./sounds/${filename}.mp3`);
  try {
    await audio.play();
  } catch (err) {
    console.error('🔊 Audio playback failed:', err);
  }
}

// 2) wait for DOM + data, then wire up buttons
document.addEventListener('DOMContentLoaded', async () => {
  hskData = await loadHSKData()
  document.getElementById('flashcard-btn')
          .addEventListener('click', startFlashcards)
  document.getElementById('quiz-btn')
          .addEventListener('click', startQuiz)
})
