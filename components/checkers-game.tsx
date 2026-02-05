'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CheckersBoard } from './checkers-board'
import { DifficultySelector } from './difficulty-selector'
import { GameStatus } from './game-status'
import { LanguageSelector } from './language-selector'
import {
  createInitialBoard,
  getValidMoves,
  getAllValidMoves,
  makeMove,
  checkWinner,
  getBotMove,
  type Board,
  type Position,
  type Move,
  type PieceType,
} from '@/lib/checkers-logic'
import { translations, type Language, type Translations } from '@/lib/translations'

export function CheckersGame() {
  const [board, setBoard] = useState<Board>(createInitialBoard)
  const [currentPlayer, setCurrentPlayer] = useState<PieceType>('white')
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [validMoves, setValidMoves] = useState<Move[]>([])
  const [winner, setWinner] = useState<PieceType>(null)
  const [difficulty, setDifficulty] = useState(1000)
  const [isThinking, setIsThinking] = useState(false)
  const [animatingMove, setAnimatingMove] = useState<Move | null>(null)
  const [language, setLanguage] = useState<Language>('en')

  const t: Translations = translations[language]

  const resetGame = useCallback(() => {
    setBoard(createInitialBoard())
    setCurrentPlayer('white')
    setSelectedPosition(null)
    setValidMoves([])
    setWinner(null)
    setAnimatingMove(null)
  }, [])

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (winner || currentPlayer !== 'white' || animatingMove) return

      const clickedPiece = board[row][col]

      // If clicking on a valid move target
      if (selectedPosition && validMoves.some((m) => m.to.row === row && m.to.col === col)) {
        const move = validMoves.find((m) => m.to.row === row && m.to.col === col)!

        // Start animation
        setAnimatingMove(move)

        // Delay the actual move to allow animation
        setTimeout(() => {
          const newBoard = makeMove(board, move)
          setBoard(newBoard)
          setSelectedPosition(null)
          setValidMoves([])
          setAnimatingMove(null)

          const gameWinner = checkWinner(newBoard)
          if (gameWinner) {
            setWinner(gameWinner)
          } else {
            setCurrentPlayer('black')
          }
        }, 400)

        return
      }

      // If clicking on own piece
      if (clickedPiece?.type === 'white') {
        const allMoves = getAllValidMoves(board, 'white')
        const pieceMoves = getValidMoves(board, { row, col })

        // Check if this piece has forced captures when captures exist
        const hasCaptures = allMoves.some((m) => m.captured && m.captured.length > 0)
        const pieceHasCaptures = pieceMoves.some((m) => m.captured && m.captured.length > 0)

        if (hasCaptures && !pieceHasCaptures) {
          // Can't select this piece, must capture with another
          return
        }

        setSelectedPosition({ row, col })
        setValidMoves(pieceMoves)
      } else {
        setSelectedPosition(null)
        setValidMoves([])
      }
    },
    [board, currentPlayer, selectedPosition, validMoves, winner, animatingMove]
  )

  // Bot move
  useEffect(() => {
    if (currentPlayer === 'black' && !winner && !animatingMove) {
      setIsThinking(true)

      const thinkingTime = Math.max(500, Math.min(1500, difficulty / 2))

      const timer = setTimeout(() => {
        const botMove = getBotMove(board, difficulty)

        if (botMove) {
          setAnimatingMove(botMove)

          setTimeout(() => {
            const newBoard = makeMove(board, botMove)
            setBoard(newBoard)
            setAnimatingMove(null)
            setIsThinking(false)

            const gameWinner = checkWinner(newBoard)
            if (gameWinner) {
              setWinner(gameWinner)
            } else {
              setCurrentPlayer('white')
            }
          }, 400)
        } else {
          setWinner('white')
          setIsThinking(false)
        }
      }, thinkingTime)

      return () => clearTimeout(timer)
    }
  }, [currentPlayer, board, winner, difficulty, animatingMove])

  return (
    <div className="h-dvh w-full flex flex-col items-center justify-center p-4 gap-4 bg-background">
      {/* Header with language selector */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl flex items-center justify-between"
      >
        <div className="w-10" /> {/* Spacer for centering */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {t.title}
          </h1>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <LanguageSelector language={language} onLanguageChange={setLanguage} />
      </motion.div>

      {/* Main game area */}
      <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
        {/* Board */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <CheckersBoard
            board={board}
            selectedPosition={selectedPosition}
            validMoves={validMoves}
            onCellClick={handleCellClick}
            disabled={currentPlayer !== 'white' || !!winner || !!animatingMove}
            animatingMove={animatingMove}
          />
        </motion.div>

        {/* Side panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-xs space-y-4"
        >
          {/* Game status */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <GameStatus
              currentPlayer={currentPlayer}
              winner={winner}
              board={board}
              isThinking={isThinking}
              translations={t}
            />
          </div>

          {/* Difficulty selector */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <DifficultySelector
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              disabled={currentPlayer !== 'white' && !winner}
              translations={t}
            />
          </div>

          {/* New game button */}
          <Button
            onClick={resetGame}
            variant="outline"
            className="w-full gap-2 bg-transparent"
            size="lg"
          >
            <RotateCcw className="w-4 h-4" />
            {t.newGame}
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xs text-muted-foreground"
      >
        {t.footer}
      </motion.p>
    </div>
  )
}
