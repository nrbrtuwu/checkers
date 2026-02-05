'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { PieceType, Board } from '@/lib/checkers-logic'
import type { Translations } from '@/lib/translations'

interface GameStatusProps {
  currentPlayer: PieceType
  winner: PieceType
  board: Board
  isThinking?: boolean
  translations: Translations
}

export function GameStatus({ currentPlayer, winner, board, isThinking, translations: t }: GameStatusProps) {
  const countPieces = (type: PieceType) => {
    let count = 0
    let kings = 0
    for (const row of board) {
      for (const cell of row) {
        if (cell?.type === type) {
          count++
          if (cell.isKing) kings++
        }
      }
    }
    return { total: count, kings }
  }

  const whitePieces = countPieces('white')
  const blackPieces = countPieces('black')

  return (
    <div className="space-y-4">
      {/* Player indicators */}
      <div className="flex items-center justify-between gap-4">
        {/* White player (You) */}
        <div
          className={cn(
            'flex-1 p-3 rounded-xl transition-all duration-300',
            currentPlayer === 'white' && !winner
              ? 'bg-white/20 ring-2 ring-white/60'
              : 'bg-secondary/50'
          )}
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 shadow-md" />
            <span className="text-sm font-bold text-foreground">{t.you}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{whitePieces.total} {t.pieces}</span>
            {whitePieces.kings > 0 && (
              <span className="text-primary">({whitePieces.kings} {t.kings})</span>
            )}
          </div>
        </div>

        {/* VS */}
        <div className="text-muted-foreground text-sm font-bold">{t.vs}</div>

        {/* Black player (Bot) */}
        <div
          className={cn(
            'flex-1 p-3 rounded-xl transition-all duration-300',
            currentPlayer === 'black' && !winner
              ? 'bg-zinc-500/20 ring-2 ring-zinc-400'
              : 'bg-secondary/50'
          )}
        >
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm font-bold text-foreground">{t.bot}</span>
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700 shadow-md" />
          </div>
          <div className="mt-1 flex items-center justify-end gap-2 text-xs text-muted-foreground">
            {blackPieces.kings > 0 && (
              <span className="text-primary">({blackPieces.kings} {t.kings})</span>
            )}
            <span>{blackPieces.total} {t.pieces}</span>
          </div>
        </div>
      </div>

      {/* Status message */}
      <AnimatePresence mode="wait">
        {winner ? (
          <motion.div
            key="winner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'text-center py-3 rounded-xl font-bold text-lg',
              winner === 'white'
                ? 'bg-white/20 text-white'
                : 'bg-zinc-500/20 text-zinc-300'
            )}
          >
            {winner === 'white' ? t.youWin : t.botWins}
          </motion.div>
        ) : isThinking ? (
          <motion.div
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-3 rounded-xl bg-secondary/50"
          >
            <div className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-4 h-4 border-2 border-muted-foreground border-t-primary rounded-full"
              />
              <span className="text-sm text-muted-foreground">{t.botThinking}</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="turn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-3 rounded-xl bg-secondary/50"
          >
            <span className="text-sm text-muted-foreground">
              {currentPlayer === 'white' ? t.yourTurn : t.botTurn}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
