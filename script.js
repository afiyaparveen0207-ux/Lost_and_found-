/* ---------- Question bank ---------- */
const QUIZ_TIME_SECONDS = 120;
const STORAGE_KEY = "quizMasterBestScores";

const categories = {
  "Web Development": {
    icon: "💻",
    questions: [
      { q: "What does HTML stand for?", options: ["HyperText Markup Language", "High Text Machine Language", "Hyperlinks and Text Markup Language", "Home Tool Markup Language"], answer: "HyperText Markup Language" },
      { q: "Which CSS property changes the text colour?", options: ["color", "font-color", "text-color", "fgcolor"], answer: "color" },
      { q: "Which HTML tag defines the largest heading?", options: ["<h1>", "<h6>", "<head>", "<heading>"], answer: "<h1>" },
      { q: "Which JavaScript method selects an element by its id?", options: ["document.getElementById()", "document.selectId()", "document.query()", "getElement()"], answer: "document.getElementById()" },
      { q: "Which browser feature stores data that persists after the tab is closed?", options: ["localStorage", "alert()", "prompt()", "parseInt()"], answer: "localStorage" },
      { q: "Which CSS declaration turns on Flexbox layout?", options: ["display: flex", "layout: flex", "flex: on", "position: flex"], answer: "display: flex" },
      { q: "Which HTML tag creates a hyperlink?", options: ["<a>", "<link>", "<href>", "<url>"], answer: "<a>" },
      { q: "Which symbol is used for an ID selector in CSS?", options: ["#", ".", "*", "&"], answer: "#" }
    ]
  },
  "Artificial Intelligence": {
    icon: "🤖",
    questions: [
      { q: "What does AI stand for?", options: ["Artificial Intelligence", "Automated Interface", "Applied Integration", "Analytical Input"], answer: "Artificial Intelligence" },
      { q: "Who coined the term 'Artificial Intelligence'?", options: ["John McCarthy", "Charles Babbage", "Tim Berners-Lee", "Bill Gates"], answer: "John McCarthy" },
      { q: "Which type of learning uses labelled data?", options: ["Supervised learning", "Unsupervised learning", "Reinforcement learning", "Random learning"], answer: "Supervised learning" },
      { q: "Neural networks are inspired by the structure of the…", options: ["Human brain", "Solar system", "Internet", "Calculator"], answer: "Human brain" },
      { q: "What does NLP stand for?", options: ["Natural Language Processing", "Neural Logic Programming", "Network Layer Protocol", "Numeric Learning Process"], answer: "Natural Language Processing" },
      { q: "Which of these is a Python machine-learning library?", options: ["scikit-learn", "Bootstrap", "jQuery", "React"], answer: "scikit-learn" },
      { q: "The Turing Test checks whether a machine can…", options: ["Behave indistinguishably from a human in conversation", "Process data faster than a human", "Store more memory than a human", "Run without electricity"], answer: "Behave indistinguishably from a human in conversation" },
      { q: "Overfitting means a model…", options: ["Does well on training data but poorly on new data", "Does poorly on all data", "Trains too quickly", "Uses too little data"], answer: "Does well on training data but poorly on new data" }
    ]
  },
  "General Knowledge": {
    icon: "🌍",
    questions: [
      { q: "What is the capital of India?", options: ["New Delhi", "Mumbai", "Chennai", "Kolkata"], answer: "New Delhi" },
      { q: "Which is the largest planet in our solar system?", options: ["Jupiter", "Saturn", "Earth", "Neptune"], answer: "Jupiter" },
      { q: "What is the national animal of India?", options: ["Tiger", "Lion", "Elephant", "Leopard"], answer: "Tiger" },
      { q: "What is the chemical formula of water?", options: ["H2O", "CO2", "O2", "NaCl"], answer: "H2O" },
      { q: "Who wrote the Indian national anthem?", options: ["Rabindranath Tagore", "Bankim Chandra Chatterjee", "Sarojini Naidu", "Subramania Bharati"], answer: "Rabindranath Tagore" },
      { q: "Which is the largest ocean on Earth?", options: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"], answer: "Pacific Ocean" },
      { q: "How many states does India have?", options: ["28", "26", "29", "30"], answer: "28" },
      { q: "Which gas do plants absorb from the air for photosynthesis?", options: ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"], answer: "Carbon dioxide" }
    ]
  },
  "Mathematics": {
    icon: "➗",
    questions: [
      { q: "What is 12 × 12?", options: ["144", "122", "124", "132"], answer: "144" },
      { q: "What is the square root of 169?", options: ["13", "12", "14", "15"], answer: "13" },
      { q: "What is 15% of 200?", options: ["30", "25", "35", "20"], answer: "30" },
      { q: "The sum of the angles in a triangle is…", options: ["180°", "90°", "270°", "360°"], answer: "180°" },
      { q: "What is the value of π up to two decimal places?", options: ["3.14", "3.41", "3.12", "3.24"], answer: "3.14" },
      { q: "Which is the next prime number after 7?", options: ["11", "9", "10", "13"], answer: "11" },
      { q: "What is 2⁵?", options: ["32", "16", "64", "10"], answer: "32" },
      { q: "Area of a circle with radius 7 (use π = 22/7)?", options: ["154", "44", "49", "308"], answer: "154" }
    ]
  }
};

/* ---------- State ---------- */
let currentCategory = null;
let quizQuestions = [];
let userAnswers = [];
let currentIndex = 0;
let timeLeft = QUIZ_TIME_SECONDS;
let timerId = null;

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
}

function loadBest() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

function saveBest(category, record) {
  try {
    const all = loadBest();
    all[category] = record;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch { /* storage unavailable: ignore */ }
}

function formatTime(s) {
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
}

/* ---------- Category screen ---------- */
function renderCategories() {
  const list = $("category-list");
  list.innerHTML = "";
  const best = loadBest();

  Object.keys(categories).forEach((name) => {
    const cat = categories[name];
    const card = document.createElement("button");
    card.className = "category-card";

    const icon = document.createElement("div");
    icon.className = "icon";
    icon.textContent = cat.icon;

    const title = document.createElement("h4");
    title.textContent = name;

    const info = document.createElement("small");
    info.textContent = `${cat.questions.length} questions • ${formatTime(QUIZ_TIME_SECONDS)}`;

    const bestLine = document.createElement("small");
    bestLine.textContent = best[name]
      ? `🏆 Best: ${best[name].score}/${best[name].total} (${best[name].percent}%)`
      : "No attempts yet";

    card.append(icon, title, info, bestLine);
    card.addEventListener("click", () => startQuiz(name));
    list.appendChild(card);
  });
}

/* ---------- Quiz flow ---------- */
function startQuiz(name) {
  currentCategory = name;
  quizQuestions = shuffle(categories[name].questions).map((item) => ({
    ...item,
    options: shuffle(item.options)
  }));
  userAnswers = new Array(quizQuestions.length).fill(null);
  currentIndex = 0;
  timeLeft = QUIZ_TIME_SECONDS;

  $("quiz-category").textContent = name;
  showScreen("quiz-screen");
  renderQuestion();
  startTimer();
}

function startTimer() {
  clearInterval(timerId);
  updateTimerDisplay();
  timerId = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerId);
      submitQuiz(true); // auto-submit when time is up
    }
  }, 1000);
}

