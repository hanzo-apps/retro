import { YStack } from '@hanzo/gui'
import { COLUMNS } from '../lib/retro'

/**
 * The Sprint Retro mark: three pastel sticky notes fanned in the column hues,
 * echoing the board. Purely presentational — sized by `size`. The wordmark
 * lockup is composed inline where the mark is used.
 */
export function Logo({ size = 34 }: { size?: number }) {
  const note = Math.round(size * 0.62)
  const r = Math.max(4, Math.round(size * 0.16))
  // Fan the three notes across the box; position offsets (no rotation
  // dependency) read as a small stack of stickies.
  const spots = [
    { left: 0, top: size - note },
    { left: (size - note) / 2, top: (size - note) / 2 },
    { left: size - note, top: 0 },
  ]
  return (
    <YStack width={size} height={size} position="relative">
      {COLUMNS.map((c, i) => (
        <YStack
          key={c.key}
          position="absolute"
          left={spots[i].left}
          top={spots[i].top}
          zIndex={i + 1}
          width={note}
          height={note}
          borderRadius={r}
          backgroundColor={c.sticky}
          borderTopWidth={2}
          borderTopColor={c.accent}
        />
      ))}
    </YStack>
  )
}
