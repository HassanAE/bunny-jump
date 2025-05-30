import Phaser from '../libs/phaser.js';
import Carrot from '../game/Carrot.js';

export default class Game extends Phaser.Scene {
  /** @type {Phaser.Physics.Arcade.Sprite} */
  player

  /** @type {Phaser.Physics.Arcade.StaticGroup} */
  platforms

  /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
  cursors

  /** @type {Phaser.Physics.Arcade.Group} */
  carrots

  constructor() {
    super('game');
  }

  preload() {
    this.load.image('background', 'assets/bg_layer1.png');
    this.load.image('platform', 'assets/ground_grass.png');
    this.load.image('bunny-stand', 'assets/bunny1_stand.png');
    this.load.image('bunny-jump', 'assets/bunny1_jump.png');
    this.load.image('carrot', 'assets/carrot.png');

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    this.add.image(240, 320, 'background').setScrollFactor(1, 0);

    //this.physics.add.image(240, 320, 'platform').setScale(0.5);
    this.platforms = this.physics.add.staticGroup();
    for (let i = 0; i < 5; i++){
      const x = Phaser.Math.Between(80, 400);
      const y = i * 150;

      const platform = this.platforms.create(x, y, 'platform').setScale(0.5);
      //platform.scale = 0.5;
      platform.body.updateFromGameObject();
    }

    this.player = this.physics.add.sprite(240, 320, 'bunny-stand').setScale(0.5);

    // Activate collision between player and platforms
    this.physics.add.collider(this.platforms, this.player);
    this.player.body.checkCollision.up = false;
    this.player.body.checkCollision.left = false;
    this.player.body.checkCollision.right = false;

    this.carrots = this.physics.add.group({classType: Carrot});
    //this.carrots.get(240, 320, 'carrot');
    //const carrot = new Carrot(this, 240, 320, 'carrot');
    //this.add.existing(carrot);

    this.physics.add.collider(this.platforms, this.carrots);

    this.physics.add.overlap(
      this.player,
      this.carrots,
      this.collectCarrots,
      null,
      this
    );

    this.cameras.main.startFollow(this.player)
    .setDeadzone(this.scale.width * 1.5);
  }

  update() {
    const touchingDown = this.player.body.touching.down;
    if (touchingDown) {
      this.player.setVelocityY(-300);
      //this.player.bounce = -0.2;
    }

    this.platforms.children.iterate(platform => {
      const scrollY = this.cameras.main.scrollY;
      if (platform.y >= scrollY + 700) {
        platform.y = scrollY - 100; //Phaser.Math.Between(50, 100);
        platform.body.updateFromGameObject();

        this.addCarrotAbove(platform);
      }
    });

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200)
    }
    else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    }
    else {
      this.player.setVelocityX(0);
    }

    this.horizontalWrap(this.player);
  }

  /** @param {Phaser.GameObjects.Sprite} sprite */
  horizontalWrap(sprite) {
    const halfWidth = sprite.displayWidth / 2;
    const gameWidth = this.scale.width;

    if (sprite.x < -halfWidth){
      sprite.x = gameWidth + halfWidth;
    }
    else if (sprite.x > gameWidth + halfWidth) {
      sprite.x = -halfWidth;
    }
  }

  /** @param {Phaser.Physics.Arcade.Sprite} sprite */
  addCarrotAbove(sprite) {
    const y = sprite.y - sprite.displayHeight;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    const carrot = this.carrots.get(sprite.x, y, 'carrot');
    carrot.setActive(true);
    carrot.setVisible(true);

    this.add.existing(carrot);
    
    carrot.body.setSize(carrot.width, carrot.hight);
    this.physics.world.enable(carrot);
    return carrot;
  }

  collectCarrots(player, carrot) {
    this.carrots.killAndHide(carrot);
    this.physics.world.disableBody(carrot.body);
  }
}