function updateTimerDisplay() {
  const t = $("timer");
  t.textContent = formatTime(Math.max(timeLeft, 0));
  t.classList.toggle("warning", timeLeft <= 20);
}

function renderQuestion() {
  const item = quizQuestions[currentIndex];
  $("question-count").textContent = `Question ${currentIndex + 1} of ${quizQuestions.length}`;
  $("question-text").textContent = item.q;
  $("progress-bar").style.width = `${((currentIndex + 1) / quizQuestions.length) * 100}%`;

  const box = $("options");
  box.innerHTML = "";
  item.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = opt;
    if (userAnswers[currentIndex] === opt) btn.classList.add("selected");
    btn.addEventListener("click", () => selectAnswer(opt));
    box.appendChild(btn);
  });

  const isLast = currentIndex === quizQuestions.length - 1;
  $("prev-btn").disabled = currentIndex === 0;
  $("next-btn").classList.toggle("hidden", isLast);
  $("submit-btn").classList.toggle("hidden", !isLast);
}

function selectAnswer(opt) {
  userAnswers[currentIndex] = opt;
  document.querySelectorAll(".option").forEach((b) => {
    b.classList.toggle("selected", b.textContent === opt);
  });
}

/* ---------- Submission & results ---------- */
function submitQuiz(timedOut = false) {
  clearInterval(timerId);

  const total = quizQuestions.length;
  let correct = 0, attempted = 0;
  quizQuestions.forEach((item, i) => {
    if (userAnswers[i] !== null) {
      attempted++;
      if (userAnswers[i] === item.answer) correct++;
    }
  });
  const incorrect = attempted - correct;
  const percent = Math.round((correct / total) * 100);

  $("result-title").textContent = timedOut ? "⏰ Time's up!" : "Quiz Complete";
  $("score-percent").textContent = `${percent}%`;
  $("score-text").textContent = `${correct} / ${total}`;
  $("score-percent").parentElement.style.setProperty("--deg", `${percent * 3.6}deg`);
  $("sum-total").textContent = total;
  $("sum-attempted").textContent = attempted;
  $("sum-correct").textContent = correct;
  $("sum-incorrect").textContent = incorrect;

  // Best score (Local Storage)
  const best = loadBest()[currentCategory];
  let message;
  if (!best || correct > best.score) {
    saveBest(currentCategory, { score: correct, total, percent });
    message = best ? "🎉 New best score for this category!" : "🏆 First score saved as your best!";
  } else {
    message = `Your best in ${currentCategory}: ${best.score}/${best.total} (${best.percent}%)`;
  }
  $("best-score").textContent = message;

  renderReview();
  showScreen("result-screen");
}

