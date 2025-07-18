import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/goals - Get goals with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')
    const playerId = searchParams.get('playerId')
    const seasonId = searchParams.get('seasonId')
    
    const goals = await prisma.goal.findMany({
      where: {
        ...(gameId && { gameId }),
        ...(playerId && { playerId }),
        ...(seasonId && { 
          game: { 
            session: { seasonId } 
          } 
        })
      },
      include: {
        player: true,
        team: true,
        game: {
          include: {
            homeTeam: true,
            awayTeam: true,
            session: true
          }
        }
      },
      orderBy: [
        { game: { playedAt: 'desc' } },
        { minute: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: goals
    })
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch goals' },
      { status: 500 }
    )
  }
}

// POST /api/goals - Record a goal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gameId, playerId, teamId, minute, goalType } = body

    if (!gameId || !playerId || !teamId) {
      return NextResponse.json(
        { success: false, error: 'Game ID, Player ID, and Team ID are required' },
        { status: 400 }
      )
    }

    // Verify game exists and is not completed
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { homeTeam: true, awayTeam: true }
    })

    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
    }

    // Verify player exists
    const player = await prisma.player.findUnique({
      where: { id: playerId }
    })

    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      )
    }

    // Create goal and update scores in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create the goal
      const goal = await prisma.goal.create({
        data: {
          gameId,
          playerId,
          teamId,
          minute: minute || 0,
          goalType: goalType || 'regular'
        },
        include: {
          player: true,
          team: true
        }
      })

      // Update team stats
      const isHomeTeam = game.homeTeamId === teamId
      
      if (isHomeTeam) {
        await prisma.game.update({
          where: { id: gameId },
          data: { homeScore: { increment: 1 } }
        })
      } else {
        await prisma.game.update({
          where: { id: gameId },
          data: { awayScore: { increment: 1 } }
        })
      }

      // Update team goals and player goals in team
      await prisma.team.update({
        where: { id: teamId },
        data: { goalsFor: { increment: 1 } }
      })

      // Update opponent team's goals against
      const opponentTeamId = isHomeTeam ? game.awayTeamId : game.homeTeamId
      await prisma.team.update({
        where: { id: opponentTeamId },
        data: { goalsAgainst: { increment: 1 } }
      })

      // Update player goals in team
      await prisma.teamPlayer.updateMany({
        where: { 
          teamId: teamId, 
          playerId: playerId 
        },
        data: { goalsScored: { increment: 1 } }
      })

      return goal
    })

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to record goal' },
      { status: 500 }
    )
  }
}

// DELETE /api/goals/[id] - Remove a goal (for corrections)
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const goalId = url.pathname.split('/').pop()

    if (!goalId) {
      return NextResponse.json(
        { success: false, error: 'Goal ID is required' },
        { status: 400 }
      )
    }

    // Get goal details before deletion
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        game: true,
        team: true
      }
    })

    if (!goal) {
      return NextResponse.json(
        { success: false, error: 'Goal not found' },
        { status: 404 }
      )
    }

    // Delete goal and update scores in transaction
    await prisma.$transaction(async (prisma) => {
      // Delete the goal
      await prisma.goal.delete({
        where: { id: goalId }
      })

      // Update game scores
      const isHomeTeam = goal.game.homeTeamId === goal.teamId
      
      if (isHomeTeam) {
        await prisma.game.update({
          where: { id: goal.gameId },
          data: { homeScore: { decrement: 1 } }
        })
      } else {
        await prisma.game.update({
          where: { id: goal.gameId },
          data: { awayScore: { decrement: 1 } }
        })
      }

      // Update team stats
      await prisma.team.update({
        where: { id: goal.teamId },
        data: { goalsFor: { decrement: 1 } }
      })

      const opponentTeamId = isHomeTeam ? goal.game.awayTeamId : goal.game.homeTeamId
      await prisma.team.update({
        where: { id: opponentTeamId },
        data: { goalsAgainst: { decrement: 1 } }
      })

      // Update player goals in team
      await prisma.teamPlayer.updateMany({
        where: { 
          teamId: goal.teamId, 
          playerId: goal.playerId 
        },
        data: { goalsScored: { decrement: 1 } }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Goal deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete goal' },
      { status: 500 }
    )
  }
}