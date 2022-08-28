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

window.addEventListener('resize', resizeCanvasToScreen, false);


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

var player;
var stars;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);

function preload ()
{
  this.load.setBaseURL('http://labs.phaser.io');
  this.load.image('sky', 'assets/skies/sky4.png');
  this.load.image('ground', 'assets/sprites/platform.png');
  this.load.image('star', 'assets/sprites/orb-red.png');
  this.load.image('bomb', 'assets/sprites/skull.png');
  this.load.spritesheet('dude', 'assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create ()
{
  this.add.image(400, 300, 'sky');

  platforms = this.physics.add.staticGroup();

  platforms.create(400, 568, 'ground').setScale(2).refreshBody();

  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');

  player = this.physics.add.sprite(100, 450, 'dude');

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
  });

  this.anims.create({
      key: 'turn',
      frames: [ { key: 'dude', frame: 4 } ],
      frameRate: 20
  });

  this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
  });

  cursors = this.input.keyboard.createCursorKeys();

  stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
  });

  stars.children.iterate(function (child) {

      child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.3));

  });

  bombs = this.physics.add.group();

  scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);

  this.physics.add.overlap(player, stars, collectStar, null, this);

  this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update ()
{
  if (gameOver)
  {
    return;
  }
  
  if (cursors.left.isDown)
  {
    player.setVelocityX(-160);

    player.anims.play('left', true);
  }
  else if (cursors.right.isDown)
  {
    player.setVelocityX(160);

    player.anims.play('right', true);
  }
  else
  {
    player.setVelocityX(0);

    player.anims.play('turn');
  }

  if ((cursors.up.isDown || musicConductor.chordsPlaying.length  > 0) && player.body.touching.down)
  {
    player.setVelocityY(-330);
  }
}

function collectStar (player, star)
{
  star.disableBody(true, true);
  score += 10;
  scoreText.setText('Score: ' + score);

  if (stars.countActive(true) === 0)
  {
    //  A new batch of stars to collect
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });
    var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    var bomb = bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = false;
  }
}

function hitBomb (player, bomb)
{
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play('turn');

  gameOver = true;
}



/** 
 * @description listens to midi-chlorian controller event which are events based on 
 * midi notes currently playing.
 * - moves player left or right if the player went up or down the register. 
 * @listens MidiInstrumentationEvents.MIDICHLORIANCTRLEVENT - published from
 *  midiChlorianController.js' MidiInstrumentationEvents.NOTEBEINGPLAYED event listener.
 * @param e.value - stringified midiChlorianCtrlr 
 * @returns void
 */
 document.addEventListener(MidiInstrumentationEvents.MIDICHLORIANCTRLEVENT, function(e) {
  const oneMidiChlorianCtrlrEvent = JSON.parse(e.value);
  var midiNoteNumber = Number(oneMidiChlorianCtrlrEvent.midiInputPlaying.note);
  //Play Piano Sounds when playing on computer keyboardw
  if(oneMidiChlorianCtrlrEvent.midiInputPlaying.eventType == 'KEYBOARD') {
      try {
          document.getElementById(oneMidiChlorianCtrlrEvent.midiInputPlaying.noteName).play();
      } catch (e) {
          console.error(e.name + ': '+e.message);
      }
  }
  try {
      if(oneMidiChlorianCtrlrEvent.midiInputPlaying.command == 144) {
          if(oneMidiChlorianCtrlrEvent.countIncreased) {
            player.setVelocityX(500);
            player.anims.play('right', true);
          } else if ( oneMidiChlorianCtrlrEvent.countDecreased ) {
            player.setVelocityX(-500);
            player.anims.play('left', true);
          } else {
            player.setVelocityX(0);
            player.anims.play('turn');
          }
      }
  } catch(e) {
      console.error(e.name + ': '+e.message + "; stack: "+e.stack);
  }
  // setTimeout(
  //     function() {
  //       if(musicConductor.chordsPlaying.length  == 0) {
  //         player.setVelocityX(0);
  //         player.anims.play('turn');
  //       }
  //     }, 
  //     //hardcoding beat duration for .25 second for now... assuming 4 4 time
  //     //TODO idea: use beat duration instead to cause affect on object to persist while note was held down
  //     250
  // );
});

//Stop piano sound being played when no longer playing using computer keyboard
document.addEventListener(MidiInstrumentationEvents.NOTELASTPLAYED, function(e){
  const oneNoteLastPlayed = JSON.parse(e.value);
  var midiNoteNumber = Number(oneNoteLastPlayed.note);
  if(oneNoteLastPlayed.eventType == 'KEYBOARD') {
      try {
          document.getElementById(oneNoteLastPlayed.noteName).pause();
      } catch (e) {
          console.error(e.name + ': '+e.message);
      }
  }
});