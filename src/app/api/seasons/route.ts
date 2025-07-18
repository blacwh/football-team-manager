import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/seasons - Get all seasons with statistics
export async function GET() {
  try {
    const seasons = await prisma.season.findMany({
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
            teams: true,
            games: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    })

    // Calculate season statistics
    const seasonsWithStats = seasons.map(season => {
      const totalSessions = season.weekendSessions.length
      const completedSessions = season.weekendSessions.filter(s => s.isCompleted).length
      const totalGames = season.weekendSessions.reduce((sum, session) => 
        sum + session.games.length, 0
      )
      
      // Get all winners for this season
      const winners = season.weekendSessions
        .filter(session => session.winnerTeam)
        .map(session => ({
          sessionName: session.sessionName,
          sessionDate: session.sessionDate,
          winnerTeam: session.winnerTeam?.teamName,
          winnerPlayers: session.winnerTeam?.teamPlayers.map(tp => ({
            id: tp.player.id,
            name: tp.player.name,
            jerseyNumber: tp.player.jerseyNumber,
            isFormalMember: tp.player.isFormalMember,
            goalsScored: tp.goalsScored
          })) || []
        }))

      return {
        id: season.id,
        name: season.name,
        startDate: season.startDate,
        endDate: season.endDate,
        isActive: season.isActive,
        totalSessions,
        completedSessions,
        totalGames,
        winners,
        createdAt: season.createdAt,
        updatedAt: season.updatedAt
      }
    })

    return NextResponse.json({
      success: true,
      data: seasonsWithStats
    })
  } catch (error) {
    console.error('Error fetching seasons:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch seasons' },
      { status: 500 }
    )
  }
}

// POST /api/seasons - Create a new season
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, startDate, endDate } = body

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Name, start date, and end date are required' },
        { status: 400 }
      )
    }

    // Check if season name already exists
    const existingSeason = await prisma.season.findUnique({
      where: { name }
    })

    if (existingSeason) {
      return NextResponse.json(
        { success: false, error: 'Season name already exists' },
        { status: 400 }
      )
    }

    // Deactivate other seasons if this is set as active
    if (body.isActive) {
      await prisma.season.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      })
    }

    const season = await prisma.season.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: body.isActive || false
      }
    })

    return NextResponse.json({
      success: true,
      data: season
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating season:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create season' },
      { status: 500 }
    )
  }
}