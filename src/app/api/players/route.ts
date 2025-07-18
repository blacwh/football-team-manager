import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/players - Get all players
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const formalOnly = searchParams.get('formal') === 'true'
    
    const players = await prisma.player.findMany({
      where: formalOnly ? { isFormalMember: true } : undefined,
      include: {
        goals: {
          include: {
            game: {
              include: {
                session: true
              }
            }
          }
        },
        teamPlayers: {
          include: {
            team: {
              include: {
                session: true,
                wonSessions: true
              }
            }
          }
        }
      },
      orderBy: [
        { isFormalMember: 'desc' },
        { name: 'asc' }
      ]
    })

    // Calculate player statistics
    const playersWithStats = players.map(player => {
      const totalGoals = player.goals.length
      const weekendWins = player.teamPlayers.filter(tp => 
        tp.team.wonSessions.length > 0
      ).length
      
      // Group goals by season
      const goalsBySeason = player.goals.reduce((acc, goal) => {
        const season = goal.game.session.seasonId
        acc[season] = (acc[season] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        id: player.id,
        name: player.name,
        jerseyNumber: player.jerseyNumber,
        isFormalMember: player.isFormalMember,
        totalGoals,
        weekendWins,
        goalsBySeason,
        createdAt: player.createdAt,
        updatedAt: player.updatedAt
      }
    })

    return NextResponse.json({
      success: true,
      data: playersWithStats
    })
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
}

// POST /api/players - Create a new player
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, jerseyNumber, isFormalMember } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Player name is required' },
        { status: 400 }
      )
    }

    // Check if jersey number is already taken
    if (jerseyNumber) {
      const existingPlayer = await prisma.player.findFirst({
        where: { jerseyNumber }
      })
      
      if (existingPlayer) {
        return NextResponse.json(
          { success: false, error: 'Jersey number already taken' },
          { status: 400 }
        )
      }
    }

    const player = await prisma.player.create({
      data: {
        name,
        jerseyNumber: jerseyNumber || null,
        isFormalMember: isFormalMember || false
      }
    })

    return NextResponse.json({
      success: true,
      data: player
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create player' },
      { status: 500 }
    )
  }
}