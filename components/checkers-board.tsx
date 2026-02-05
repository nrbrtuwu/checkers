'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Board, Position, Move } from '@/lib/checkers-logic'

interface CheckersBoardProps {
  board: Board
  selectedPosition: Position | null
  validMoves: Move[]
  onCellClick: (row: number, col: number) => void
  disabled?: boolean
  animatingMove?: Move | null
}

const COLUMNS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const ROWS = ['8', '7', '6', '5', '4', '3', '2', '1']

export function CheckersBoard({
  board,
  selectedPosition,
  validMoves,
  onCellClick,
  disabled,
  animatingMove,
}: CheckersBoardProps) {
  const isValidMoveTarget = (row: number, col: number) => {
    return validMoves.some((move) => move.to.row === row && move.to.col === col)
  }

  const isSelected = (row: number, col: number) => {
    return selectedPosition?.row === row && selectedPosition?.col === col
  }

  const getCapturedInAnimation = (row: number, col: number) => {
    if (!animatingMove?.captured) return false
    return animatingMove.captured.some((pos) => pos.row === row && pos.col === col)
  }

  const getPositionLabel = (row: number, col: number) => {
    return `${COLUMNS[col]}${ROWS[row]}`
  }

  return (
    <div className="relative">
      {/* Board shadow */}
      <div className="absolute inset-0 bg-black/50 blur-2xl scale-95 -z-10 rounded-2xl" />

      {/* Board container with labels */}
      <div className="flex flex-col">
        {/* Column labels (top) */}
        <div className="flex ml-6">
          {COLUMNS.map((col) => (
            <div
              key={col}
              className="w-[clamp(2.5rem,8vmin,4.5rem)] text-center text-xs text-muted-foreground font-medium"
            >
              {col}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Row labels (left) */}
          <div className="flex flex-col justify-around pr-1.5">
            {ROWS.map((row) => (
              <div
                key={row}
                className="h-[clamp(2.5rem,8vmin,4.5rem)] flex items-center justify-center text-xs text-muted-foreground font-medium w-4"
              >
                {row}
              </div>
            ))}
          </div>

          {/* Board */}
          <div className="grid grid-cols-8 gap-0 rounded-xl overflow-hidden border-4 border-[hsl(var(--board-dark))] shadow-2xl">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isDarkSquare = (rowIndex + colIndex) % 2 === 1
                const isValidTarget = isValidMoveTarget(rowIndex, colIndex)
                const cellSelected = isSelected(rowIndex, colIndex)
                const isCaptured = getCapturedInAnimation(rowIndex, colIndex)
                const posLabel = getPositionLabel(rowIndex, colIndex)

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => !disabled && onCellClick(rowIndex, colIndex)}
                    disabled={disabled}
                    className={cn(
                      'aspect-square w-[clamp(2.5rem,8vmin,4.5rem)] relative transition-all duration-200 flex items-center justify-center',
                      isDarkSquare ? 'bg-[hsl(var(--board-dark))]' : 'bg-[hsl(var(--board-light))]',
                      isValidTarget && 'cursor-pointer',
                      cellSelected && 'ring-2 ring-primary ring-inset',
                      disabled && 'cursor-not-allowed'
                    )}
                    aria-label={`Cell ${posLabel}`}
                  >
                    {/* Valid move indicator */}
                    {isValidTarget && !cell && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-1/3 h-1/3 rounded-full bg-primary/50 animate-pulse" />
                      </motion.div>
                    )}

                    {/* Piece */}
                    <AnimatePresence mode="popLayout">
                      {cell && !isCaptured && (
                        <motion.div
                          key={`piece-${rowIndex}-${colIndex}-${cell.type}`}
                          layoutId={
                            animatingMove &&
                            animatingMove.from.row === rowIndex &&
                            animatingMove.from.col === colIndex
                              ? undefined
                              : `piece-${rowIndex}-${colIndex}`
                          }
                          initial={
                            animatingMove &&
                            animatingMove.to.row === rowIndex &&
                            animatingMove.to.col === colIndex
                              ? {
                                  x: (animatingMove.from.col - colIndex) * 100 + '%',
                                  y: (animatingMove.from.row - rowIndex) * 100 + '%',
                                }
                              : { scale: 1 }
                          }
                          animate={{
                            x: 0,
                            y: 0,
                            scale: cellSelected ? 1.1 : 1,
                          }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 25,
                            duration: 0.4,
                          }}
                          className={cn(
                            'w-[75%] h-[75%] rounded-full shadow-lg flex items-center justify-center',
                            cell.type === 'white'
                              ? 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-400'
                              : 'bg-gradient-to-br from-zinc-600 via-zinc-700 to-zinc-900',
                            cellSelected && 'ring-2 ring-primary'
                          )}
                          style={{
                            boxShadow:
                              cell.type === 'white'
                                ? 'inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.4)'
                                : 'inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.4)',
                          }}
                        >
                          {/* King crown */}
                          {cell.isKing && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                              className={cn(
                                'drop-shadow-md',
                                cell.type === 'white' ? 'text-amber-600' : 'text-primary'
                              )}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-4 h-4 sm:w-6 sm:h-6"
                              >
                                <path d="M12 1L9 9L1 7L4 15L2 23H22L20 15L23 7L15 9L12 1Z" />
                              </svg>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Capture animation */}
                    {isCaptured && (
                      <motion.div
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          'w-[75%] h-[75%] rounded-full',
                          cell?.type === 'white'
                            ? 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-400'
                            : 'bg-gradient-to-br from-zinc-600 via-zinc-700 to-zinc-900'
                        )}
                      />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
