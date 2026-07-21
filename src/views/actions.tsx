import { useState } from 'react'
import { useMutation } from '@hanzo/base/react'
import { YStack, XStack, Input, Button, Text, Paragraph, Separator } from '@hanzo/gui'
import {
  type Action,
  type Retro,
  INK,
  LINE,
  MUTE,
  PANEL,
  actionsIn,
  isDone,
  progressIn,
} from '../lib/retro'

const ACCENT = '#5b6ce0'

/** A round done-toggle built from a Button (no Checkbox dependency). */
function Toggle({ on, onPress }: { on: boolean; onPress: () => void }) {
  return (
    <Button
      size="$2"
      width={26}
      height={26}
      padding={0}
      borderRadius={999}
      backgroundColor={on ? ACCENT : '#ffffff'}
      borderWidth={2}
      borderColor={on ? ACCENT : LINE}
      hoverStyle={{ borderColor: ACCENT }}
      pressStyle={{ borderColor: ACCENT }}
      onPress={onPress}
    >
      <Text fontSize={14} fontWeight="900" color={on ? '#ffffff' : 'transparent'}>
        ✓
      </Text>
    </Button>
  )
}

/** One tracked action row: toggle · text · owner chip · delete. */
function Row({
  action,
  onToggle,
  onDelete,
}: {
  action: Action
  onToggle: (a: Action) => void
  onDelete: (a: Action) => void
}) {
  const done = isDone(action)
  return (
    <XStack
      alignItems="center"
      gap={12}
      paddingVertical={12}
      paddingHorizontal={14}
      borderRadius={12}
      backgroundColor={PANEL}
      borderWidth={1}
      borderColor={LINE}
      opacity={done ? 0.62 : 1}
    >
      <Toggle on={done} onPress={() => onToggle(action)} />
      <Text
        flex={1}
        fontSize={15}
        color={INK}
        textDecorationLine={done ? 'line-through' : 'none'}
      >
        {action.text}
      </Text>
      {action.owner ? (
        <XStack
          alignItems="center"
          gap={6}
          paddingHorizontal={10}
          paddingVertical={5}
          borderRadius={999}
          backgroundColor="#eef0fb"
        >
          <YStack width={7} height={7} borderRadius={999} backgroundColor={ACCENT} />
          <Text fontSize={12.5} fontWeight="700" color="#3a44a6">
            {action.owner}
          </Text>
        </XStack>
      ) : (
        <Text fontSize={12.5} color={MUTE} opacity={0.7}>
          unassigned
        </Text>
      )}
      <Button size="$2" width={30} height={30} padding={0} chromeless onPress={() => onDelete(action)}>
        <Text fontSize={17} color={MUTE}>
          ×
        </Text>
      </Button>
    </XStack>
  )
}

/**
 * The action tracker: the follow-through half of a retro. Capture what the team
 * will change, assign an owner, and check it off. A progress bar shows how much
 * of this sprint's commitments have actually landed. Rows persist per-org in
 * Base; Action Items promoted from the board arrive here unassigned.
 */
export function Actions({
  retro,
  actions,
  refetch,
}: {
  retro: Retro
  actions: Action[]
  refetch: () => void
}) {
  const addA = useMutation('actions', 'create')
  const toggleA = useMutation('actions', 'update')
  const delA = useMutation('actions', 'delete')

  const [text, setText] = useState('')
  const [owner, setOwner] = useState('')

  const rows = actionsIn(actions, retro.id)
  const { done, total, pct } = progressIn(actions, retro.id)

  const add = async () => {
    const t = text.trim()
    if (!t || addA.isLoading) return
    await addA.mutate({ retro: retro.id, text: t, owner: owner.trim(), done: false })
    setText('')
    setOwner('')
    refetch()
  }
  const toggle = async (a: Action) => {
    await toggleA.mutate({ id: a.id, done: !isDone(a) })
    refetch()
  }
  const remove = async (a: Action) => {
    await delA.mutate({ id: a.id })
    refetch()
  }

  return (
    <YStack gap={16} maxWidth={720} width="100%" alignSelf="center">
      {/* Progress header */}
      <YStack
        gap={12}
        padding={18}
        borderRadius={16}
        backgroundColor={PANEL}
        borderWidth={1}
        borderColor={LINE}
      >
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontSize={17} fontWeight="800" color={INK}>
            Action Tracker
          </Text>
          <Text fontSize={13} fontWeight="700" color={total ? ACCENT : MUTE}>
            {done} of {total} done
          </Text>
        </XStack>
        <YStack height={9} borderRadius={999} backgroundColor="#ece8f7" overflow="hidden">
          <YStack height={9} width={`${pct}%`} borderRadius={999} backgroundColor={ACCENT} />
        </YStack>
      </YStack>

      {/* Composer */}
      <XStack gap={9} flexWrap="wrap">
        <Input
          flex={1}
          minWidth={220}
          size="$4"
          backgroundColor={PANEL}
          value={text}
          placeholder="What will the team change next sprint?"
          onChangeText={setText}
          onSubmitEditing={add}
        />
        <Input
          width={150}
          size="$4"
          backgroundColor={PANEL}
          value={owner}
          placeholder="Owner"
          onChangeText={setOwner}
          onSubmitEditing={add}
        />
        <Button
          size="$4"
          paddingHorizontal={18}
          backgroundColor={ACCENT}
          borderWidth={0}
          hoverStyle={{ backgroundColor: '#3a44a6' }}
          pressStyle={{ backgroundColor: '#3a44a6' }}
          disabled={addA.isLoading || !text.trim()}
          onPress={add}
        >
          <Text fontSize={15} fontWeight="800" color="#ffffff">
            Add action
          </Text>
        </Button>
      </XStack>

      {addA.error ? (
        <Paragraph fontSize={13} color="$red10">
          {addA.error.message}
        </Paragraph>
      ) : null}

      <Separator borderColor={LINE} />

      {/* List */}
      {rows.length === 0 ? (
        <YStack alignItems="center" justifyContent="center" gap={8} paddingVertical={44}>
          <Text fontSize={30}>🎯</Text>
          <Text fontSize={16} fontWeight="800" color={INK}>
            No actions yet
          </Text>
          <Paragraph fontSize={14} color={MUTE} textAlign="center" maxWidth={360}>
            Capture what the team will change, assign an owner, and check it off as
            the sprint delivers. Action Items from the board land here.
          </Paragraph>
        </YStack>
      ) : (
        <YStack gap={9}>
          {rows.map((a) => (
            <Row key={a.id} action={a} onToggle={toggle} onDelete={remove} />
          ))}
        </YStack>
      )}
    </YStack>
  )
}
