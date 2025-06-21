// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let timerInterval; // Timer for countdown
let score = 0; // Player's score
let timeLeft = 30; // 30-second timer
const feedback = document.getElementById("feedback-message");

// --- Difficulty settings ---
const difficultySettings = {
  easy:    { winScore: 12, time: 40, dropInterval: 1200, badDropChance: 0.15, obstacleChance: 0.18 },
  normal:  { winScore: 20, time: 30, dropInterval: 1000, badDropChance: 0.25, obstacleChance: 0.35 },
  hard:    { winScore: 28, time: 20, dropInterval: 700,  badDropChance: 0.33, obstacleChance: 0.5  }
};
let currentDifficulty = 'normal';
let currentSettings = difficultySettings[currentDifficulty];

const winMessages = [
  "Amazing! You brought clean water to the village!",
  "You did it! The community celebrates your effort!",
  "Victory! Every drop counts, and you caught enough!"
];
const loseMessages = [
  "Try again! The village still needs more clean water.",
  "Almost there! Avoid the dirty drops next time.",
  "Keep going! Clean water is just a few drops away."
];

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("reset-btn").addEventListener("click", resetGame);
const difficultySelect = document.getElementById("difficulty");
difficultySelect.addEventListener("change", function() {
  currentDifficulty = difficultySelect.value;
  currentSettings = difficultySettings[currentDifficulty];
  document.querySelector('.game-tagline').textContent =
    `Catch ${currentSettings.winScore} good drops to win, avoid the bad ones!`;
  resetGame();
});

let soundOn = true;
const soundToggleBtn = document.getElementById("sound-toggle");
soundToggleBtn.addEventListener("click", function() {
  soundOn = !soundOn;
  soundToggleBtn.textContent = soundOn ? "🔊" : "🔇";
  soundToggleBtn.setAttribute('aria-label', soundOn ? 'Mute sound' : 'Unmute sound');
});

// Utility to play a sound if enabled
function playSound(id) {
  if (!soundOn) return;
  const audio = document.getElementById(id);
  if (audio) {
    audio.currentTime = 0;
    audio.play();
  }
}

// --- Background Music and Nuanced Sound Effects ---
// Add background music audio element and toggle button if not present
(function addMusicElements() {
  if (!document.getElementById('bg-music')) {
    const music = document.createElement('audio');
    music.id = 'bg-music';
    music.src = 'soft-piano-100-bpm-121529.mp3'; // Place your gentle background music here
    music.loop = true;
    music.volume = 0.18;
    document.body.appendChild(music);
  }
  if (!document.getElementById('music-toggle')) {
    const btn = document.createElement('button');
    btn.id = 'music-toggle';
    btn.className = 'music-toggle';
    btn.textContent = '🎵 Music On';
    btn.setAttribute('aria-label', 'Toggle background music');
    document.querySelector('.score-panel').appendChild(btn);
  }
})();

let musicOn = true;
const bgMusic = document.getElementById('bg-music');
const musicToggleBtn = document.getElementById('music-toggle');
if (musicToggleBtn) {
  musicToggleBtn.onclick = function() {
    musicOn = !musicOn;
    if (musicOn) {
      bgMusic.volume = 0.18;
      bgMusic.play();
      musicToggleBtn.textContent = '🎵 Music On';
      musicToggleBtn.classList.add('active');
    } else {
      bgMusic.pause();
      musicToggleBtn.textContent = '🔇 Music Off';
      musicToggleBtn.classList.remove('active');
    }
  };
}
// Auto-play music on game start (if not muted)
const origStartGameMusic = startGame;
startGame = function() {
  origStartGameMusic.apply(this, arguments);
  if (musicOn && bgMusic.paused) {
    bgMusic.play();
  }
};
// Pause music on game end
const origEndGameMusic = endGame;
endGame = function() {
  origEndGameMusic.apply(this, arguments);
  if (bgMusic && !musicOn) bgMusic.pause();
};
// Pause music on reset
const origResetGameMusic = resetGame;
resetGame = function() {
  origResetGameMusic.apply(this, arguments);
  if (bgMusic && !musicOn) bgMusic.pause();
};

