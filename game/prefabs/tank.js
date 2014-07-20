'use strict';

var Bullet = require('../prefabs/bullet');
var Crosshair = require('../prefabs/crosshair');
var firing = false;

var Tank = function(game, x, y, frame) {
  // The super call to Phaser.Sprite
  Phaser.Sprite.call(this, game, x, y, 'tank', frame);
  // set the sprite's anchor to the center
  this.anchor.setTo(0.5, 0.5);

  // add and play animations
  // this.animations.add('flap');
  // this.animations.play('flap', 12, true);

  // enable physics
  this.game.physics.p2.enableBody(this);

  //  And some controls to play the game with
  this.moveRight = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
  this.moveLeft = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);

  // MAX SPEED
  this.maxSpeed = 300;
  this.decelerationSpeed = 5000;
  this.accelerationSpeed = 20000;

  // Create the crosshair
  this.crosshair = new Crosshair(this.game, this.game.width/2, this.game.height/2);
  this.game.add.existing(this.crosshair);

  // cannon
  this.cannon = new Phaser.Sprite(this.game, 25, -20, 'cannon');
  this.cannon.anchor.setTo(0, 0.5);
  this.addChild(this.cannon);
  this.cannonAngleMax = 98;
  this.cannonAngleMin = 350;
  this.tankFireSound = this.game.add.audio('tankPewPew');
};

Tank.prototype = Object.create(Phaser.Sprite.prototype);
Tank.prototype.constructor = Tank;

Tank.prototype.update = function() {
  // move the tank
  if (this.moveRight.isDown) {
    this.move(Phaser.Keyboard.RIGHT);
  }
  else if(this.moveLeft.isDown) {
    this.move(Phaser.Keyboard.LEFT);
  }
  else {
    if (this.body.velocity.x > 0) {
      this.body.velocity.x -= this.decelerationSpeed * (this.game.time.elapsed / 1000);
      this.body.velocity.x = Phaser.Math.clamp(this.body.velocity.x, 0, this.maxSpeed);
    } else if(this.body.velocity.x < 0) {
      this.body.velocity.x += this.decelerationSpeed * (this.game.time.elapsed / 1000);
      this.body.velocity.x = Phaser.Math.clamp(this.body.velocity.x, -this.maxSpeed, 0);
    }
  }

  // Update the cannon
  var angle = this.getAngleFromVector();
  if(angle < 180)
    angle = Phaser.Math.clamp(angle, 0, this.cannonAngleMax);
  else
    angle = Phaser.Math.clamp(angle, this.cannonAngleMin, 360);
  this.cannon.angle = -angle;
  //this.cannon.angle = Phaser.Math.clamp(this.cannon.angle, this.cannonAngleMin, this.cannonAngleMax);
  
  // Update the crosshair
  if (firing)
    this.crosshair.body.angularVelocity += 8 * (this.game.time.elapsed / 1000);
};

Tank.prototype.move = function(moveKey) {
  if (moveKey == Phaser.Keyboard.RIGHT && this.body.velocity.x < this.maxSpeed) {
    this.body.velocity.x += this.accelerationSpeed * (this.game.time.elapsed / 1000);
  } else if(moveKey == Phaser.Keyboard.LEFT && this.body.velocity.x > -this.maxSpeed) {
    this.body.velocity.x -= this.accelerationSpeed * (this.game.time.elapsed / 1000);
  }
};

Tank.prototype.beforeFire = function() {
  firing = true;
}

Tank.prototype.fire = function() {
  console.log(this.cannon.angle * -1, this.getVectorCannon().x, this.getVectorCannon().y);
  var bulletVelocity = this.getVectorCannon();
  var bullet = new Bullet(this.game, this.cannon.world.x + bulletVelocity.x * this.cannon.width, this.cannon.world.y + bulletVelocity.y * this.cannon.width * -1);
  this.game.add.existing(bullet);
  bulletVelocity.setMagnitude(1000);
  bullet.fire(bulletVelocity.x, -bulletVelocity.y);
  this.tankFireSound.play();
  this.crosshair.body.angularVelocity = 2;
  firing = false;
};

Tank.prototype.getVectorFromCursor = function() {
  var x = this.crosshair.world.x - this.world.x;
  var y = -(this.crosshair.world.y - this.world.y);
  var posDiff = new Phaser.Point(x, y);
  return Phaser.Point.normalize(posDiff);
}

Tank.prototype.getVectorCannon = function() {
  var x = Math.cos(Phaser.Math.degToRad(this.cannon.angle)) * this.cannon.width;
  var y = Math.sin(Phaser.Math.degToRad(this.cannon.angle)) * this.cannon.width * -1;
  return Phaser.Point.normalize(new Phaser.Point(x, y));
}

Tank.prototype.getAngleFromVector = function() {
  var vec = this.getVectorFromCursor();
  var angle = Phaser.Math.radToDeg(Math.atan(vec.y/vec.x));
  if(vec.x < 0 && vec.y > 0)
    angle = 180 + angle;
  else if(vec.x < 0 && vec.y < 0)
    angle = angle + 180;
  else if(vec.x > 0 && vec.y < 0)
    angle = 360 + angle;
  return angle;
}

module.exports = Tank;
