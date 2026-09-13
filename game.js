// // =====================================
// // MINI GAME (WITH LOGIN + LOBBY SYSTEM)
// // =====================================

// const canvas = document.getElementById("gameCanvas");

// if (canvas) {
//   const ctx = canvas.getContext("2d");

//   // =========================
//   // GAME STATE
//   // =========================
//   let gameStarted = false;
//   let gameOver = false;
//   let loopStarted = false;

//   let showLobby = false; // NEW
//   let isLoggedIn = false; // FIXED

//   let score = 0;
//   let lives = 3;

//   let playerName = "";

//   let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
//   let players = JSON.parse(localStorage.getItem("players")) || {};

//   // =========================
//   // OBJECTS
//   // =========================
//   let player, enemy, coin;

//   function resetGameObjects() {
//     player = { x: 50, y: 50, size: 20, speed: 4 };
//     enemy = { x: 300, y: 200, size: 25, speed: 2 };
//     coin = { x: 500, y: 250, size: 20 };
//   }

//   resetGameObjects();

//   // =========================
//   // INPUT
//   // =========================
//   let keys = {};

//   document.addEventListener("keydown", (e) => {
//     keys[e.key.toLowerCase()] = true;
//   });

//   document.addEventListener("keyup", (e) => {
//     keys[e.key.toLowerCase()] = false;
//   });

//   // =========================
//   // UPDATE
//   // =========================
//   function update() {
//     if (!gameStarted || gameOver) return;

//     if (keys["w"]) player.y -= player.speed;
//     if (keys["s"]) player.y += player.speed;
//     if (keys["a"]) player.x -= player.speed;
//     if (keys["d"]) player.x += player.speed;

//     player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
//     player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

//     // enemy follows player
//     if (enemy.x < player.x) enemy.x += enemy.speed;
//     if (enemy.x > player.x) enemy.x -= enemy.speed;
//     if (enemy.y < player.y) enemy.y += enemy.speed;
//     if (enemy.y > player.y) enemy.y -= enemy.speed;

//     // enemy collision
//     if (
//       player.x < enemy.x + enemy.size &&
//       player.x + player.size > enemy.x &&
//       player.y < enemy.y + enemy.size &&
//       player.y + player.size > enemy.y
//     ) {
//       lives--;

//       enemy.x = Math.random() * (canvas.width - enemy.size);
//       enemy.y = Math.random() * (canvas.height - enemy.size);

//       if (lives <= 0) endGame();
//     }

//     // coin collision
//     if (
//       player.x < coin.x + coin.size &&
//       player.x + player.size > coin.x &&
//       player.y < coin.y + coin.size &&
//       player.y + player.size > coin.y
//     ) {
//       score++;

//       coin.x = Math.random() * (canvas.width - coin.size);
//       coin.y = Math.random() * (canvas.height - coin.size);
//     }
//   }

//   // =========================
//   // DRAW
//   // =========================
//   function draw() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // =========================
//     // LOBBY SCREEN (BEFORE GAME)
//     // =========================
//     if (showLobby && !gameStarted) {
//       ctx.fillStyle = "rgba(0,0,0,0.85)";
//       ctx.fillRect(0, 0, canvas.width, canvas.height);

//       ctx.fillStyle = "white";
//       ctx.font = "30px Arial";
//       ctx.textAlign = "center";

//       ctx.fillText(
//         "Welcome " + playerName,
//         canvas.width / 2,
//         canvas.height / 2 - 40,
//       );
//       ctx.fillText("Press PLAY to Start", canvas.width / 2, canvas.height / 2);

//       ctx.textAlign = "left";
//       return;
//     }

//     // =========================
//     // GAME OBJECTS
//     // =========================

//     // player (BALL)
//     ctx.fillStyle = "#00e5ff";
//     ctx.beginPath();
//     ctx.arc(
//       player.x + player.size / 2,
//       player.y + player.size / 2,
//       player.size / 2,
//       0,
//       Math.PI * 2,
//     );
//     ctx.fill();

