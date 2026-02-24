import Phaser from 'phaser'
import { LEVELS } from '../levels'
import type { LevelConfig } from '../levels'

const BASE_PLAYER_SPEED = 260
const INVULNERABILITY_MS = 1000

type ParallaxLayer = {
  image: Phaser.GameObjects.Image
  speed: number
}

export default class LevelScene extends Phaser.Scene {
  private levelIndex = 0
  private currentLevel?: LevelConfig
  private player?: Phaser.Physics.Arcade.Sprite
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private crystals?: Phaser.Physics.Arcade.StaticGroup
  private enemies?: Phaser.Physics.Arcade.Group
  private crystalsRemaining = 0
  private health = 3
  private infoText?: Phaser.GameObjects.Text
  private promptText?: Phaser.GameObjects.Text
  private floor?: Phaser.GameObjects.TileSprite
  private parallaxLayers: ParallaxLayer[] = []
  private playerSpeed = BASE_PLAYER_SPEED
  private collectSound?: Phaser.Sound.BaseSound
  private hitSound?: Phaser.Sound.BaseSound
  private ambienceSound?: Phaser.Sound.BaseSound
  private levelUpSound?: Phaser.Sound.BaseSound
  private invulnerable = false
  private finishing = false

  init(data: { levelIndex?: number }) {
    this.levelIndex = data.levelIndex ?? 0
    this.health = 3
    this.invulnerable = false
    this.finishing = false
  }

  preload() {
    this.load.audio('collect', 'audio/collect.ogg')
    this.load.audio('hit', 'audio/hit.ogg')
    this.load.audio('ambience', 'audio/ambience.ogg')
    this.load.audio('levelup', 'audio/levelup.ogg')
    this.load.image('bg-aurora', 'assets/bg-aurora.jpg')
    this.load.image('bg-galaxy', 'assets/bg-galaxy.jpg')
    this.load.image('bg-city', 'assets/bg-city.jpg')
    this.load.image('fg-ground', 'assets/fg-ground.jpg')
    this.load.image('player', 'assets/player.png')
    this.load.image('enemy', 'assets/enemy.png')
    this.load.image('crystal', 'assets/crystal.png')
  }

