import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/sessions - Get all weekend sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const seasonId = searchParams.get('seasonId')
    
    const sessions = await prisma.weekendSession.findMany({
      where: seasonId ? { seasonId } : undefined,
      include: {
        season: true,
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
        },
        winnerTeam: {
          include: {
            teamPlayers: {
              include: {
                player: true
              }
            }
          }
        }
      },
      orderBy: { sessionDate: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: sessions
    })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

// POST /api/sessions - Create new weekend session with teams and games
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      seasonId, 
      sessionDate, 
      sessionName, 
      teams, // Array of { name, playerIds }
      games  // Array of game data
    } = body

    if (!seasonId || !sessionDate || !sessionName || !teams) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify season exists
    const season = await prisma.season.findUnique({
      where: { id: seasonId }
    })

    if (!season) {
      return NextResponse.json(
        { success: false, error: 'Season not found' },
        { status: 404 }
      )
    }

    // Create session with teams and games in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create weekend session
      const session = await prisma.weekendSession.create({
        data: {
          seasonId,
          sessionDate: new Date(sessionDate),
          sessionName,
          totalGames: games?.length || 0
        }
      })

      // Create teams
      const createdTeams = []
      for (const teamData of teams) {
        const team = await prisma.team.create({
          data: {
            sessionId: session.id,
            teamName: teamData.name
          }
        })

        // Add players to team
        if (teamData.playerIds && teamData.playerIds.length > 0) {
          await prisma.teamPlayer.createMany({
            data: teamData.playerIds.map((playerId: string) => ({
              teamId: team.id,
              playerId
            }))
          })
        }

        createdTeams.push(team)
      }

      // Create games if provided
      if (games && games.length > 0) {
        const teamMap = new Map(createdTeams.map(t => [t.teamName, t.id]))
        
        await prisma.game.createMany({
          data: games.map((game: any, index: number) => ({
            sessionId: session.id,
            homeTeamId: teamMap.get(game.homeTeam)!,
            awayTeamId: teamMap.get(game.awayTeam)!,
            roundNumber: game.round || 1,
            gameNumber: index + 1,
            homeScore: game.homeScore || 0,
            awayScore: game.awayScore || 0,
            isCompleted: game.isCompleted || false
          }))
        })
      }

      return session
    })

    // Return created session with all relations
    const createdSession = await prisma.weekendSession.findUnique({
      where: { id: result.id },
      include: {
        season: true,
        teams: {
          include: {
            teamPlayers: {
              include: {
                player: true
              }
            }
          }
        },
        games: true
      }
    })

    return NextResponse.json({
      success: true,
      data: createdSession
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    )
  }
}