function renderReview() {
  const review = $("review");
  review.innerHTML = "";

  quizQuestions.forEach((item, i) => {
    const given = userAnswers[i];
    const status = given === null ? "skipped" : given === item.answer ? "correct" : "incorrect";

    const div = document.createElement("div");
    div.className = `review-item ${status}`;

    const q = document.createElement("p");
    q.className = "q";
    q.textContent = `${i + 1}. ${item.q}`;

    const yours = document.createElement("p");
    if (status === "skipped") {
      yours.textContent = "Your answer: Not answered";
    } else {
      yours.textContent = "Your answer: ";
      const span = document.createElement("span");
      span.className = status === "correct" ? "tag-good" : "tag-bad";
      span.textContent = `${given} ${status === "correct" ? "✓" : "✗"}`;
      yours.appendChild(span);
    }
    div.append(q, yours);

    if (status !== "correct") {
      const right = document.createElement("p");
      right.textContent = "Correct answer: ";
      const span = document.createElement("span");
      span.className = "tag-good";
      span.textContent = item.answer;
      right.appendChild(span);
      div.appendChild(right);
    }
    review.appendChild(div);
  });
}

/* ---------- Events ---------- */
$("next-btn").addEventListener("click", () => {
  if (currentIndex < quizQuestions.length - 1) { currentIndex++; renderQuestion(); }
});
$("prev-btn").addEventListener("click", () => {
  if (currentIndex > 0) { currentIndex--; renderQuestion(); }
});
$("submit-btn").addEventListener("click", () => {
  const unanswered = userAnswers.filter((a) => a === null).length;
  if (unanswered === 0 || confirm(`${unanswered} question(s) unanswered. Submit anyway?`)) {
    submitQuiz(false);
  }
});
$("restart-btn").addEventListener("click", () => startQuiz(currentCategory));
$("another-btn").addEventListener("click", () => {
  renderCategories();
  showScreen("start-screen");
});

renderCategories();
