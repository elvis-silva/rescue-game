function start() {

  $("#initial-menu").hide();

  $("#background-game").append("<div id='player' class='player-animation'></div>");
  $("#background-game").append("<div id='enemy1' class='enemy1-animation'></div>");
  $("#background-game").append("<div id='enemy2'></div>");
  $("#background-game").append("<div id='friend' class='friend-animation'></div>");
  $("#background-game").append("<div id='score'></div>");
  $("#energy-container").append("<div id='energy'></div>");

  let game = {};
  let score = 0;
  let energy = 3;
  let friendsSave = 0;
  let friendsDeath = 0;
  let gameOver = false;
  let shotEnable = true;
  let playerTop, enemy1PositionX, enemy2PositionX, friendPositionX, shotPosX, shotSpeed;
  let speed = 5;
  let enemy1PositionY = parseInt(Math.random() * 334 + 10);

  let KEY = {
    W: 87, 
    S: 83,
    D: 68
  };

  let BG_IMAGE = [
    "img/energy0.png", 
    "img/energy1.png", 
    "img/energy2.png", 
    "img/energy3.png",
  ];
    
  $("#energy").css("background-image", "url(" + BG_IMAGE[energy] + ")");

  game.press = [];

  let backgroundSound = document.getElementById("background-sound");
  let explosionSound = document.getElementById("explosion-sound");
  let gameoverSound = document.getElementById("gameover-sound");
  let lostSound =  document.getElementById("lost-sound");
  let rescueSound = document.getElementById("rescue-sound")
  let shotSound = document.getElementById("shot-sound");

  backgroundSound.addEventListener("ended", () => {
    backgroundSound.currentTime = 0;
    backgroundSound.play();
  }, false);
  backgroundSound.play();

  $(document).keydown((e) => {
    game.press[e.which] = true;
  });

  $(document).keyup((e) => {
    game.press[e.which] = false;
  });

  game.timer = setInterval(gamePlay, 30);

  function gamePlay() {
    bgMove();
    playerMove();
    friendMove();
    enemy1Move();
    enemy2Move();
    watchCollision();
    watchEnergy();
    updateScore();
  }

  function bgMove() {
    left = parseInt($("#background-game").css("background-position"));
    $("#background-game").css("background-position", left - 1);
  }

  function playerMove() {
    if(game.press[KEY.W]) {
      playerTop = parseInt($("#player").css("top"));
      $("#player").css("top", playerTop - 10);
      if(playerTop <= 10) {
        $("#player").css("top", playerTop + 10);
      }
    }
    
    if(game.press[KEY.S]) {
      playerTop = parseInt($("#player").css("top"));
      $("#player").css("top", playerTop + 10);
      if(playerTop >= 434) {
        $("#player").css("top", playerTop - 10);
      }
    }

    if(game.press[KEY.D]) {
      shot();
    }
  }

  function enemy1Move() {
    enemy1PositionX = parseInt($("#enemy1").css("left"));
    $("#enemy1").css("left", enemy1PositionX - speed);
    $("#enemy1").css("top", enemy1PositionY);

    if(enemy1PositionX <= 0) {
      enemy1PositionY = parseInt(Math.random() * 334);
      $("#enemy1").css("left", 694);
      $("#enemy1").css("top", enemy1PositionY);
    }
  }

  function enemy2Move() {
    enemy2PositionX = parseInt($("#enemy2").css("left"));
    $("#enemy2").css("left", enemy2PositionX - speed - 2);

    if(enemy2PositionX <= 0) {
      $("#enemy2").css("left", 775);
    }
  }

  function friendMove() {
    friendPositionX = parseInt($("#friend").css("left"));
    $("#friend").css("left", friendPositionX + 1);

    if(friendPositionX > 906) {
      $("#friend").css("left", 0);
    }
  }

  function shot() {
    if(shotEnable) {
      shotSound.play();
      shotEnable = false;

      playerTop = parseInt($("#player").css("top"));
      let playerPosX = parseInt($("#player").css("left"));
      shotPosX = playerPosX + 190;
      let shotTop = playerTop + 37;
      $("#background-game").append("<div id='shot'></div>");
      $("#shot").css("top", shotTop);
      $("#shot").css("left", shotPosX);

      shotSpeed = window.setInterval(shoot, 30);
    }

    function shoot() {
      shotPosX = parseInt($("#shot").css("left"));
      $("#shot").css("left", shotPosX + 15);

      if(shotPosX > 900) {
        window.clearInterval(shotSpeed);
        shotSpeed = null;
        $("#shot").remove();
        shotEnable = true;
      }
    }
  }

  function watchCollision() {
    let collision1 = ($("#player").collision($("#enemy1")));

    if(collision1.length > 0) {
      explosionSound.play();
      energy--;
      $("#energy").css("background-image", "url(" + BG_IMAGE[energy] + ")");
      enemy1PositionX = parseInt($("#enemy1").css("left"));
      enemy1PositionY = parseInt($("#enemy1").css("top"));
      explosion(enemy1PositionX, enemy1PositionY);

      restoreEnemy1();
    }

    let collision2 = ($("#player").collision($("#enemy2")));

    if (collision2.length > 0) {	
      explosionSound.play();
      energy--;
      $("#energy").css("background-image", "url(" + BG_IMAGE[energy] + ")");
      enemy2PositionX = parseInt($("#enemy2").css("left"));
      enemy2PositionY = parseInt($("#enemy2").css("top"));
      explosion2(enemy2PositionX, enemy2PositionY);
          
      $("#enemy2").remove();
        
      restoreEnemy2();
    }	

    var collision3 = ($("#shot").collision($("#enemy1")));
  
    if (collision3.length > 0) {	
      explosionSound.play();
      score += 100;
      speed += 0.3;
      enemy1PositionX = parseInt($("#enemy1").css("left"));
      enemy1PositionY = parseInt($("#enemy1").css("top"));      
      explosion(enemy1PositionX, enemy1PositionY);
      
      $("#shot").css("left", 950);     
  
      restoreEnemy1();
    }
  
    var collision4 = ($("#shot").collision($("#enemy2")));

    if(collision4.length > 0) {
      explosionSound.play();
      score += 50;

      enemy2PositionX = parseInt($("#enemy2").css("left"));
      enemy2PositionY = parseInt($("#enemy2").css("top"));
      $("#enemy2").remove();

      explosion2(enemy2PositionX, enemy2PositionY);
      $("#shot").css("left",950);
      
      restoreEnemy2();
    }

    var collision5 = ($("#player").collision($("#friend")));

    if(collision5.length > 0) {
      rescueSound.play();
      friendsSave++;
      restoreFriend();
      $("#friend").remove();
    }

    var collision6 = ($("#enemy2").collision($("#friend")));

    if (collision6.length > 0) {
      lostSound.play();
      friendPositionX = parseInt($("#friend").css("left"));
      friendPositionY = parseInt($("#friend").css("top"));
      friendDeath(friendPositionX, friendPositionY);
      $("#friend").remove();
          
      restoreFriend();      
    }
  }

  function explosion(posX, posY) {
    $("#background-game").append("<div id='explosion'></div>");
    $("#explosion").css("background-image", "url(img/explosion.png)");
    let div = $("#explosion");
    div.css("top", posY);
    div.css("left", posX);
    div.animate({ width: 200, opacity: 0}, "slow");

    let explosionSpeed = window.setInterval(() => {
      div.remove();
      window.clearInterval(explosionSpeed);
      explosionSpeed = null;
    }, 1000);
  }

  function explosion2(posX, posY) {	
    $("#background-game").append("<div id='explosion2'></div");
    $("#explosion2").css("background-image", "url(img/explosion.png)");
    let div2=$("#explosion2");
    div2.css("top", posY);
    div2.css("left", posX);
    div2.animate({ width: 200, opacity: 0 }, "slow");
    
    let explosionSpeed = window.setInterval(() => {
      div2.remove();
      window.clearInterval(explosionSpeed);
      explosionSpeed = null;
    }, 1000);     
  }

  function friendDeath(posX, posY) {
    friendsDeath++;

    $("#background-game").append("<div id='friend-death' class='death-animation'></div>");
    $("#friend-death").css("top", posY);
    $("#friend-death").css("left", posX);

    let deathTime = window.setInterval(() => {
      $("#friend-death").remove();
      window.clearInterval(deathTime);
      deathTime = null;
    }, 1000);
  }

  function restoreEnemy1() {
    enemy1PositionY = parseInt(Math.random() * 334);
    $("#enemy1").css("left", 694);
    $("#enemy1").css("top", enemy1PositionY); 
  }

  function restoreEnemy2() {
    let collisionTime = window.setInterval(() => {
      window.clearInterval(collisionTime);
      collisionTime = null;
      if(gameOver == false) {
        $("#background-game").append("<div id='enemy2'></div>");
      }
    }, 5000);
  }

  function restoreFriend() {
    let friendTime = window.setInterval(() => {
      window.clearInterval(friendTime);
      friendTime = null;

      if(gameOver == false) {
        $("#background-game").append("<div id='friend' class='friend-animation'></div>");
      }
    }, 6000);
  }

  function updateScore() {
    $("#score").html(`<h2> Pontos: ${score} Salvos: ${friendsSave} Perdidos: ${friendsDeath}</h2>`);
  }

  function watchEnergy() {
    if(energy == 0) {
      showGameOver();
    }
  }

  function showGameOver() {
    gameOver = true;
    backgroundSound.pause();
    gameoverSound.play();

    window.clearInterval(game.timer);
    game.timer = null;

    $("#player").remove();
    $("#enemy1").remove();
    $("#enemy2").remove();
    $("#friend").remove();

    $("#background-game").append("<div id='game-over-menu'></div>");

    $("#game-over-menu").html("<h1> Game Over </h1><p>Pontos: " + score + "</p>" + "<button id='restart' onClick=restartGame()><h3>Jogar Novamente</h3></button>")
  }
}

function restartGame() {
  document.getElementById("gameover-sound").pause();
  $("#game-over-menu").remove();
  start();
}