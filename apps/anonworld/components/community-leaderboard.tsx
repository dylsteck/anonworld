'use client'

import { Content } from '@/components/content'
import {
  CommunityDisplay,
  Leaderboard,
  LeaderboardSelector,
  useCommunity,
} from '@anonworld/react'
import { Text, View, XStack, YStack } from '@anonworld/ui'
import Link from 'next/link'
import { useEffect, useState } from 'react'

function getNextWednesday20UTC() {
  const now = new Date()
  const nextWednesday = new Date()
  nextWednesday.setUTCHours(20, 0, 0, 0)

  // Adjust to next Wednesday (3 represents Wednesday)
  while (nextWednesday.getUTCDay() !== 3 || nextWednesday < now) {
    nextWednesday.setDate(nextWednesday.getDate() + 1)
  }

  return nextWednesday
}

export function ResetCountdown() {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function updateCountdown() {
      const now = new Date()
      const target = getNextWednesday20UTC()
      const diff = target.getTime() - now.getTime()

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      const timeString = [
        days > 0 ? `${days}d` : '',
        `${hours}h`,
        `${minutes}m`,
        `${seconds}s`,
      ]
        .filter(Boolean)
        .join(' ')

      setTimeLeft(timeString)
    }

    // Update immediately
    updateCountdown()

    // Update every second
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Text fos="$2" fow="500" color="$green12">
      Rewards in {timeLeft}
    </Text>
  )
}

export function CommunityLeaderboardPage({ id }: { id: string }) {
  const { data: community } = useCommunity({ id })
  const [selected, setSelected] = useState<'week' | 'last-week' | 'all-time'>('week')

  if (!community) {
    return null
  }

  return (
    <Content>
      <CommunityDisplay community={community} disableActions={false} />
      <XStack ai="center" jc="space-between" $xs={{ px: '$2' }}>
        <XStack gap="$2">
          <Link href={`/communities/${id}`} style={{ textDecoration: 'none' }}>
            <View
              bg="$color1"
              py="$2"
              px="$3"
              br="$12"
              hoverStyle={{
                opacity: 0.9,
                bg: '$color5',
              }}
              cursor="pointer"
            >
              <Text fow="600" fos="$2" color="$color12">
                Posts
              </Text>
            </View>
          </Link>
          <View
            bg="$color12"
            py="$2"
            px="$3"
            br="$12"
            hoverStyle={{
              opacity: 0.9,
              bg: '$color12',
            }}
            cursor="pointer"
          >
            <Text fow="600" fos="$2" color="$color1">
              Leaderboard
            </Text>
          </View>
        </XStack>
        <LeaderboardSelector selected={selected} setSelected={setSelected} />
      </XStack>
      <YStack gap="$4">
        <View
          bg="$green1"
          p="$3"
          br="$4"
          bc="$green8"
          bw="$0.5"
          gap="$3"
          $xs={{ mx: '$3' }}
        >
          <Text fos="$2" fow="400" color="$green12">
            Leaderboard scores reflect Farcaster engagement generated by the poster, with
            higher weight given to interactions from users with more distribution. Each
            community maintains its own separate leaderboard, with weekly resets every
            Wednesday at 8pm UTC.
          </Text>
          <Text fos="$2" fow="400" color="$green12">
            Communities with anon.world-launched tokens that have generated at least 0.1
            ETH in fees will be eligible for rewards. Top poster(s) in these communities
            will each receive 0.1 ETH. The number of recipients is determined by the
            amount in the rewards pool. For example, if the rewards pool is 0.5 ETH, there
            will be 5 recipients. Rewards will be anonymously claimable through Veil
            starting January 22nd.
          </Text>
          <Text fos="$2" fow="400" color="$green12">
            Leaderboards and rewards are an experimental feature and subject to change.
          </Text>
          <XStack ai="center" jc="space-between">
            <View />
            <ResetCountdown />
          </XStack>
        </View>
        <Leaderboard timeframe={selected} community={community} />
      </YStack>
    </Content>
  )
}
