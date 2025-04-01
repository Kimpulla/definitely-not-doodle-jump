// Canvas aka board variables
let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

// Character's variables
let jumperWidth = 46;
let jumperHeight = 46;
let jumperX = boardWidth / 2 - jumperWidth / 2;
let jumperY = (boardHeight * 7) / 8 - jumperHeight;
let jumperRightImg;
let jumperLeftImg;
let jumper = {
  img: null,
  x: jumperX,
  y: jumperY,
  width: jumperWidth,
  height: jumperHeight,
};
// Movement variables
let velocityX = 0;
let velocityY = 0; // jumpoer jump speed
let initialVelocityY = -3; //starting velocity Y
let gravity = 0.065;

// Platform variables
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

// Score variables
let score = 0;
let maxScore = 0;
let gameOver = false;

// When loads --> do this
window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  // Load images
  jumperRightImg = new Image();
  jumperRightImg.src = "./avatarRight.png";
  jumper.img = jumperRightImg;
  jumperRightImg.onload = function () {
    context.drawImage(
      jumper.img,
      jumper.x,
      jumper.y,
      jumper.width,
      jumper.height
    );
  };

  jumperLeftImg = new Image();
  jumperLeftImg.src = "./avatarLeft.png";

  platformImg = new Image();
  platformImg.src = "./platform.png";

  velocityY = initialVelocityY;

  placePlatforms();
  requestAnimationFrame(update);
  document.addEventListener("keydown", moveJumper);
};

// Load high score from local storage
let highScore = localStorage.getItem("highScore") || 0;

// Load and play background music
let bgMusic = new Audio("./music.mp3");
let gameOverSound = new Audio("./gameOver.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.1;
bgMusic.play();

let musicOn = false;

// Create sound toggle button
document.addEventListener("DOMContentLoaded", () => {
  let soundButton = document.createElement("button");
  soundButton.innerText = "Sound: OFF";
  soundButton.style.position = "absolute";
  soundButton.style.top = "10px";
  soundButton.style.right = "10px";
  soundButton.style.padding = "5px 10px";
  soundButton.style.background = "lightgray";
  soundButton.style.border = "none";
  soundButton.style.cursor = "pointer";
  document.body.appendChild(soundButton);

  soundButton.addEventListener("click", () => {
    musicOn = !musicOn;
    if (musicOn) {
      bgMusic.play();
      soundButton.innerText = "Sound: ON";
    } else {
      bgMusic.pause();
      soundButton.innerText = "Sound: OFF";
    }
  });
});

function update() {
  requestAnimationFrame(update);

  if (gameOver) {
    return;
  }
  context.clearRect(0, 0, board.width, board.height);

  jumper.x += velocityX;
  if (jumper.x > boardWidth) {
    jumper.x = 0;
  } else if (jumper.x + jumper.width < 0) {
    jumper.x = boardWidth;
  }

  velocityY += gravity;
  jumper.y += velocityY;
  if (jumper.y > board.height) {
    gameOver = true;
    saveHighScore();
  }
  context.drawImage(
    jumper.img,
    jumper.x,
    jumper.y,
    jumper.width,
    jumper.height
  );

  // Here we place platforms

  for (let i = 0; i < platformArray.length; i++) {
    let platform = platformArray[i];

    if (velocityY < 0 && jumper.y < (boardHeight * 3) / 4) {
      platform.y -= initialVelocityY; // Slide platform down
    }

    if (detectCollision(jumper, platform) && velocityY >= 0) {
      velocityY = initialVelocityY; // JUUUMP
    }
    context.drawImage(
      platform.img,
      platform.x,
      platform.y,
      platform.width,
      platform.height
    );
  }

  // clear platforms, add new paltforms.
  while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
    platformArray.shift(); // Shift removes first element from the array
    newPlatForm();
  }

  // Small edits to score
  updateScore();
  context.fillStyle = "#FFFFFF";
  context.font = "16px sans-serif";
  context.fillText(score, 5, 20);
  context.fillText("High score: " + highScore, 5, 40);

  if (gameOver) {
    context.fillText(
      "Game Over: Press 'Space' to Restart",
      boardWidth / 7,
      (boardHeight * 7) / 8
    );
    gameOverSound.play();
  }
}

function saveHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
}

function moveJumper(e) {
  if (e.code == "ArrowRight" || e.code == "KeyD") {
    velocityX = 1;
    jumper.img = jumperRightImg;
  } else if (e.code == "ArrowLeft" || e.code == "KeyA") {
    velocityX = -1;
    jumper.img = jumperLeftImg;
  } else if (e.code == "Space" && gameOver) {
    jumper = {
      img: jumperRightImg,
      x: jumperX,
      y: jumperY,
      width: jumperWidth,
      height: jumperHeight,
    };

    velocityX = 0;
    velocityY = initialVelocityY;
    score = 0;
    maxScore = 0;
    gameOver = false;
    musicOn = false;
    placePlatforms();
  }
}

function placePlatforms() {
  platformArray = [];

  // Starting platforms
  let platform = {
    img: platformImg,
    x: boardWidth / 2,
    y: boardHeight - 50,
    width: platformWidth,
    height: platformHeight,
  };

  platformArray.push(platform);

  for (let i = 0; i < 10; i++) {
    let randomX = Math.floor((Math.random() * boardWidth * 3) / 4);
    let platform = {
      img: platformImg,
      x: randomX,
      y: boardHeight - 75 * i - 150,
      width: platformWidth,
      height: platformHeight,
    };

    platformArray.push(platform);
  }
}

function newPlatForm() {
  let randomX = Math.floor((Math.random() * boardWidth * 3) / 4);
  let platform = {
    img: platformImg,
    x: randomX,
    y: -platformHeight,
    width: platformWidth,
    height: platformHeight,
  };

  platformArray.push(platform);
}

// Here we detect collision
function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function updateScore() {
  let points = Math.floor(50 * Math.random());
  if (velocityY < 0) {
    maxScore += points;
    if (score < maxScore) {
      score = maxScore;
    }
  } else if (velocityY >= 0) {
    maxScore -= points;
  }
}