// Add audio elements (replace with your actual file names)
const audioHTML = `
<audio id="sfx-collect" src="fantasy-game-sword-cut-sound-effect-get-more-on-my-patreon-339824.mp3" preload="auto"></audio>
<audio id="sfx-bad" src="Sounds/bad.mp3" preload="auto"></audio>
<audio id="sfx-win" src="Sounds/win.mp3" preload="auto"></audio>
<audio id="sfx-lose" src="Sounds/lose.mp3" preload="auto"></audio>
<audio id="sfx-click" src="button-202966.mp3" preload="auto"></audio>
<audio id="sfx-gameover" src="game-over-31-179699.mp3" preload="auto"></audio>
<audio id="sfx-gewonnen" src="gewonnen-87838.mp3" preload="auto"></audio>
<audio id="sfx-dropmiss" src="drop-sound-effect-240899.mp3" preload="auto"></audio>
`;
document.body.insertAdjacentHTML('beforeend', audioHTML);

// --- Nuanced Sound Effects ---
// Add more nuanced SFX (replace with your own files as needed)
(function addNuancedSFX() {
  const sfx = [
    { id: 'sfx-dropmiss-soft', src: 'Sounds/drop-miss-soft.mp3' },
    { id: 'sfx-collect-soft', src: 'Sounds/collect-soft.mp3' },
    { id: 'sfx-bad-soft', src: 'Sounds/bad-soft.mp3' },
    { id: 'sfx-obstacle', src: 'Sounds/obstacle.mp3' }
  ];
  sfx.forEach(({id,src}) => {
    if (!document.getElementById(id)) {
      const audio = document.createElement('audio');
      audio.id = id;
      audio.src = src;
      audio.preload = 'auto';
      document.body.appendChild(audio);
    }
  });
})();

// Use nuanced SFX for different actions
function playNuancedSound(type) {
  if (!soundOn) return;
  const audio = document.getElementById(type);
  if (audio) {
    audio.currentTime = 0;
    audio.play();
  }
}

// Add sound to button clicks
["start-btn", "reset-btn", "difficulty", "sound-toggle"].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("click", () => playSound("sfx-click"));
  }
});

// --- Milestone messages ---
const milestones = [
  { score: 5, message: "Great start! Keep going!" },
  { score: 10, message: "Halfway there!" },
  { score: 15, message: "So close! Just a few more drops!" }
];
let shownMilestones = new Set();

// --- Progress Bar for win condition ---
// Insert progress bar into the score panel
(function addProgressBar() {
  const scorePanel = document.querySelector('.score-panel');
  if (!document.getElementById('progress-bar-container') && scorePanel) {
    const bar = document.createElement('div');
    bar.className = 'progress-bar-container';
    bar.id = 'progress-bar-container';
    bar.innerHTML = `<div class="progress-bar" id="progress-bar"></div><span class="progress-bar-label" id="progress-bar-label"></span>`;
    // Place after theme toggle if present, else at end
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.insertAdjacentElement('afterend', bar);
    } else {
      scorePanel.appendChild(bar);
    }
  }
})();

function updateProgressBar() {
  const bar = document.getElementById('progress-bar');
  const label = document.getElementById('progress-bar-label');
  if (!bar || !label) return;
  const percent = Math.min(100, Math.round((score / currentSettings.winScore) * 100));
  bar.style.width = percent + '%';
  label.textContent = `${score} / ${currentSettings.winScore} clean drops`;
}

// Update progress bar on score change and game start/reset
document.addEventListener('DOMContentLoaded', updateProgressBar);
const origUpdateScoreDisplay = updateScoreDisplay;
updateScoreDisplay = function() {
  origUpdateScoreDisplay.apply(this, arguments);
  updateProgressBar();
};
const origStartGame = startGame;
startGame = function() {
  origStartGame.apply(this, arguments);
  updateProgressBar();
};
const origResetGame = resetGame;
resetGame = function() {
  origResetGame.apply(this, arguments);
  updateProgressBar();
};
const origEndGame2 = endGame;
endGame = function() {
  origEndGame2.apply(this, arguments);
  updateProgressBar();
};

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  // Only start if not already ended (feedback message is not visible)
  if (feedback.style.display === "block") return;

  gameRunning = true;
  score = 0;
  timeLeft = currentSettings.time;
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeLeft;
  feedback.style.display = "none";
  feedback.textContent = "";

  // Start drop and obstacle creation only when game starts
  dropMaker = setInterval(() => {
    createDrop();
    if (Math.random() < currentSettings.obstacleChance) createObstacle();
  }, currentSettings.dropInterval);
  // Start the timer countdown
  timerInterval = setInterval(updateTimer, 1000);
  playSound("sfx-click");

  shownMilestones.clear();
}