  create() {
    const level = LEVELS[this.levelIndex]
    this.currentLevel = level
    this.playerSpeed = Phaser.Math.Clamp(BASE_PLAYER_SPEED + (level.playerSpeedModifier ?? 0), 200, 360)
    this.cameras.main.setBackgroundColor(level.bgColor)
    this.physics.world.setBounds(0, 0, 960, 640)

    this.sound.stopByKey('ambience')
    this.collectSound = this.sound.add('collect', { volume: 0.6 })
    this.hitSound = this.sound.add('hit', { volume: 0.7 })
    this.levelUpSound = this.sound.add('levelup', { volume: 0.6 })
    this.ambienceSound = this.sound.add('ambience', { loop: true, volume: 0.35 })
    this.ambienceSound.play()
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.ambienceSound?.stop()
    })

    this.buildParallax(level)
    this.floor = this.add
      .tileSprite(480, 630, 1100, 140, 'fg-ground')
      .setDepth(0)
      .setAlpha(0.92)

    this.add
      .text(480, 12, level.name, {
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 10
      })
      .setOrigin(0.5, 0)

    this.add.text(24, 52, level.chapter, {
      fontFamily: 'Press Start 2P, monospace',
      fontSize: '14px',
      color: '#ffddff'
    })

    this.add.text(24, 82, level.story, {
      fontFamily: 'Press Start 2P, monospace',
      fontSize: '12px',
      color: '#f4f4ff',
      wordWrap: { width: 900 }
    })

    this.add.text(24, 140, level.description, {
      fontFamily: 'Press Start 2P, monospace',
      fontSize: '12px',
      color: '#b0c4ff',
      wordWrap: { width: 900 }
    })

    this.infoText = this.add.text(24, 200, '', {
      fontFamily: 'Press Start 2P, monospace',
      fontSize: '14px',
      color: '#ffffff'
    })

    this.promptText = this.add.text(24, 560, level.hint, {
      fontFamily: 'Press Start 2P, monospace',
      fontSize: '14px',
      color: '#ffe',
      wordWrap: { width: 900 }
    })

    this.cursors = this.input.keyboard?.createCursorKeys()

    this.player = this.physics.add
      .sprite(480, 520, 'player')
      .setDepth(3)
      .setDisplaySize(120, 120)
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setSize(70, 70, true)
    playerBody.setBounce(0.55)
    playerBody.setMaxVelocity(this.playerSpeed)
    this.player.setCollideWorldBounds(true)

    this.crystals = this.physics.add.staticGroup()
    level.crystalPositions.forEach((pos) => {
      const crystal = this.crystals!.create(pos.x, pos.y, 'crystal') as Phaser.GameObjects.Sprite
      crystal.setScale(pos.scale ?? 0.35)
      crystal.setTint(level.crystalColor)
      crystal.setDepth(2)
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
    this.updateParallax(delta)
    this.updateFloor(delta)
  }

  private buildParallax(level: LevelConfig) {
    this.parallaxLayers.forEach((layer) => layer.image.destroy())
    this.parallaxLayers = []
    const backgroundKeys = level.backgroundKeys.length ? level.backgroundKeys : ['bg-aurora']
    backgroundKeys.forEach((key, index) => {
      const layer = this.add
        .image(480, 260 + index * 10, key)
        .setOrigin(0.5)
        .setDisplaySize(1300, 820 - index * 40)
        .setScrollFactor(0)
        .setDepth(-6 + index)
        .setAlpha(0.85 - index * 0.1)
      this.parallaxLayers.push({ image: layer, speed: 0.02 + index * 0.01 })
    })
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
      velocity.normalize().scale(this.playerSpeed)
    }

    body.setVelocity(velocity.x, velocity.y)
  }

  private spawnEnemy(pattern: { centerX: number; centerY: number; radius: number; speed: number; size?: number; color?: number }, defaultColor: number) {
    const enemy = this.enemies!.create(pattern.centerX + pattern.radius, pattern.centerY, 'enemy') as Phaser.Physics.Arcade.Sprite
    const color = pattern.color ?? defaultColor
    enemy.setTint(color)
    const size = pattern.size ?? 32
    enemy.setDisplaySize(size, size)
    const body = enemy.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setImmovable(true)
    body.setCircle(size / 2)
    enemy.setData('orbitCenter', new Phaser.Math.Vector2(pattern.centerX, pattern.centerY))
    enemy.setData('orbitRadius', pattern.radius)
    enemy.setData('angle', Phaser.Math.Between(0, 360))
    enemy.setData('angularSpeed', pattern.speed)
    enemy.setDepth(2)
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
    const chapter = this.currentLevel?.chapter ?? 'this chapter'
    this.promptText?.setText(`Shard captured for ${chapter}. Keep the pulse flowing.`)
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
    this.promptText?.setText('Storm grazed you. Energy at ' + this.health + '/3.')
    this.updateInfoText()
    this.cameras.main.shake(160, 0.009)
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
    this.promptText?.setText('All color drained! Press R to restart the campaign.')
    this.player?.setTint(0xff0000)
    const keyboard = this.input.keyboard
    if (keyboard) {
      keyboard.once('keydown-R', () => {
        this.scene.restart({ levelIndex: 0 })
      })
    }
  }

  private signalLevelComplete() {
    this.levelUpSound?.play()
    this.finishing = true
    this.promptText?.setText('Crystals aligned! Transporting you to the next story beat…')
    if (this.levelIndex < LEVELS.length - 1) {
      this.time.delayedCall(1200, () => {
        this.scene.restart({ levelIndex: this.levelIndex + 1 })
      })
    } else {
      const finale = this.add.text(480, 320, 'Colorverse Restored!', {
        fontFamily: 'Press Start 2P, monospace',
        fontSize: '32px',
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
      `Energy: ${this.health}/3`
    ].join('    '))
  }

  private updateParallax(delta: number) {
    this.parallaxLayers.forEach((layer) => {
      layer.image.x += layer.speed * delta
      if (layer.image.x > 1220) {
        layer.image.x = -120
      }
    })
  }

  private updateFloor(delta: number) {
    if (!this.floor) return
    this.floor.tilePositionX += delta * 0.05
  }
}
