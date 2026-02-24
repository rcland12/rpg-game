import Phaser from 'phaser'
import LevelScene from './scenes/LevelScene'
import './style.css'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 960,
  height: 640,
  parent: 'app',
  backgroundColor: '#05030b',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: LevelScene
}

new Phaser.Game(config)
