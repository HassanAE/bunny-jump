import Phaser from './libs/phaser.js';

import Game from './scenes/Game.js';

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: 480,
  height: 640,
  scene: Game,
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
      gravity: {
        y: 200
      }
    },
  },
});