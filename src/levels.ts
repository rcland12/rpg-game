export interface LevelConfig {
  name: string
  description: string
  bgColor: number
  crystalColor: number
  enemyColor: number
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
    name: 'Prism Grove',
    description: 'Hop between glowing mushrooms and gather the sun-kissed sparks.',
    bgColor: 0x0e1b4f,
    crystalColor: 0xffc94d,
    enemyColor: 0xff4cc8,
    crystalPositions: [
      { x: 220, y: 140 },
      { x: 640, y: 110 },
      { x: 480, y: 320 },
      { x: 260, y: 420 },
      { x: 720, y: 400 }
    ],
    enemyPatterns: [
      { centerX: 480, centerY: 220, radius: 120, speed: 80 },
      { centerX: 640, centerY: 480, radius: 140, speed: 60 }
    ]
  },
  {
    name: 'Sunburst Cliffs',
    description: 'Dash along the canyon ledges while the gulls scramble for color.',
    bgColor: 0xff8c00,
    crystalColor: 0xffe08a,
    enemyColor: 0x4c1eff,
    crystalPositions: [
      { x: 160, y: 180 },
      { x: 520, y: 200 },
      { x: 720, y: 260 },
      { x: 420, y: 420 },
      { x: 180, y: 520 },
      { x: 820, y: 520 }
    ],
    enemyPatterns: [
      { centerX: 480, centerY: 320, radius: 190, speed: 70 },
      { centerX: 260, centerY: 520, radius: 100, speed: 110, size: 32 },
      { centerX: 720, centerY: 380, radius: 140, speed: 90, size: 24 }
    ]
  },
  {
    name: 'Nebula Core',
    description: 'Float through the color storm and restore the core crystal.',
    bgColor: 0x080116,
    crystalColor: 0x7df9ff,
    enemyColor: 0xff3399,
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
      { centerX: 480, centerY: 320, radius: 230, speed: 65 },
      { centerX: 480, centerY: 180, radius: 80, speed: 200, size: 28 },
      { centerX: 820, centerY: 480, radius: 120, speed: 80, size: 26 }
    ]
  }
]
