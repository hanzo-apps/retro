import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, H1, Paragraph, Text, Button } from '@hanzo/gui'
import { type Column, COLUMNS, INK, MUTE, LINE, PAPER, PANEL, SHADOW } from '../lib/retro'
import { Logo } from './brand'

interface PreviewNote {
  text: string
  votes: number
}

// An illustrative board — the same sticky styling the real board uses, so the
// hero shows the product faithfully (example cards, not live data).
const PREVIEW: Record<Column['key'], PreviewNote[]> = {
  well: [
    { text: 'Pairing unblocked the API work', votes: 5 },
    { text: 'Demo landed on the first try', votes: 3 },
  ],
  improve: [
    { text: 'Standups ran long on Tuesdays', votes: 4 },
    { text: 'Flaky deploy step needs a fix', votes: 2 },
  ],
  action: [
    { text: 'Automate the release checklist', votes: 6 },
    { text: 'Timebox standup to 10 minutes', votes: 3 },
  ],
}

function MiniNote({ note, col }: { note: PreviewNote; col: Column }) {
  return (
    <YStack
      backgroundColor={col.sticky}
      borderRadius={11}
      borderTopWidth={3}
      borderTopColor={col.accent}
      padding={11}
      gap={9}
      shadowColor={SHADOW}
      shadowRadius={8}
      shadowOffset={{ width: 0, height: 4 }}
    >
      <Text fontSize={12.5} lineHeight={17} color={col.ink}>
        {note.text}
      </Text>
      <XStack
        alignSelf="flex-start"
        alignItems="center"
        paddingHorizontal={9}
        paddingVertical={3}
        borderRadius={999}
        backgroundColor="#ffffffcc"
        borderWidth={1}
        borderColor={`${col.accent}55`}
      >
        <Text fontSize={11.5} color={col.ink}>
          ▲ <Text fontSize={11.5} fontWeight="800" color={col.accent}>{note.votes}</Text>
        </Text>
      </XStack>
    </YStack>
  )
}

function MiniColumn({ col }: { col: Column }) {
  const notes = PREVIEW[col.key]
  return (
    <YStack flex={1} minWidth={150} borderRadius={14} backgroundColor={col.tint} overflow="hidden" borderWidth={1} borderColor={`${col.accent}22`}>
      <XStack alignItems="center" gap={7} paddingHorizontal={11} paddingVertical={9} backgroundColor={col.head}>
        <YStack width={9} height={9} borderRadius={999} backgroundColor={col.accent} />
        <Text fontSize={12.5} fontWeight="800" color={col.ink} numberOfLines={1}>
          {col.title}
        </Text>
      </XStack>
      <YStack gap={9} padding={10}>
        {notes.map((n) => (
          <MiniNote key={n.text} note={n} col={col} />
        ))}
      </YStack>
    </YStack>
  )
}

function PreviewBoard() {
  return (
    <YStack
      padding={14}
      borderRadius={20}
      backgroundColor={PANEL}
      borderWidth={1}
      borderColor={LINE}
      shadowColor="#0000001f"
      shadowRadius={30}
      shadowOffset={{ width: 0, height: 18 }}
    >
      <XStack gap={10} alignItems="flex-start">
        {COLUMNS.map((c) => (
          <MiniColumn key={c.key} col={c} />
        ))}
      </XStack>
    </YStack>
  )
}

function Chip({ children }: { children: string }) {
  return (
    <XStack alignItems="center" paddingHorizontal={13} paddingVertical={8} borderRadius={999} borderWidth={1} borderColor={LINE} backgroundColor={PANEL}>
      <Text fontSize={13} fontWeight="600" color={INK}>
        {children}
      </Text>
    </XStack>
  )
}

/**
 * Signed-out landing — the honest public view (the board itself is behind
 * sign-in). One action: PKCE sign-in with Hanzo (hanzo.id); no local credential
 * form. This is also the catalog thumbnail, so it shows the product faithfully.
 */
export function SignedOut() {
  const { login, isLoading } = useIam()

  return (
    <YStack flex={1} minHeight="100vh" alignItems="center" justifyContent="center" padding={28} backgroundColor={PAPER}>
      <XStack maxWidth={1140} width="100%" gap={56} flexWrap="wrap" alignItems="center" justifyContent="center">
        {/* Copy + CTA */}
        <YStack flex={1} minWidth={340} gap={22} paddingVertical={16}>
          <XStack alignItems="center" gap={12}>
            <Logo size={40} />
            <YStack>
              <Text fontSize={20} fontWeight="900" color={INK}>
                Sprint Retro
              </Text>
              <Text fontSize={12} color={MUTE}>
                Team Retrospectives
              </Text>
            </YStack>
          </XStack>

          <H1 fontSize={48} lineHeight={52} fontWeight="900" color={INK}>
            Run retros your team actually acts on.
          </H1>

          <Paragraph fontSize={17} lineHeight={26} color={INK} opacity={0.66} maxWidth={520}>
            Collect what went well, what to improve, and what to change — on a calm
            three-column board of sticky notes. Vote to surface what matters, then
            turn the top ideas into owned actions you can track to done.
          </Paragraph>

          <XStack gap={9} flexWrap="wrap">
            <Chip>Three-column board</Chip>
            <Chip>Vote to focus</Chip>
            <Chip>Action tracker</Chip>
          </XStack>

          <XStack gap={16} alignItems="center" flexWrap="wrap">
            <Button
              size="$5"
              paddingHorizontal={24}
              backgroundColor={INK}
              borderWidth={0}
              hoverStyle={{ backgroundColor: '#4a4954' }}
              pressStyle={{ backgroundColor: '#4a4954' }}
              disabled={isLoading}
              onPress={() => login()}
            >
              <Text fontSize={16} fontWeight="800" color="#ffffff">
                {isLoading ? 'Loading…' : 'Sign in with Hanzo'}
              </Text>
            </Button>
            <Text fontSize={13} color={MUTE}>
              Boards stored per-org in Hanzo Base.
            </Text>
          </XStack>
        </YStack>

        {/* Illustrative preview */}
        <YStack flex={1} minWidth={380} gap={10} paddingVertical={16}>
          <Text fontSize={11} fontWeight="800" color={MUTE} letterSpacing={1.4}>
            SPRINT 24 · PREVIEW
          </Text>
          <PreviewBoard />
        </YStack>
      </XStack>
    </YStack>
  )
}
