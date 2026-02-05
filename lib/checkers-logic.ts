export type PieceType = 'white' | 'black' | null
export type PieceKing = boolean

export interface Piece {
  type: PieceType
  isKing: boolean
}

export interface Position {
  row: number
  col: number
}

export interface Move {
  from: Position
  to: Position
  captured?: Position[]
}

export type Board = (Piece | null)[][]

export const BOARD_SIZE = 8

export function createInitialBoard(): Board {
  const board: Board = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null))

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        if (row < 3) {
          board[row][col] = { type: 'black', isKing: false }
        } else if (row > 4) {
          board[row][col] = { type: 'white', isKing: false }
        }
      }
    }
  }

  return board
}

export function getValidMoves(board: Board, position: Position): Move[] {
  const piece = board[position.row][position.col]
  if (!piece) return []

  const moves: Move[] = []
  const captures: Move[] = []

  const directions: [number, number][] = []
  if (piece.type === 'white' || piece.isKing) {
    directions.push([-1, -1], [-1, 1])
  }
  if (piece.type === 'black' || piece.isKing) {
    directions.push([1, -1], [1, 1])
  }

  // Check regular moves and single captures
  for (const [dRow, dCol] of directions) {
    const newRow = position.row + dRow
    const newCol = position.col + dCol

    if (isValidPosition(newRow, newCol)) {
      if (!board[newRow][newCol]) {
        moves.push({
          from: position,
          to: { row: newRow, col: newCol },
        })
      } else if (board[newRow][newCol]?.type !== piece.type) {
        // Check for capture
        const jumpRow = newRow + dRow
        const jumpCol = newCol + dCol
        if (isValidPosition(jumpRow, jumpCol) && !board[jumpRow][jumpCol]) {
          captures.push({
            from: position,
            to: { row: jumpRow, col: jumpCol },
            captured: [{ row: newRow, col: newCol }],
          })
        }
      }
    }
  }

  // If captures available, return only captures (forced capture rule)
  return captures.length > 0 ? captures : moves
}

export function getAllValidMoves(board: Board, playerType: PieceType): Move[] {
  const moves: Move[] = []
  const captures: Move[] = []

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col]
      if (piece?.type === playerType) {
        const pieceMoves = getValidMoves(board, { row, col })
        for (const move of pieceMoves) {
          if (move.captured && move.captured.length > 0) {
            captures.push(move)
          } else {
            moves.push(move)
          }
        }
      }
    }
  }

  // Forced capture rule
  return captures.length > 0 ? captures : moves
}

export function makeMove(board: Board, move: Move): Board {
  const newBoard = board.map((row) => row.map((cell) => (cell ? { ...cell } : null)))

  const piece = newBoard[move.from.row][move.from.col]
  if (!piece) return newBoard

  // Move piece
  newBoard[move.to.row][move.to.col] = piece
  newBoard[move.from.row][move.from.col] = null

  // Remove captured pieces
  if (move.captured) {
    for (const pos of move.captured) {
      newBoard[pos.row][pos.col] = null
    }
  }

  // Check for king promotion
  if (piece.type === 'white' && move.to.row === 0) {
    newBoard[move.to.row][move.to.col] = { ...piece, isKing: true }
  } else if (piece.type === 'black' && move.to.row === BOARD_SIZE - 1) {
    newBoard[move.to.row][move.to.col] = { ...piece, isKing: true }
  }

  return newBoard
}

export function checkWinner(board: Board): PieceType {
  let whiteCount = 0
  let blackCount = 0

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col]
      if (piece?.type === 'white') whiteCount++
      if (piece?.type === 'black') blackCount++
    }
  }

  if (whiteCount === 0) return 'black'
  if (blackCount === 0) return 'white'

  // Check if current player can move
  const whiteMoves = getAllValidMoves(board, 'white')
  const blackMoves = getAllValidMoves(board, 'black')

  if (whiteMoves.length === 0 && blackMoves.length > 0) return 'black'
  if (blackMoves.length === 0 && whiteMoves.length > 0) return 'white'

  return null
}

