import { useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { useQuery, useMutation } from '@hanzo/base/react'
import { YStack, XStack, ScrollView, Input, Button, Text, Paragraph, Spinner } from '@hanzo/gui'
import { type Retro, type Card, type Action, INK, MUTE, LINE, PAPER, PANEL, votesIn, progressIn } from '../lib/retro'
import { Logo } from './brand'
import { Board } from './board'
import { Actions } from './actions'

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Button
      size="$3"
      paddingHorizontal={16}
      borderRadius={999}
      borderWidth={0}
      backgroundColor={active ? INK : 'transparent'}
      hoverStyle={{ backgroundColor: active ? INK : '#00000008' }}
      pressStyle={{ backgroundColor: active ? INK : '#00000010' }}
      onPress={onPress}
    >
      <Text fontSize={14} fontWeight="700" color={active ? '#ffffff' : MUTE}>
        {label}
      </Text>
    </Button>
  )
}

/** A sprint chip in the switcher rail. */
function SprintPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Button
      size="$3"
      paddingHorizontal={15}
      borderRadius={999}
      backgroundColor={active ? '#e6e9fb' : PANEL}
      borderWidth={1}
      borderColor={active ? '#5b6ce0' : LINE}
      hoverStyle={{ borderColor: '#5b6ce0' }}
      pressStyle={{ borderColor: '#5b6ce0' }}
      onPress={onPress}
    >
      <Text fontSize={13.5} fontWeight={active ? '800' : '600'} color={active ? '#3a44a6' : INK}>
        {label}
      </Text>
    </Button>
  )
}

/** Inline "new sprint" composer, shared by the header rail and the empty state. */
function NewSprint({
  placeholder,
  onCreate,
  busy,
}: {
  placeholder: string
  onCreate: (sprint: string) => void
  busy: boolean
}) {
  const [sprint, setSprint] = useState('')
  const submit = () => {
    const s = sprint.trim()
    if (!s || busy) return
    onCreate(s)
    setSprint('')
  }
  return (
    <XStack gap={8}>
      <Input
        size="$3"
        minWidth={190}
        backgroundColor={PANEL}
        value={sprint}
        placeholder={placeholder}
        onChangeText={setSprint}
        onSubmitEditing={submit}
      />
      <Button
        size="$3"
        paddingHorizontal={16}
        backgroundColor="#5b6ce0"
        borderWidth={0}
        hoverStyle={{ backgroundColor: '#3a44a6' }}
        pressStyle={{ backgroundColor: '#3a44a6' }}
        disabled={busy || !sprint.trim()}
        onPress={submit}
      >
        <Text fontSize={14} fontWeight="800" color="#ffffff">
          Start
        </Text>
      </Button>
    </XStack>
  )
}

/**
 * Signed-in shell: the brand bar, a sprint switcher, and the Board / Actions
 * tabs for the current retro. Retros, cards, and actions are three org-scoped
 * Base collections; every mutation refetches so the board and tracker stay live.
 */
