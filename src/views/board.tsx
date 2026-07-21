import { useState } from 'react'
import { useMutation } from '@hanzo/base/react'
import { YStack, XStack, Input, Button, Text, Paragraph } from '@hanzo/gui'
import {
  type Card,
  type Column,
  type ColumnKey,
  type Retro,
  COLUMNS,
  INK,
  MUTE,
  PANEL,
  SHADOW,
  cardsIn,
} from '../lib/retro'

/** One sticky note: the text, a vote pill, and (on action cards) a Track hook. */
function Sticky({
  card,
  col,
  onVote,
  onDelete,
  onTrack,
}: {
  card: Card
  col: Column
  onVote: (c: Card) => void
  onDelete: (c: Card) => void
  onTrack?: (c: Card) => void
}) {
  return (
    <YStack
      backgroundColor={col.sticky}
      borderRadius={14}
      borderTopWidth={3}
      borderTopColor={col.accent}
      padding={13}
      gap={11}
      shadowColor={SHADOW}
      shadowRadius={10}
      shadowOffset={{ width: 0, height: 5 }}
    >
      <Text fontSize={15} lineHeight={21} color={col.ink}>
        {card.text}
      </Text>
      <XStack alignItems="center" justifyContent="space-between">
        <XStack alignItems="center" gap={7}>
          <Button
            size="$2"
            height={30}
            paddingHorizontal={11}
            borderRadius={999}
            backgroundColor="#ffffffcc"
            borderWidth={1}
            borderColor={`${col.accent}55`}
            hoverStyle={{ backgroundColor: '#ffffff' }}
            pressStyle={{ backgroundColor: '#ffffff' }}
            onPress={() => onVote(card)}
          >
            <Text fontSize={13} color={col.ink}>
              ▲ <Text fontSize={13} fontWeight="800" color={col.accent}>{Number(card.votes) || 0}</Text>
            </Text>
          </Button>
          {onTrack ? (
            <Button
              size="$2"
              height={30}
              chromeless
              paddingHorizontal={8}
              onPress={() => onTrack(card)}
            >
              <Text fontSize={12.5} fontWeight="700" color={col.accent}>
                Track →
              </Text>
            </Button>
          ) : null}
        </XStack>
        <Button
          size="$2"
          height={30}
          width={30}
          padding={0}
          chromeless
          onPress={() => onDelete(card)}
        >
          <Text fontSize={17} color={MUTE}>
            ×
          </Text>
        </Button>
      </XStack>
    </YStack>
  )
}