function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

// Bot difficulty functions
export function getBotMove(board: Board, difficulty: number): Move | null {
  const moves = getAllValidMoves(board, 'black')
  if (moves.length === 0) return null

  // Difficulty: 0-400 (random), 400-800 (basic), 800-1200 (intermediate), 1200+ (advanced)
  if (difficulty < 400) {
    return getRandomMove(moves)
  } else if (difficulty < 800) {
    return getBasicMove(board, moves)
  } else if (difficulty < 1200) {
    return getIntermediateMove(board, moves)
  } else {
    return getAdvancedMove(board, moves, difficulty)
  }
}

function getRandomMove(moves: Move[]): Move {
  return moves[Math.floor(Math.random() * moves.length)]
}

function getBasicMove(board: Board, moves: Move[]): Move {
  // Prefer captures
  const captures = moves.filter((m) => m.captured && m.captured.length > 0)
  if (captures.length > 0) {
    return captures[Math.floor(Math.random() * captures.length)]
  }

  // Prefer moves that lead to king
  const kingMoves = moves.filter((m) => m.to.row === BOARD_SIZE - 1)
  if (kingMoves.length > 0) {
    return kingMoves[Math.floor(Math.random() * kingMoves.length)]
  }

  return getRandomMove(moves)
}

function getIntermediateMove(board: Board, moves: Move[]): Move {
  // Score each move
  const scoredMoves = moves.map((move) => ({
    move,
    score: evaluateMove(board, move),
  }))

  scoredMoves.sort((a, b) => b.score - a.score)

  // Pick from top 3 moves with some randomness
  const topMoves = scoredMoves.slice(0, Math.min(3, scoredMoves.length))
  return topMoves[Math.floor(Math.random() * topMoves.length)].move
}

function getAdvancedMove(board: Board, moves: Move[], difficulty: number): Move {
  const depth = difficulty >= 1600 ? 4 : 3
  let bestMove = moves[0]
  let bestScore = -Infinity

  for (const move of moves) {
    const newBoard = makeMove(board, move)
    const score = minimax(newBoard, depth - 1, -Infinity, Infinity, false)
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return bestMove
}

function evaluateMove(board: Board, move: Move): number {
  let score = 0

  // Capture bonus
  if (move.captured) {
    score += move.captured.length * 100
  }

  // King promotion bonus
  if (move.to.row === BOARD_SIZE - 1) {
    score += 50
  }

  // Center control bonus
  const centerDistance = Math.abs(move.to.col - 3.5) + Math.abs(move.to.row - 3.5)
  score += (7 - centerDistance) * 5

  // Avoid edges (less mobility)
  if (move.to.col === 0 || move.to.col === 7) {
    score -= 10
  }

  return score
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  const winner = checkWinner(board)
  if (winner === 'black') return 1000
  if (winner === 'white') return -1000
  if (depth === 0) return evaluateBoard(board)

  const currentPlayer: PieceType = isMaximizing ? 'black' : 'white'
  const moves = getAllValidMoves(board, currentPlayer)

  if (moves.length === 0) {
    return isMaximizing ? -1000 : 1000
  }

  if (isMaximizing) {
    let maxEval = -Infinity
    for (const move of moves) {
      const newBoard = makeMove(board, move)
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, false)
      maxEval = Math.max(maxEval, evalScore)
      alpha = Math.max(alpha, evalScore)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of moves) {
      const newBoard = makeMove(board, move)
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, true)
      minEval = Math.min(minEval, evalScore)
      beta = Math.min(beta, evalScore)
      if (beta <= alpha) break
    }
    return minEval
  }
}

function evaluateBoard(board: Board): number {
  let score = 0

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col]
      if (piece) {
        const pieceValue = piece.isKing ? 15 : 10
        const positionBonus = piece.isKing ? 0 : piece.type === 'black' ? row : BOARD_SIZE - 1 - row

        if (piece.type === 'black') {
          score += pieceValue + positionBonus
        } else {
          score -= pieceValue + positionBonus
        }
      }
    }
  }

  return score
}
