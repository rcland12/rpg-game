export interface LevelConfig {
  name: string
  chapter: string
  story: string
  description: string
  hint: string
  backgroundKeys: string[]
  bgColor: number
  crystalColor: number
  enemyColor: number
  playerSpeedModifier?: number
  crystalPositions: { x: number; y: number; scale?: number }[]
  enemyPatterns: {
    centerX: number
    centerY: number
    radius: number
    speed: number // degrees per second
    size?: number
    color?: number
  }[]
}

export const LEVELS: LevelConfig[] = [
  {
    name: 'Signal Drift',
    chapter: 'Chapter I · Signal Drift',
    story:
      'The helix pulse whispers that a relay shard still glows in the fringe. Recover the first crystals and anchor the story of the expedition.',
    description:
      'A spacious ridge with floating dust motes. The orbits are wide and friendly so you can learn the dance of gravity.',
    hint: 'Track the slow loops and collect every shard before the wind lines reel them away.',
    backgroundKeys: ['bg-aurora', 'bg-galaxy'],
    bgColor: 0x0b1d2e,
    crystalColor: 0xa6e0ff,
    enemyColor: 0xff9a6b,
    playerSpeedModifier: 0,
    crystalPositions: [
      { x: 220, y: 140 },
      { x: 520, y: 170 },
      { x: 720, y: 210 },
      { x: 360, y: 340 },
      { x: 620, y: 420 },
      { x: 180, y: 520 }
    ],
    enemyPatterns: [
      { centerX: 320, centerY: 250, radius: 120, speed: 60, size: 34 },
      { centerX: 620, centerY: 360, radius: 140, speed: 70, size: 30 }
    ]
  },
  {
    name: 'Glass Ravine',
    chapter: 'Chapter II · Glass Ravine',
    story:
      'Fragments of the beacon fell through a crystalline gorge. Each shard sings when it is near another, creating a fragile melody.',
    description:
      'The ravine glitters with refracted light. Orbital hazards crank up their speed and a second ring of veils sweeps the floor.',
    hint: 'Avoid the double-orbiting storm at the center—timing is tighter but the route is still linear.',
    backgroundKeys: ['bg-galaxy', 'bg-city'],
    bgColor: 0x19200f,
    crystalColor: 0xfff08d,
    enemyColor: 0x72c8ff,
    playerSpeedModifier: -20,
    crystalPositions: [
      { x: 160, y: 180 },
      { x: 420, y: 200 },
      { x: 640, y: 260 },
      { x: 480, y: 340 },
      { x: 280, y: 440 },
      { x: 820, y: 520 },
      { x: 600, y: 500 }
    ],
    enemyPatterns: [
      { centerX: 480, centerY: 320, radius: 190, speed: 110, size: 32 },
      { centerX: 320, centerY: 520, radius: 100, speed: 150, size: 26 },
      { centerX: 720, centerY: 380, radius: 120, speed: 130, size: 28 }
    ]
  },
  {
    name: 'Pulse Towers',
    chapter: 'Chapter III · Pulse Towers',
    story:
      'Up high, towers pulse with siphoned color energy. They feed a vortex that will swallow the relay unless you raid the cores first.',
    description:
      'Gathering crystals unlocks tower shields. The enemies orbit in tighter spirals and start tilting their paths downwards.',
    hint: 'Shorten your jumps and hug edges—the towers flicker when the orbits tighten.',
    backgroundKeys: ['bg-aurora', 'bg-city'],
    bgColor: 0x1a0f1f,
    crystalColor: 0xff7df4,
    enemyColor: 0xffd166,
    playerSpeedModifier: 10,
    crystalPositions: [
      { x: 200, y: 220 },
      { x: 360, y: 360 },
      { x: 520, y: 220 },
      { x: 660, y: 420 },
      { x: 820, y: 180 },
      { x: 520, y: 500 },
      { x: 260, y: 520 }
    ],
    enemyPatterns: [
      { centerX: 480, centerY: 320, radius: 230, speed: 130, size: 34 },
      { centerX: 480, centerY: 180, radius: 80, speed: 220, size: 26 },
      { centerX: 820, centerY: 480, radius: 120, speed: 140, size: 30 },
      { centerX: 200, centerY: 460, radius: 90, speed: 160, size: 24 }
    ]
  },
  {
    name: 'Storm Spire',
    chapter: 'Chapter IV · Storm Spire',
    story:
      'The storm rises along a crystalline spire. Every layer now hums with tension, and the next relay wants to be guarded by fury.',
    description:
      'Narrow terraces make dodging harder. Enemies drop in faster rings and lightning arcs appear between their paths.',
    hint: 'You can hug the walls when the arcs pulse—tight bursts beat the longer runs.',
    backgroundKeys: ['bg-galaxy', 'bg-aurora'],
    bgColor: 0x1b1f2f,
    crystalColor: 0xfd6fc4,
    enemyColor: 0x53ffae,
    playerSpeedModifier: -30,
    crystalPositions: [
      { x: 120, y: 220 },
      { x: 280, y: 300 },
      { x: 460, y: 200 },
      { x: 620, y: 360 },
      { x: 780, y: 260 },
      { x: 550, y: 520 },
      { x: 340, y: 520 }
    ],
    enemyPatterns: [
      { centerX: 480, centerY: 320, radius: 160, speed: 180, size: 36 },
      { centerX: 580, centerY: 420, radius: 110, speed: 210, size: 26 },
      { centerX: 360, centerY: 420, radius: 100, speed: 220, size: 26 },
      { centerX: 820, centerY: 220, radius: 150, speed: 170, size: 28 }
    ]
  },
  {
    name: 'Mirror Vault',
    chapter: 'Chapter V · Mirror Vault',
    story:
      'Hallways reflect the storm—crystals appear to double, but only the real ones keep the melody steady.',
    description:
      'Mirror shards warp the corridors. Your reflexes are taxed with mirrored enemies that mimic your path in anti-phase.',
    hint: 'Focus on the real crystals—the mirrors dim and bring new orbits. Keep moving and never stay directly opposite an enemy for long.',
    backgroundKeys: ['bg-city', 'bg-galaxy'],
    bgColor: 0x0d0b1c,
    crystalColor: 0xe8ff86,
    enemyColor: 0xff5c00,
    playerSpeedModifier: 20,
    crystalPositions: [
      { x: 180, y: 240 },
      { x: 380, y: 260 },
      { x: 540, y: 210 },
      { x: 720, y: 340 },
      { x: 860, y: 220 },
      { x: 460, y: 480 },
      { x: 700, y: 520 },
      { x: 280, y: 520 }
    ],
    enemyPatterns: [
      { centerX: 480, centerY: 320, radius: 200, speed: 170, size: 34 },
      { centerX: 260, centerY: 320, radius: 110, speed: 230, size: 26 },
      { centerX: 720, centerY: 420, radius: 140, speed: 210, size: 28 },
      { centerX: 520, centerY: 180, radius: 90, speed: 250, size: 24 }
    ]
  },
  {
    name: 'Core Echelon',
    chapter: 'Chapter VI · Core Echelon',
    story:
      'The final relay floats between dimensions. Only one precise run will align the shards and awaken the Colorverse.',
    description:
      'The arena compresses to the core. Enemy orbits now include reverse spirals and the crystals blink before stabilizing.',
    hint: 'Stay near the center when the requests double—time your bursts between spin reversals.',
    backgroundKeys: ['bg-aurora', 'bg-galaxy', 'bg-city'],
    bgColor: 0x05030c,
    crystalColor: 0x7df9ff,
    enemyColor: 0xff3399,
    playerSpeedModifier: -40,
    crystalPositions: [
      { x: 240, y: 240 },
      { x: 360, y: 200 },
      { x: 520, y: 220 },
      { x: 640, y: 240 },
      { x: 720, y: 340 },
      { x: 520, y: 500 },
      { x: 260, y: 520 },
      { x: 840, y: 460 }
    ],
    enemyPatterns: [
      { centerX: 480, centerY: 320, radius: 240, speed: 140, size: 36 },
      { centerX: 480, centerY: 180, radius: 90, speed: 280, size: 26 },
      { centerX: 360, centerY: 380, radius: 130, speed: 220, size: 28, color: 0xffdf5f },
      { centerX: 600, centerY: 420, radius: 100, speed: 260, size: 24 }
    ]
  }
]