/** A single board column: header band, a composer, then its stickies. */
function Lane({
  col,
  cards,
  busy,
  onAdd,
  onVote,
  onDelete,
  onTrack,
}: {
  col: Column
  cards: Card[]
  busy: boolean
  onAdd: (key: ColumnKey, text: string) => void
  onVote: (c: Card) => void
  onDelete: (c: Card) => void
  onTrack?: (c: Card) => void
}) {
  const [text, setText] = useState('')

  const submit = () => {
    const t = text.trim()
    if (!t || busy) return
    onAdd(col.key, t)
    setText('')
  }

  return (
    <YStack
      flex={1}
      minWidth={288}
      borderRadius={18}
      backgroundColor={col.tint}
      borderWidth={1}
      borderColor={`${col.accent}22`}
      overflow="hidden"
    >
      {/* Header band */}
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal={16}
        paddingVertical={13}
        backgroundColor={col.head}
      >
        <XStack alignItems="center" gap={9}>
          <YStack width={11} height={11} borderRadius={999} backgroundColor={col.accent} />
          <YStack>
            <Text fontSize={15} fontWeight="800" color={col.ink}>
              {col.title}
            </Text>
            <Text fontSize={11.5} color={col.ink} opacity={0.6}>
              {col.kicker}
            </Text>
          </YStack>
        </XStack>
        <YStack
          minWidth={26}
          height={24}
          alignItems="center"
          justifyContent="center"
          paddingHorizontal={8}
          borderRadius={999}
          backgroundColor="#ffffffbb"
        >
          <Text fontSize={12.5} fontWeight="800" color={col.ink}>
            {cards.length}
          </Text>
        </YStack>
      </XStack>

      {/* Composer */}
      <XStack gap={8} padding={12} paddingBottom={8}>
        <Input
          flex={1}
          size="$3"
          backgroundColor={PANEL}
          borderColor={`${col.accent}33`}
          value={text}
          placeholder={`Add to ${col.title}…`}
          onChangeText={setText}
          onSubmitEditing={submit}
        />
        <Button
          size="$3"
          paddingHorizontal={14}
          backgroundColor={col.accent}
          borderWidth={0}
          hoverStyle={{ backgroundColor: col.ink }}
          pressStyle={{ backgroundColor: col.ink }}
          disabled={busy || !text.trim()}
          onPress={submit}
        >
          <Text fontSize={14} fontWeight="800" color="#ffffff">
            Add
          </Text>
        </Button>
      </XStack>

      {/* Stickies */}
      <YStack gap={11} paddingHorizontal={12} paddingBottom={14}>
        {cards.length === 0 ? (
          <YStack
            alignItems="center"
            justifyContent="center"
            paddingVertical={26}
            borderRadius={12}
            borderWidth={1}
            borderColor={`${col.accent}22`}
          >
            <Paragraph fontSize={13} color={col.ink} opacity={0.5} textAlign="center">
              Nothing here yet.
            </Paragraph>
          </YStack>
        ) : (
          cards.map((c) => (
            <Sticky
              key={c.id}
              card={c}
              col={col}
              onVote={onVote}
              onDelete={onDelete}
              onTrack={onTrack}
            />
          ))
        )}
      </YStack>
    </YStack>
  )
}

/**
 * The retro board: three calm pastel columns of sticky-note cards. Add a card
 * per column, vote to surface what matters (cards sort most-voted first), and
 * promote an Action Item straight into the tracker. Every write is org-scoped
 * to the signed-in team via Base, then refetched so the board stays live.
 */
export function Board({
  retro,
  cards,
  refetch,
  goToActions,
}: {
  retro: Retro
  cards: Card[]
  refetch: () => void
  goToActions: () => void
}) {
  const addCard = useMutation('cards', 'create')
  const voteCard = useMutation('cards', 'update')
  const delCard = useMutation('cards', 'delete')
  const addAction = useMutation('actions', 'create')

  const busy = addCard.isLoading

  const add = async (key: ColumnKey, text: string) => {
    await addCard.mutate({ retro: retro.id, column: key, text, votes: 0 })
    refetch()
  }
  const vote = async (c: Card) => {
    await voteCard.mutate({ id: c.id, votes: (Number(c.votes) || 0) + 1 })
    refetch()
  }
  const remove = async (c: Card) => {
    await delCard.mutate({ id: c.id })
    refetch()
  }
  const track = async (c: Card) => {
    await addAction.mutate({ retro: retro.id, text: c.text, owner: '', done: false })
    refetch()
    goToActions()
  }

  return (
    <YStack gap={14}>
      <XStack gap={14} flexWrap="wrap" alignItems="flex-start">
        {COLUMNS.map((col) => (
          <Lane
            key={col.key}
            col={col}
            cards={cardsIn(cards, retro.id, col.key)}
            busy={busy}
            onAdd={add}
            onVote={vote}
            onDelete={remove}
            onTrack={col.key === 'action' ? track : undefined}
          />
        ))}
      </XStack>
      {addCard.error ? (
        <Paragraph fontSize={13} color="$red10">
          {addCard.error.message}
        </Paragraph>
      ) : null}
      <Paragraph fontSize={12} color={INK} opacity={0.4} textAlign="center">
        Vote to focus the conversation · promote an Action Item to the tracker with Track →
      </Paragraph>
    </YStack>
  )
}
