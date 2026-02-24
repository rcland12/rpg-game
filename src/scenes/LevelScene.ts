import Phaser from 'phaser'
import { LEVELS } from '../levels'

const PLAYER_SPEED = 260
const INVULNERABILITY_MS = 1000

export default class LevelScene extends Phaser.Scene {
  private levelIndex = 0
  private player?: Phaser.Physics.Arcade.Sprite
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private crystals?: Phaser.Physics.Arcade.StaticGroup
  private enemies?: Phaser.Physics.Arcade.Group
  private crystalsRemaining = 0
  private health = 3
  private infoText?: Phaser.GameObjects.Text
  private promptText?: Phaser.GameObjects.Text
  private collectSound?: Phaser.Sound.BaseSound
  private hitSound?: Phaser.Sound.BaseSound
  private ambienceSound?: Phaser.Sound.BaseSound
  private invulnerable = false
  private finishing = false

  init(data: { levelIndex?: number }) {
    this.levelIndex = data.levelIndex ?? 0
    this.health = 3
    this.invulnerable = false
    this.finishing = false
  }

  preload() {
    this.load.audio('collect', 'audio/collect.wav')
    this.load.audio('hit', 'audio/hit.wav')
    this.load.audio('ambience', 'audio/ambience.wav')
  }

  create() {
    const level = LEVELS[this.levelIndex]
    this.cameras.main.setBackgroundColor(level.bgColor)
    this.physics.world.setBounds(0, 0, 960, 640)
    this.sound.stopByKey('ambience')
    this.collectSound = this.sound.add('collect', { volume: 0.65 })
    this.hitSound = this.sound.add('hit', { volume: 0.7 })
    this.ambienceSound = this.sound.add('ambience', { loop: true, volume: 0.45 })
    this.ambienceSound.play()
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.ambienceSound?.stop()
    })

    if (!this.textures.exists('player')) {
      this.buildTextures()
    }

    this.add.text(480, 12, level.name, {
      fontFamily: 'Press Start 2P, monospace',
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5, 0)

    this.add
      .text(480, 52, level.description, {
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '16px',
        color: '#f0f0ff',
        wordWrap: { width: 760 }
      })
      .setOrigin(0.5, 0)

    this.infoText = this.add.text(24, 110, '', {
      fontFamily: 'Press Start 2P, monospace',
      fontSize: '16px',
      color: '#ffffff'
    })

    this.promptText = this.add.text(24, 600, 'Bounce around, absorb the crystals, dodge the color storms.', {
      fontFamily: 'Press Start 2P, monospace',
      fontSize: '14px',
      color: '#ffe',
      wordWrap: { width: 900 }
    })

    this.cursors = this.input.keyboard?.createCursorKeys()

    this.player = this.physics.add
      .sprite(480, 520, 'player')
      .setTint(0xffffff)
      .setDepth(2)
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setCircle(16)
    playerBody.setBounce(0.3)
    playerBody.setMaxVelocity(PLAYER_SPEED)
    this.player.setCollideWorldBounds(true)

    this.crystals = this.physics.add.staticGroup()
    level.crystalPositions.forEach((pos) => {
      const crystal = this.crystals!.create(pos.x, pos.y, 'crystal') as Phaser.GameObjects.Sprite
      crystal.setScale(pos.scale ?? 1)
      crystal.setTint(level.crystalColor)
      crystal.setDepth(1)
    })
    this.crystalsRemaining = level.crystalPositions.length

    this.enemies = this.physics.add.group()
    level.enemyPatterns.forEach((pattern) => this.spawnEnemy(pattern, level.enemyColor))

    this.physics.add.overlap(this.player, this.crystals, this.collectCrystal, undefined, this)
    this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemy, undefined, this)

    this.updateInfoText()
  }

  update(_time: number, delta: number) {
    if (!this.player || this.finishing) return

    this.handlePlayerMovement()
    this.updateEnemies(delta)
  }

  private buildTextures() {
    const graphics = this.add.graphics().setVisible(false)
    graphics.fillStyle(0xffffff, 1)
    graphics.fillRoundedRect(0, 0, 32, 32, 10)
    graphics.generateTexture('player', 32, 32)
    graphics.clear()
    graphics.fillStyle(0xffffff, 1)
    graphics.fillCircle(16, 16, 16)
    graphics.generateTexture('crystal', 32, 32)
    graphics.clear()
    graphics.fillStyle(0xffffff, 1)
    graphics.fillCircle(16, 16, 18)
    graphics.generateTexture('enemy', 36, 36)
    graphics.destroy()
  }

  private handlePlayerMovement() {
    if (!this.player || !this.cursors) return

    const body = this.player.body as Phaser.Physics.Arcade.Body
    const velocity = new Phaser.Math.Vector2()

    if (this.cursors.left?.isDown) velocity.x = -1
    if (this.cursors.right?.isDown) velocity.x = 1
    if (this.cursors.up?.isDown) velocity.y = -1
    if (this.cursors.down?.isDown) velocity.y = 1

    if (velocity.lengthSq() > 0) {
      velocity.normalize().scale(PLAYER_SPEED)
    }

    body.setVelocity(velocity.x, velocity.y)
  }

  private spawnEnemy(pattern: { centerX: number; centerY: number; radius: number; speed: number; size?: number; color?: number }, defaultColor: number) {
    const enemy = this.enemies!.create(pattern.centerX + pattern.radius, pattern.centerY, 'enemy') as Phaser.Physics.Arcade.Sprite
    const color = pattern.color ?? defaultColor
    enemy.setTint(color)
    const size = pattern.size ?? 28
    enemy.setDisplaySize(size, size)
    const body = enemy.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setImmovable(true)
    body.setCircle(size / 2)
    enemy.setData('orbitCenter', new Phaser.Math.Vector2(pattern.centerX, pattern.centerY))
    enemy.setData('orbitRadius', pattern.radius)
    enemy.setData('angle', Phaser.Math.Between(0, 360))
    enemy.setData('angularSpeed', pattern.speed)
    enemy.setDepth(1)
  }

  private updateEnemies(delta: number) {
    this.enemies?.getChildren().forEach((child) => {
      const enemy = child as Phaser.Physics.Arcade.Sprite
      const center = enemy.getData('orbitCenter') as Phaser.Math.Vector2
      const radius = enemy.getData('orbitRadius') as number
      let angle = enemy.getData('angle') as number
      const speed = enemy.getData('angularSpeed') as number
      angle += (speed * delta) / 1000
      const rad = Phaser.Math.DegToRad(angle)
      enemy.setPosition(center.x + Math.cos(rad) * radius, center.y + Math.sin(rad) * radius)
      enemy.setData('angle', angle)
    })
  }

  private collectCrystal: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_playerObj, crystalObject) => {
    const crystal = crystalObject as Phaser.GameObjects.Sprite
    this.collectSound?.play()
    crystal.destroy()
    this.crystalsRemaining -= 1
    this.promptText?.setText('A spark was snatched! Keep going...')
    this.updateInfoText()

    if (this.crystalsRemaining <= 0) {
      this.signalLevelComplete()
    }
  }

  private handlePlayerEnemy: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = () => {
    if (this.invulnerable || this.finishing) return
    this.takeDamage()
  }

  private takeDamage() {
    this.invulnerable = true
    this.health -= 1
    this.hitSound?.play()
    this.promptText?.setText('Brush with the storm! Color energy dropping...')
    this.updateInfoText()
    this.cameras.main.shake(180, 0.01)
    this.player?.setTint(0xff7878)

    this.time.delayedCall(200, () => {
      if (!this.finishing) this.player?.clearTint()
    })

    this.time.delayedCall(INVULNERABILITY_MS, () => {
      this.invulnerable = false
    })

    if (this.health <= 0) {
      this.handlePlayerDown()
    }
  }

  private handlePlayerDown() {
    this.finishing = true
    this.physics.pause()
    this.promptText?.setText('All color drained! Press R to restart the adventure.')
    this.player?.setTint(0xff0000)
    const keyboard = this.input.keyboard
    if (keyboard) {
      keyboard.once('keydown-R', () => {
        this.scene.restart({ levelIndex: 0 })
      })
    }
  }

  private signalLevelComplete() {
    this.finishing = true
    this.promptText?.setText('Crystals aligned! Transferring you to the next realm...')
    if (this.levelIndex < LEVELS.length - 1) {
      this.time.delayedCall(1200, () => {
        this.scene.restart({ levelIndex: this.levelIndex + 1 })
      })
    } else {
      const finale = this.add.text(480, 320, 'Colorverse Restored!', {
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '28px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 10
      })
      finale.setOrigin(0.5)
      this.promptText?.setText('You rescued the Colorverse! Press R to play again.')
      const keyboard = this.input.keyboard
      if (keyboard) {
        keyboard.once('keydown-R', () => {
          this.scene.restart({ levelIndex: 0 })
        })
      }
    }
  }

  private updateInfoText() {
    this.infoText?.setText([
      `Level ${this.levelIndex + 1} / ${LEVELS.length}`,
      `Crystals left: ${this.crystalsRemaining}`,
      `Color energy: ${this.health}/3`
    ].join('    '))
  }
}
