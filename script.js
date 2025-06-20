// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let timerInterval; // Timer for countdown
let score = 0; // Player's score
let timeLeft = 30; // 30-second timer
const feedback = document.getElementById("feedback-message");

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

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  // Only start if not already ended (feedback message is not visible)
  if (feedback.style.display === "block") return;

  gameRunning = true;
  score = 0;
  timeLeft = 30;
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeLeft;
  feedback.style.display = "none";
  feedback.textContent = "";

  // Start drop and obstacle creation only when game starts
  dropMaker = setInterval(() => {
    createDrop();
    if (Math.random() < 0.35) createObstacle();
  }, 1000);
  // Start the timer countdown
  timerInterval = setInterval(updateTimer, 1000);
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
  // Remove all drops and obstacles from the game container
  const container = document.getElementById("game-container");
  container.innerHTML = "";
  // Show feedback message
  let messageArr = score >= 20 ? winMessages : loseMessages;
  let msg = messageArr[Math.floor(Math.random() * messageArr.length)];
  feedback.textContent = msg + ` (Final Score: ${score})`;
  feedback.style.display = "block";
  updateScoreDisplay();
  if (score >= 20) {
    showConfetti();
    feedback.style.transition = "opacity 0.5s";
    feedback.style.opacity = 1;
  } else {
    // Keep lose message visible until reset as well
    feedback.style.transition = "opacity 0.5s";
    feedback.style.opacity = 1;
  }
}

function resetGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  score = 0;
  timeLeft = 30;
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("game-container").innerHTML = "";
  feedback.style.display = "none";
  feedback.textContent = "";
  feedback.style.opacity = 1;
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

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");

  // Randomly decide if this is a good drop or a bad drop (dirty water)
  const isBadDrop = Math.random() < 0.25; // 25% chance for a bad drop
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
    drop.remove(); // Clean up drops that weren't caught
  });

  // Add click event to handle good/bad drop
  drop.addEventListener("click", function() {
    if (!gameRunning) return;
    if (isBadDrop) {
      // Bad drop: subtract 2 points (min 0) and show penalty feedback
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
    } else {
      // Good drop: add 1 point and show positive feedback
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
    }
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
    score = Math.max(0, score - 5);
    feedback.textContent = "Ouch! Obstacle hit. -5 points.";
    feedback.style.color = "#F5402C";
    feedback.style.display = "block";
    updateScoreDisplay();
    setTimeout(() => { feedback.style.display = "none"; }, 1200);
    obstacle.remove();
  });
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