//     // enemy
//     ctx.fillStyle = "red";
//     ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);

//     // coin
//     ctx.fillStyle = "lime";
//     ctx.fillRect(coin.x, coin.y, coin.size, coin.size);

//     // HUD
//     ctx.fillStyle = "white";
//     ctx.font = "18px Arial";
//     ctx.fillText("Player: " + playerName, 10, 20);
//     ctx.fillText("Score: " + score, 10, 45);
//     ctx.fillText("Lives: " + lives, 10, 70);

//     // GAME OVER
//     if (gameOver) {
//       ctx.fillStyle = "rgba(0,0,0,0.75)";
//       ctx.fillRect(0, 0, canvas.width, canvas.height);

//       ctx.textAlign = "center";

//       ctx.fillStyle = "red";
//       ctx.font = "40px Arial";
//       ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);

//       ctx.fillStyle = "white";
//       ctx.font = "20px Arial";
//       ctx.fillText("Click to Retry", canvas.width / 2, canvas.height / 2 + 30);

//       ctx.textAlign = "left";
//     }
//   }

//   // =========================
//   // GAME LOOP
//   // =========================
//   function gameLoop() {
//     update();
//     draw();
//     requestAnimationFrame(gameLoop);
//   }

//   // =========================
//   // END GAME
//   // =========================
//   function endGame() {
//     gameOver = true;

//     leaderboard.push({ name: playerName, score });

//     leaderboard.sort((a, b) => b.score - a.score);
//     leaderboard = leaderboard.slice(0, 10);

//     localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

//     updateLeaderboard();
//   }

//   // =========================
//   // LEADERBOARD
//   // =========================
//   function updateLeaderboard() {
//     const list = document.getElementById("scoreList");
//     if (!list) return;

//     list.innerHTML = "";

//     leaderboard.forEach((p) => {
//       const li = document.createElement("li");
//       li.textContent = `${p.name} - ${p.score}`;
//       list.appendChild(li);
//     });
//   }

//   updateLeaderboard();

//   // =========================
//   // LOGIN BUTTON
//   // =========================
//   document.getElementById("playBtn").addEventListener("click", () => {
//     const name = document.getElementById("playerName").value.trim();
//     const code = document.getElementById("playerCode").value.trim();

//     if (!name || !code) {
//       alert("Enter name and passcode!");
//       return;
//     }

//     playerName = name;

//     if (!players[name]) {
//       players[name] = { code };
//       localStorage.setItem("players", JSON.stringify(players));

//       document.getElementById("welcomeText").innerText =
//         "Account created! Welcome " + name;
//     } else {
//       if (players[name].code !== code) {
//         document.getElementById("welcomeText").innerText = "Wrong passcode!";
//         return;
//       }

//       document.getElementById("welcomeText").innerText =
//         "Welcome back, " + name + "!";
//     }

//     isLoggedIn = true;
//     showLobby = true;
//     gameStarted = false;
//     gameOver = false;
//   });

//   // =========================
//   // PLAY BUTTON (START GAME)
//   // =========================
//   document.getElementById("startGameBtn").addEventListener("click", () => {
//     const nameInput = document.getElementById("playerName").value.trim();
//     const codeInput = document.getElementById("playerCode").value.trim();

//     // ❗ BLOCK PLAY IF NOT LOGGED IN
//     if (
//       !nameInput ||
//       !codeInput ||
//       !players[nameInput] ||
//       players[nameInput].code !== codeInput
//     ) {
//       document.getElementById("welcomeText").innerText = "Login to play";

//       return;
//     }

//     // ✅ SUCCESS → START GAME
//     playerName = nameInput;
//     gameStarted = true;
//     gameOver = false;
//     showLobby = false;

//     if (!loopStarted) {
//       loopStarted = true;
//       gameLoop();
//     }
//   });

//   // =========================
//   // RESTART
//   // =========================
//   canvas.addEventListener("click", () => {
//     if (!gameOver) return;

//     score = 0;
//     lives = 3;
//     gameOver = false;

//     resetGameObjects();
//   });
// }
