var gameCanvas;
window.addEventListener('load', (event) => {
  gameCanvas = document.getElementsByTagName('canvas')[0];
});

//Resize game canvas to fit the screen
function resizeCanvasToScreen() {
  var canvasRatio = gameCanvas.height / gameCanvas.width;
  var windowRatio = window.innerHeight / window.innerWidth;
  var width;
  var height;

  if (windowRatio < canvasRatio) {
      height = window.innerHeight;
      width = height / canvasRatio;
  } else {
      width = window.innerWidth;
      height = width * canvasRatio;
  }

  gameCanvas.style.width = width + 'px';
  gameCanvas.style.height = height + 'px';
};

//Turning off for now since all assets need to be resized and not just the canvas
//window.addEventListener('resize', resizeCanvasToScreen, false);


var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 300 },
          debug: false
      }
  },
  scene: {
      preload: preload,
      create: create,
      update: update
  }
};

var game = new Phaser.Game(config);

function preload ()
{
  this.load.setBaseURL('http://labs.phaser.io');
  this.load.image('sky', 'assets/skies/sky4.png');
  this.load.image('ground', 'assets/sprites/platform.png');
  this.load.image('star', 'assets/sprites/star.png');
  //this.load.image('bomb', 'assets/bomb.png');
  this.load.spritesheet('dude', 'assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });
}

var platforms;

function create ()
{
    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');
}

function update ()
{
}