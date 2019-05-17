const canvas = document.getElementById('tetris')
const context = canvas.getContext('2d')

context.scale(20, 20)

const arenaSweep = () => {
  let rowCount = 1
  outer: for (let y = arena.length - 1; y > 0; y--) {
    for (let x = 0; x < arena[y].length; x++) {
      if (arena[y][x] === 0) {
        continue outer
      }
    }

    const row = arena.splice(y, 1)[0].fill(0)
    arena.unshift(row)
    y++

    player.score += rowCount * 10
    rowCount *= 2
  }
}

const collide = (arena, player) => {
  const f = player.figure
  const o = player.pos
  for (let y = 0; y < f.length; y++) {
    for (let x = 0; x < f[y].length; x++) {
      if (f[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true
      }
    }
  }
  return false
}

const controls = event => {
  switch (event.key) {
    case 'ArrowLeft':
      moveFigure(-1)
      break
    case 'ArrowRight':
      moveFigure(1)
      break
    case 'ArrowUp':
      playerRotate()
      break
    case 'ArrowDown':
      dropFigure()
      break
    case ' ':
      restartGame()
      break

    default:
      break
  }
}

const createFigure = type => {
  switch (type) {
    case 'I':
      return [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]]
    case 'L':
      return [[0, 2, 0], [0, 2, 0], [0, 2, 2]]
    case 'J':
      return [[0, 3, 0], [0, 3, 0], [3, 3, 0]]
    case 'O':
      return [[4, 4], [4, 4]]
    case 'Z':
      return [[5, 5, 0], [0, 5, 5], [0, 0, 0]]
    case 'S':
      return [[0, 6, 6], [6, 6, 0], [0, 0, 0]]
    case 'T':
      return [[0, 7, 0], [7, 7, 7], [0, 0, 0]]

    default:
      break
  }
}

const createMatrix = (w, h) => {
  const matrix = []
  while (h--) {
    matrix.push(new Array(w).fill(0))
  }
  return matrix
}

const draw = () => {
  context.fillStyle = '#000'
  context.fillRect(0, 0, canvas.width, canvas.height)

  drawFigure(arena, { x: 0, y: 0 })
  drawFigure(player.figure, player.pos)
}

const drawFigure = (figure, offset) => {
  figure.forEach((row, y) => {
    row.forEach((point, x) => {
      if (point !== 0) {
        context.fillStyle = colors[point]
        context.fillRect(x + offset.x, y + offset.y, 1, 1)
        context.strokeStyle = '#fff'
        context.lineWidth = 0.1
        context.strokeRect(x + offset.x, y + offset.y, 1, 1)
      }
    })
  })
}

const dropFigure = () => {
  player.pos.y++
  if (collide(arena, player)) {
    player.pos.y--
    merge(arena, player)
    playerReset()
    arenaSweep()
    updateScore()
  }
  dropCounter = 0
}

const merge = (arena, player) => {
  player.figure.forEach((row, y) => {
    row.forEach((point, x) => {
      if (point !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = point
      }
    })
  })
}

const moveFigure = direction => {
  player.pos.x += direction
  if (collide(arena, player)) {
    player.pos.x -= direction
  }
}

const playerReset = () => {
  const figures = 'TJLOSZI'
  player.figure = createFigure(figures[(figures.length * Math.random()) | 0])
  player.pos.y = 0
  player.pos.x =
    ((arena[0].length / 2) | 0) - ((player.figure[0].length / 2) | 0)
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0))
    context.fillStyle = 'white'
    context.font = '2px serif'
    context.textAlign = 'center'
    context.fillText('Game Over', 6, 10)
    context.strokeStyle = 'red'
    context.lineWidth = 0.05
    context.font = '2px serif'
    context.strokeText('Game Over', 6, 10)
    context.fillStyle = 'white'
    context.font = '1px serif'
    context.textAlign = 'center'
    context.fillText('press space to restart', 6, 12)
    gameOver = true
    cancelAnimationFrame(game)
  }
}

const playerRotate = () => {
  const pos = player.pos.x
  let offset = 1
  rotateFigure(player.figure, 1)
  while (collide(arena, player)) {
    player.pos.x += offset
    offset = -(offset + (offset > 0 ? 1 : -1))
    if (offset > player.figure[0].length) {
      rotateFigure(player.figure, -1)
      player.pos.x = pos
      return
    }
  }
}

const restartGame = () => {
  if (gameOver) {
    gameOver = false
    player.pos.y = 0
    player.pos.x =
      ((arena[0].length / 2) | 0) - ((player.figure[0].length / 2) | 0)
    player.score = 0
    updateScore()
    game = requestAnimationFrame(update)
  }
}

const rotateFigure = (figure, direction) => {
  for (let y = 0; y < figure.length; y++) {
    for (let x = 0; x < y; x++) {
      ;[figure[y][x], figure[x][y]] = [figure[x][y], figure[y][x]]
    }
  }

  direction > 0 ? figure.forEach(row => row.reverse()) : figure.reverse()
}

const updateScore = () => {
  element = document.getElementById('score')
  element.innerHTML = player.score
}

let game
let gameOver = false

let dropCounter = 0
let dropInterval = 1000

let lastTime = 0

const update = (time = 0) => {
  const deltaTime = time - lastTime

  dropCounter += deltaTime
  if (dropCounter > dropInterval) {
    dropFigure()
  }

  lastTime = time

  draw()
  game = requestAnimationFrame(update)
}

const arena = createMatrix(12, 20)

const colors = [
  null,
  '#f44336',
  '#9C27B0',
  '#2196F3',
  '#4CAF50',
  '#FFEB3B',
  '#FF9800',
  '#E91E63',
]

const player = {
  pos: { x: 0, y: 0 },
  figure: null,
  score: 0,
}

document.addEventListener('keydown', controls)

playerReset()
draw()
update()
