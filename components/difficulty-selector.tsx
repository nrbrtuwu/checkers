'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Translations } from '@/lib/translations'

interface DifficultySelectorProps {
  difficulty: number
  onDifficultyChange: (difficulty: number) => void
  disabled?: boolean
  translations: Translations
}

type DifficultyKey = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert'

const difficulties: { key: DifficultyKey; elo: number; color: string }[] = [
  { key: 'beginner', elo: 200, color: 'text-emerald-400' },
  { key: 'easy', elo: 600, color: 'text-sky-400' },
  { key: 'medium', elo: 1000, color: 'text-amber-400' },
  { key: 'hard', elo: 1400, color: 'text-orange-400' },
  { key: 'expert', elo: 1800, color: 'text-red-400' },
]

export function DifficultySelector({
  difficulty,
  onDifficultyChange,
  disabled,
  translations: t,
}: DifficultySelectorProps) {
  const currentDifficulty = difficulties.reduce((prev, curr) =>
    Math.abs(curr.elo - difficulty) < Math.abs(prev.elo - difficulty) ? curr : prev
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{t.botDifficulty}</span>
        <span className={cn('text-sm font-bold', currentDifficulty.color)}>
          {t.difficulties[currentDifficulty.key]} ({difficulty} ELO)
        </span>
      </div>

      <div className="flex gap-1.5">
        {difficulties.map((diff) => (
          <button
            key={diff.key}
            onClick={() => onDifficultyChange(diff.elo)}
            disabled={disabled}
            className={cn(
              'flex-1 relative py-2 px-1 rounded-lg transition-all text-xs font-medium',
              difficulty === diff.elo
                ? 'bg-secondary text-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {difficulty === diff.elo && (
              <motion.div
                layoutId="difficulty-indicator"
                className="absolute inset-0 bg-secondary rounded-lg -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className={cn(difficulty === diff.elo && diff.color)}>
              {t.difficulties[diff.key]}
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {t.difficultyDescriptions[currentDifficulty.key]}
      </p>
    </div>
  )
}