function updateTimer() {
  timeLeft--;
  document.getElementById("time").textContent = timeLeft;
  if (timeLeft <= 0) {
    endGame();
  }
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  const container = document.getElementById("game-container");
  container.innerHTML = "";
  if (score >= currentSettings.winScore) {
    // Stop all other sounds, then play celebration song
    ["sfx-win", "sfx-lose", "sfx-bad", "sfx-collect", "sfx-gameover"].forEach(id => {
      const a = document.getElementById(id);
      if (a) { a.pause(); a.currentTime = 0; }
    });
    const gewonnen = document.getElementById("sfx-gewonnen");
    if (gewonnen) {
      gewonnen.currentTime = 0;
      gewonnen.play();
    }
    let messageArr = winMessages;
    let msg = messageArr[Math.floor(Math.random() * messageArr.length)];
    feedback.textContent = msg + ` (Final Score: ${score})`;
    feedback.style.display = "block";
    updateScoreDisplay();
    showConfetti();
    feedback.style.transition = "opacity 0.5s";
    feedback.style.opacity = 1;
  } else {
    playSound("sfx-gameover");
    playSound("sfx-lose");
    // Keep lose message visible until reset as well
    feedback.style.transition = "opacity 0.5s";
    feedback.style.opacity = 1;
  }
}

