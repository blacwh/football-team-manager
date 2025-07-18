import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/scoreboard - Get season scoreboard with player statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const seasonId = searchParams.get('seasonId')
    
    if (!seasonId) {
      return NextResponse.json(
        { success: false, error: 'Season ID is required' },
        { status: 400 }
      )
    }

    // Get season data with all related information
    const season = await prisma.season.findUnique({
      where: { id: seasonId },
      include: {
        weekendSessions: {
          include: {
            winnerTeam: {
              include: {
                teamPlayers: {
                  include: {
                    player: true
                  }
                }
              }
            },
            teams: {
              include: {
                teamPlayers: {
                  include: {
                    player: true
                  }
                }
              }
            },
            games: {
              include: {
                goals: {
                  include: {
                    player: true
                  }
                }
              }
            }
          },
          orderBy: { sessionDate: 'desc' }
        }
      }
    })

    if (!season) {
      return NextResponse.json(
        { success: false, error: 'Season not found' },
        { status: 404 }
      )
    }

    // Calculate player statistics for the season
    const playerStats = new Map()
    
    // Process all sessions
    season.weekendSessions.forEach(session => {
      // Count weekend wins
      if (session.winnerTeam) {
        session.winnerTeam.teamPlayers.forEach(tp => {
          const playerId = tp.player.id
          if (!playerStats.has(playerId)) {
            playerStats.set(playerId, {
              id: tp.player.id,
              name: tp.player.name,
              jerseyNumber: tp.player.jerseyNumber,
              isFormalMember: tp.player.isFormalMember,
              weekendWins: 0,
              totalGoals: 0,
              gamesPlayed: 0,
              teams: new Set()
            })
          }
          playerStats.get(playerId).weekendWins += 1
        })
      }

      // Count games played and team participations
      session.teams.forEach(team => {
        team.teamPlayers.forEach(tp => {
          const playerId = tp.player.id
          if (!playerStats.has(playerId)) {
            playerStats.set(playerId, {
              id: tp.player.id,
              name: tp.player.name,
              jerseyNumber: tp.player.jerseyNumber,
              isFormalMember: tp.player.isFormalMember,
              weekendWins: 0,
              totalGoals: 0,
              gamesPlayed: 0,
              teams: new Set()
            })
          }
          playerStats.get(playerId).gamesPlayed += team.gamesPlayed
          playerStats.get(playerId).teams.add(team.teamName)
        })
      })

      // Count goals
      session.games.forEach(game => {
        game.goals.forEach(goal => {
          const playerId = goal.player.id
          if (playerStats.has(playerId)) {
            playerStats.get(playerId).totalGoals += 1
          }
        })
      })
    })

    // Convert to array and add team count
    const playerStatsArray = Array.from(playerStats.values()).map(stats => ({
      ...stats,
      teamsPlayed: stats.teams.size,
      teams: undefined // Remove the Set object
    }))

    // Sort by formal members first, then by weekend wins, then by goals
    playerStatsArray.sort((a, b) => {
      if (a.isFormalMember !== b.isFormalMember) {
        return b.isFormalMember ? 1 : -1
      }
      if (a.weekendWins !== b.weekendWins) {
        return b.weekendWins - a.weekendWins
      }
      return b.totalGoals - a.totalGoals
    })

    // Get weekend winners
    const weekendWinners = season.weekendSessions
      .filter(session => session.winnerTeam)
      .map(session => ({
        sessionId: session.id,
        sessionName: session.sessionName,
        sessionDate: session.sessionDate,
        winnerTeam: session.winnerTeam!.teamName,
        winnerPlayers: session.winnerTeam!.teamPlayers.map(tp => ({
          id: tp.player.id,
          name: tp.player.name,
          jerseyNumber: tp.player.jerseyNumber,
          isFormalMember: tp.player.isFormalMember,
          goalsScored: tp.goalsScored
        }))
      }))

    // Season summary
    const seasonSummary = {
      totalSessions: season.weekendSessions.length,
      completedSessions: season.weekendSessions.filter(s => s.isCompleted).length,
      totalGames: season.weekendSessions.reduce((sum, s) => sum + s.totalGames, 0),
      totalGoals: season.weekendSessions.reduce((sum, session) => 
        sum + session.games.reduce((gameSum, game) => 
          gameSum + game.goals.length, 0
        ), 0
      ),
      uniquePlayers: playerStatsArray.length,
      formalMembers: playerStatsArray.filter(p => p.isFormalMember).length
    }

    return NextResponse.json({
      success: true,
      data: {
        season: {
          id: season.id,
          name: season.name,
          startDate: season.startDate,
          endDate: season.endDate,
          isActive: season.isActive
        },
        playerStats: playerStatsArray,
        weekendWinners,
        seasonSummary
      }
    })
  } catch (error) {
    console.error('Error fetching scoreboard:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scoreboard' },
      { status: 500 }
    )
  }
}