export function Home() {
  const { user, logout } = useIam()
  const who = user?.displayName || user?.name || user?.email || 'you'

  const retrosQ = useQuery<Retro>('retros', { sort: '-created', realtime: false })
  const cardsQ = useQuery<Card>('cards', { sort: '-created', realtime: false })
  const actionsQ = useQuery<Action>('actions', { sort: '-created', realtime: false })

  const addRetro = useMutation('retros', 'create')

  const [selId, setSelId] = useState<string | null>(null)
  const [tab, setTab] = useState<'board' | 'actions'>('board')
  const [adding, setAdding] = useState(false)

  const retros = retrosQ.data
  const current = retros.find((r) => r.id === selId) ?? retros[0] ?? null

  const createRetro = async (sprint: string) => {
    const rec = await addRetro.mutate({ sprint })
    await retrosQ.refetch()
    if (rec && 'id' in rec) setSelId(rec.id)
    setAdding(false)
    setTab('board')
  }

  const loading = retrosQ.isLoading || cardsQ.isLoading || actionsQ.isLoading
  const error = retrosQ.error || cardsQ.error || actionsQ.error
  const refetch = () => {
    cardsQ.refetch()
    actionsQ.refetch()
  }

  const prog = current ? progressIn(actionsQ.data, current.id) : null

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor={PAPER}>
      {/* Brand + tabs */}
      <XStack
        alignItems="center"
        justifyContent="space-between"
        gap={16}
        paddingHorizontal={22}
        paddingVertical={14}
        backgroundColor={PANEL}
        borderBottomWidth={1}
        borderColor={LINE}
        flexWrap="wrap"
      >
        <XStack alignItems="center" gap={12}>
          <Logo size={34} />
          <YStack>
            <Text fontSize={18} fontWeight="900" color={INK}>
              Sprint Retro
            </Text>
            <Text fontSize={11} color={MUTE}>
              Team Retrospectives
            </Text>
          </YStack>
        </XStack>

        <XStack alignItems="center" gap={8} flexWrap="wrap">
          {current ? (
            <XStack alignItems="center" gap={6} padding={4} borderRadius={999} backgroundColor="#00000006">
              <Tab label="Board" active={tab === 'board'} onPress={() => setTab('board')} />
              <Tab label="Actions" active={tab === 'actions'} onPress={() => setTab('actions')} />
            </XStack>
          ) : null}
          <Button size="$3" chromeless onPress={() => logout()}>
            <Text fontSize={14} color={MUTE}>
              Sign out
            </Text>
          </Button>
        </XStack>
      </XStack>

      {/* Body */}
      <YStack padding={22} gap={18} maxWidth={1180} width="100%" alignSelf="center">
        {loading ? (
          <XStack gap={10} alignItems="center" justifyContent="center" paddingVertical={60} opacity={0.6}>
            <Spinner /> <Text color={INK}>Loading your retros…</Text>
          </XStack>
        ) : error ? (
          <Paragraph color="$red10">
            Couldn’t reach Base ({error.message}). Confirm VITE_HANZO_BASE_URL and that you’re signed in.
          </Paragraph>
        ) : !current ? (
          // First run — no retros yet.
          <YStack
            alignItems="center"
            justifyContent="center"
            gap={16}
            paddingVertical={64}
            paddingHorizontal={24}
            borderRadius={20}
            backgroundColor={PANEL}
            borderWidth={1}
            borderColor={LINE}
          >
            <Logo size={52} />
            <YStack alignItems="center" gap={6}>
              <Text fontSize={24} fontWeight="900" color={INK}>
                Start your first retro
              </Text>
              <Paragraph fontSize={15} color={MUTE} textAlign="center" maxWidth={420}>
                Name the sprint and open the board. You’ll collect what went well,
                what to improve, and the actions your team commits to.
              </Paragraph>
            </YStack>
            <NewSprint placeholder="e.g. Sprint 24" onCreate={createRetro} busy={addRetro.isLoading} />
            {addRetro.error ? (
              <Paragraph fontSize={13} color="$red10">
                {addRetro.error.message}
              </Paragraph>
            ) : null}
            <Text fontSize={12.5} color={MUTE} opacity={0.7}>
              Signed in as {who}
            </Text>
          </YStack>
        ) : (
          <>
            {/* Sprint switcher rail */}
            <XStack alignItems="center" gap={12} flexWrap="wrap">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack alignItems="center" gap={8} paddingVertical={2}>
                  {retros.map((r) => (
                    <SprintPill
                      key={r.id}
                      label={r.sprint}
                      active={r.id === current.id}
                      onPress={() => setSelId(r.id)}
                    />
                  ))}
                </XStack>
              </ScrollView>
              {adding ? (
                <XStack alignItems="center" gap={8}>
                  <NewSprint placeholder="Sprint name" onCreate={createRetro} busy={addRetro.isLoading} />
                  <Button size="$3" chromeless onPress={() => setAdding(false)}>
                    <Text fontSize={13} color={MUTE}>
                      Cancel
                    </Text>
                  </Button>
                </XStack>
              ) : (
                <Button
                  size="$3"
                  paddingHorizontal={14}
                  borderRadius={999}
                  backgroundColor="transparent"
                  borderWidth={1}
                  borderColor={LINE}
                  hoverStyle={{ borderColor: '#5b6ce0' }}
                  onPress={() => setAdding(true)}
                >
                  <Text fontSize={13.5} fontWeight="700" color={INK}>
                    + New sprint
                  </Text>
                </Button>
              )}
            </XStack>

            {/* Current sprint summary */}
            <XStack alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={8}>
              <Text fontSize={26} fontWeight="900" color={INK}>
                {current.sprint}
              </Text>
              <XStack gap={16}>
                <Text fontSize={13} color={MUTE}>
                  {votesIn(cardsQ.data, current.id)} votes
                </Text>
                <Text fontSize={13} color={MUTE}>
                  {prog ? `${prog.done}/${prog.total}` : '0/0'} actions done
                </Text>
              </XStack>
            </XStack>

            {tab === 'board' ? (
              <Board
                retro={current}
                cards={cardsQ.data}
                refetch={refetch}
                goToActions={() => setTab('actions')}
              />
            ) : (
              <Actions retro={current} actions={actionsQ.data} refetch={refetch} />
            )}
          </>
        )}
      </YStack>
    </YStack>
  )
}