// --- Themed Win/Lose Overlay ---
function showEndOverlay(type, score) {
  // Remove any existing overlay
  const old = document.getElementById('end-overlay');
  if (old) old.remove();
  const overlay = document.createElement('div');
  overlay.id = 'end-overlay';
  overlay.className = 'end-overlay ' + type;
  overlay.innerHTML = `
    <div class="end-modal">
      <img src="img/${type === 'win' ? 'cw_logo-horizontal.png' : 'cw_logo.png'}" alt="${type === 'win' ? 'Charity: water logo' : 'Game Over'}" class="end-illustration">
      <h2>${type === 'win' ? 'You Win! 💧' : 'Game Over'}</h2>
      <p class="end-message">${type === 'win' ? 'You brought clean water to the village!<br>Final Score: ' + score : 'Better luck next time!<br>Final Score: ' + score}</p>
      <button id="close-end-overlay">Close</button>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('show'), 10);
  document.getElementById('close-end-overlay').onclick = () => overlay.remove();
}

// Patch endGame to show overlay
const origEndGameOverlay = endGame;
endGame = function() {
  origEndGameOverlay.apply(this, arguments);
  if (score >= currentSettings.winScore) {
    showEndOverlay('win', score);
  } else {
    showEndOverlay('lose', score);
  }
};
// Remove overlay on game start/reset
const origStartGameOverlay = startGame;
startGame = function() {
  origStartGameOverlay.apply(this, arguments);
  const old = document.getElementById('end-overlay');
  if (old) old.remove();
};
const origResetGameOverlay = resetGame;
resetGame = function() {
  origResetGameOverlay.apply(this, arguments);
  const old = document.getElementById('end-overlay');
  if (old) old.remove();
};

function resetGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  score = 0;
  timeLeft = currentSettings.time;
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("game-container").innerHTML = "";
  feedback.style.display = "none";
  feedback.textContent = "";
  feedback.style.opacity = 1;

  shownMilestones.clear();
}

function updateScoreDisplay() {
  const scoreElem = document.getElementById("score");
  scoreElem.textContent = score;
  // Animate score color for feedback
  scoreElem.style.transition = "color 0.2s";
  scoreElem.style.color = "#FFC907"; // highlight color
  setTimeout(() => {
    scoreElem.style.color = "#131313"; // revert to default
  }, 300);
}

// --- Seasonal Theme Toggle ---
(function addThemeToggle() {
  if (!document.getElementById('theme-toggle')) {
    const select = document.createElement('select');
    select.id = 'theme-toggle';
    select.className = 'theme-toggle';
    select.setAttribute('aria-label', 'Select visual theme');
    select.innerHTML = `
      <option value="summer">☀️ Summer</option>
      <option value="winter">❄️ Winter</option>
      <option value="night">🌙 Night</option>
    `;
    document.querySelector('.score-panel').appendChild(select);
  }
})();

const themeSelect = document.getElementById('theme-toggle');
function setTheme(theme) {
  document.body.classList.remove('theme-summer', 'theme-winter', 'theme-night');
  document.body.classList.add('theme-' + theme);
  localStorage.setItem('cw-theme', theme);
}
themeSelect.addEventListener('change', function() {
  setTheme(this.value);
});
// On load, set theme from localStorage or default to summer
(function initTheme() {
  const saved = localStorage.getItem('cw-theme') || 'summer';
  themeSelect.value = saved;
  setTheme(saved);
})();

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");

  // Randomly decide if this is a good drop or a bad drop (dirty water)
  const isBadDrop = Math.random() < currentSettings.badDropChance; // 25% chance for a bad drop
  drop.className = isBadDrop ? "water-drop bad-drop" : "water-drop";

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Make the hit box larger for easier tapping/clicking
  drop.style.pointerEvents = "auto";
  drop.style.boxSizing = "content-box";
  drop.style.padding = "18px"; // Increase clickable area
  drop.style.margin = "-18px"; // Offset padding to keep visual size

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    if (!isBadDrop && gameRunning) {
      playSound("sfx-dropmiss");
      playNuancedSound('sfx-dropmiss-soft');
      // Show splash effect for missed good drop
      const rect = drop.getBoundingClientRect();
      const containerRect = document.getElementById('game-container').getBoundingClientRect();
      showSplashEffect(rect.left - containerRect.left + rect.width/2, containerRect.height - 30, false);
    }
    drop.remove();
  });

  // Add click event to handle good/bad drop
  drop.addEventListener("click", function() {
    if (!gameRunning) return;
    const rect = drop.getBoundingClientRect();
    const containerRect = document.getElementById('game-container').getBoundingClientRect();
    const splashX = rect.left - containerRect.left + rect.width/2;
    const splashY = rect.top - containerRect.top + rect.height/2;
    if (isBadDrop) {
      playSound("sfx-bad");
      playNuancedSound('sfx-bad-soft');
      score = Math.max(0, score - 2);
      // Show floating '-2' directly next to the red droplet (to the right)
      const minusTwo = document.createElement("div");
      minusTwo.textContent = "-2! Dirty water.";
      minusTwo.style.position = "absolute";
      minusTwo.style.left = (drop.offsetLeft + drop.offsetWidth + 8) + "px";
      minusTwo.style.top = (drop.offsetTop + drop.offsetHeight/2 - 18) + "px";
      minusTwo.style.color = "#F5402C";
      minusTwo.style.fontWeight = "bold";
      minusTwo.style.fontSize = "22px";
      minusTwo.style.background = "#fff";
      minusTwo.style.border = "2px solid #FF902A";
      minusTwo.style.borderRadius = "8px";
      minusTwo.style.padding = "6px 14px";
      minusTwo.style.boxShadow = "0 2px 4px rgba(245,64,44,0.08)";
      minusTwo.style.pointerEvents = "none";
      minusTwo.style.zIndex = 1000;
      minusTwo.style.transition = "opacity 0.5s, transform 0.7s";
      minusTwo.style.opacity = 1;
      minusTwo.style.transform = "translateY(0)";
      document.getElementById("game-container").appendChild(minusTwo);
      setTimeout(() => {
        minusTwo.style.opacity = 0;
        minusTwo.style.transform = "translateY(-40px)";
      }, 10);
      setTimeout(() => {
        minusTwo.remove();
      }, 800);
      showSplashEffect(splashX, splashY, true);
    } else {
      playSound("sfx-collect");
      playNuancedSound('sfx-collect-soft');
      score++;
      // Show floating '+1' directly next to the droplet (to the right)
      const plusOne = document.createElement("div");
      plusOne.textContent = "+1! Clean water collected!";
      plusOne.style.position = "absolute";
      // Position to the right of the droplet
      plusOne.style.left = (drop.offsetLeft + drop.offsetWidth + 8) + "px";
      plusOne.style.top = (drop.offsetTop + drop.offsetHeight/2 - 18) + "px";
      plusOne.style.color = "#2E9DF7";
      plusOne.style.fontWeight = "bold";
      plusOne.style.fontSize = "22px";
      plusOne.style.background = "#fff";
      plusOne.style.border = "2px solid #FFC907";
      plusOne.style.borderRadius = "8px";
      plusOne.style.padding = "6px 14px";
      plusOne.style.boxShadow = "0 2px 4px rgba(46,157,247,0.08)";
      plusOne.style.pointerEvents = "none";
      plusOne.style.zIndex = 1000;
      plusOne.style.transition = "opacity 0.5s, transform 0.7s";
      plusOne.style.opacity = 1;
      plusOne.style.transform = "translateY(0)";
      document.getElementById("game-container").appendChild(plusOne);
      setTimeout(() => {
        plusOne.style.opacity = 0;
        plusOne.style.transform = "translateY(-40px)";
      }, 10);
      setTimeout(() => {
        plusOne.remove();
      }, 800);
      showSplashEffect(splashX, splashY, false);
      showSparkleParticles(splashX, splashY); // Add sparkles for good drop
    }
    // Milestone check
    milestones.forEach(m => {
      if (score === m.score && !shownMilestones.has(m.score)) {
        feedback.textContent = m.message;
        feedback.style.display = "block";
        feedback.style.color = "#4FCB53";
        setTimeout(() => { feedback.style.display = "none"; }, 1200);
        shownMilestones.add(m.score);
      }
    });
    updateScoreDisplay();
    drop.remove(); // Remove drop when clicked
  });

  // --- Add a clickable can element ---
  const can = document.createElement("img");
  can.src = "img/water-can.png";
  can.alt = "Water Can";
  can.className = "water-can";
  can.style.position = "absolute";
  can.style.width = "50px";
  can.style.height = "50px";
  // Place can randomly near the bottom
  const canX = Math.random() * (gameWidth - 50);
  can.style.left = canX + "px";
  can.style.bottom = "10px";
  can.style.cursor = "pointer";

  // Add can to the game container
  document.getElementById("game-container").appendChild(can);

  // Can click event: +3 points
  can.addEventListener("click", function() {
    if (!gameRunning) return;
    score += 3;
    feedback.textContent = "+3! Water can bonus!";
    feedback.style.color = "#FFC907";
    feedback.style.display = "block";
    setTimeout(() => { feedback.style.display = "none"; }, 900);
    updateScoreDisplay();
    can.remove();
  });

  // Remove can after 2.5 seconds if not clicked
  setTimeout(() => {
    can.remove();
  }, 2500);
}

function createObstacle() {
  const obstacle = document.createElement("div");
  obstacle.className = "obstacle";
  obstacle.title = "Avoid!";
  // Random size and position
  const size = 50 + Math.random() * 30;
  obstacle.style.width = obstacle.style.height = `${size}px`;
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - size);
  obstacle.style.left = xPosition + "px";
  obstacle.style.top = "0px";
  obstacle.style.position = "absolute";
  obstacle.style.background = "#F16061 url('img/cw_logo.png') center/contain no-repeat";
  obstacle.style.border = "3px solid #F5402C";
  obstacle.style.borderRadius = "50%";
  obstacle.style.zIndex = 10;
  obstacle.style.boxShadow = "0 2px 8px rgba(245,64,44,0.15)";
  obstacle.style.animation = "obstacleFall 3.5s linear forwards";
  document.getElementById("game-container").appendChild(obstacle);

  obstacle.addEventListener("animationend", () => {
    obstacle.remove();
  });

  obstacle.addEventListener("click", function() {
    if (!gameRunning) return;
    playSound("sfx-bad");
    playNuancedSound('sfx-obstacle');
    score = Math.max(0, score - 5);
    feedback.textContent = "Ouch! Obstacle hit. -5 points.";
    feedback.style.color = "#F5402C";
    feedback.style.display = "block";
    updateScoreDisplay();
    setTimeout(() => { feedback.style.display = "none"; }, 1200);
    obstacle.remove();
  });
}

// --- Splash/ripple effect ---
function showSplashEffect(x, y, isBad = false) {
  const splash = document.createElement('div');
  splash.className = 'splash-effect' + (isBad ? ' bad' : '');
  splash.style.left = x + 'px';
  splash.style.top = y + 'px';
  document.getElementById('game-container').appendChild(splash);
  setTimeout(() => splash.remove(), 700); // Remove after animation
}

// --- New confetti function ---
function showConfetti() {
  // Simple confetti effect using emoji
  const confettiContainer = document.createElement("div");
  confettiContainer.style.position = "fixed";
  confettiContainer.style.left = 0;
  confettiContainer.style.top = 0;
  confettiContainer.style.width = "100vw";
  confettiContainer.style.height = "100vh";
  confettiContainer.style.pointerEvents = "none";
  confettiContainer.style.zIndex = 9999;
  document.body.appendChild(confettiContainer);

  for (let i = 0; i < 40; i++) {
    const confetti = document.createElement("span");
    confetti.textContent = ["🎉", "💧", "✨", "🎊"][Math.floor(Math.random()*4)];
    confetti.style.position = "absolute";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.top = "-40px";
    confetti.style.fontSize = (24 + Math.random()*24) + "px";
    confetti.style.transition = `top 1.5s cubic-bezier(.4,2,.6,1), left 1.5s`;
    confettiContainer.appendChild(confetti);
    setTimeout(() => {
      confetti.style.top = (60 + Math.random()*30) + "vh";
      confetti.style.left = (Math.random()*100) + "vw";
    }, 50);
  }
  setTimeout(() => {
    confettiContainer.remove();
  }, 1800);
}

// --- Leaderboard logic ---
function updateLeaderboard(newScore) {
  let highScore = Number(localStorage.getItem('cw-highscore') || '0');
  if (typeof newScore === 'number' && newScore > highScore) {
    highScore = newScore;
    localStorage.setItem('cw-highscore', String(highScore));
  }
  const list = document.getElementById('leaderboard-list');
  list.innerHTML = '';
  if (highScore > 0) {
    const li = document.createElement('li');
    li.textContent = `🏆 High Score: ${highScore} points`;
    list.appendChild(li);
    document.getElementById('leaderboard').style.display = 'block';
  } else {
    document.getElementById('leaderboard').style.display = 'none';
  }
}
// Show leaderboard on load
updateLeaderboard();
// Update leaderboard on game end
const origEndGame = endGame;
endGame = function() {
  origEndGame.apply(this, arguments);
  updateLeaderboard(score);
};

// --- ARIA for screen reader ---
document.getElementById('score').setAttribute('aria-live','polite');
document.getElementById('time').setAttribute('aria-live','polite');
document.getElementById('feedback-message').setAttribute('role','status');

// --- Sparkle/Bubble particle effect for good drops ---
function showSparkleParticles(x, y) {
  const container = document.getElementById('game-container');
  for (let i = 0; i < 7; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle-particle';
    // Randomize angle and distance
    const angle = Math.random() * 2 * Math.PI;
    const distance = 18 + Math.random() * 18;
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;
    sparkle.style.left = (x + offsetX - 8) + 'px';
    sparkle.style.top = (y + offsetY - 8) + 'px';
    container.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 700);
  }
}

// --- Soft Piano Music ---
(function addSoftPianoMusic() {
  const existing = document.getElementById('bg-music');
  if (existing) {
    existing.src = 'soft-piano-100-bpm-121529.mp3';
    existing.load();
  }
})();

// --- Help Button and Accessibility Guide ---
(function addHelpButton() {
  if (!document.getElementById('help-btn')) {
    const btn = document.createElement('button');
    btn.id = 'help-btn';
    btn.className = 'help-btn';
    btn.setAttribute('aria-label', 'Show help and tips');
    btn.innerHTML = '❓';
    document.querySelector('.score-panel').appendChild(btn);
  }
})();

(function addHelpModal() {
  if (!document.getElementById('help-modal')) {
    const modal = document.createElement('div');
    modal.id = 'help-modal';
    modal.className = 'help-modal';
    modal.innerHTML = `
      <div class="help-content">
        <button id="close-help-modal" aria-label="Close help">×</button>
        <h2>How to Play</h2>
        <ul>
          <li>💧 <b>Catch clean water drops</b> by clicking or tapping them before they fall!</li>
          <li>🚫 <b>Avoid red (dirty) drops</b> and obstacles—they subtract points.</li>
          <li>🪣 <b>Bonus:</b> Click the water can for extra points!</li>
          <li>🎵 <b>Toggle music/sound</b> with the speaker and music buttons.</li>
          <li>🏆 <b>Reach the target score</b> before time runs out to win!</li>
          <li>📱 <b>Tip:</b> Works on mobile—just tap the drops!</li>
        </ul>
        <p style="margin-top:10px;font-size:0.98em;color:#2E9DF7;">Good luck, and thank you for playing to support clean water!</p>
      </div>
    `;
    document.body.appendChild(modal);
  }
})();

document.getElementById('help-btn').onclick = function() {
  document.getElementById('help-modal').classList.add('show');
};
document.getElementById('close-help-modal').onclick = function() {
  document.getElementById('help-modal').classList.remove('show');
};
