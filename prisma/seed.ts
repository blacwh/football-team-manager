import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create a default season
  const season = await prisma.season.create({
    data: {
      name: '2024 Season',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isActive: true,
    },
  })
  console.log('✅ Created season:', season.name)

  // Create formal team members (80's Football Club members)
  const formalMembers = [
    { name: 'John Smith', jerseyNumber: 7, isFormalMember: true },
    { name: 'Mike Johnson', jerseyNumber: 10, isFormalMember: true },
    { name: 'David Brown', jerseyNumber: 9, isFormalMember: true },
    { name: 'Chris Wilson', jerseyNumber: 11, isFormalMember: true },
    { name: 'Tom Davis', jerseyNumber: 8, isFormalMember: true },
    { name: 'Alex Miller', jerseyNumber: 6, isFormalMember: true },
    { name: 'Ryan Taylor', jerseyNumber: 4, isFormalMember: true },
    { name: 'James Anderson', jerseyNumber: 5, isFormalMember: true },
  ]

  const createdPlayers = []
  for (const member of formalMembers) {
    const player = await prisma.player.create({
      data: member,
    })
    createdPlayers.push(player)
    console.log(`✅ Created formal member: ${player.name} (#${player.jerseyNumber})`)
  }

  // Create some visitor players (friends who join occasionally)
  const visitors = [
    { name: 'Steve Garcia', isFormalMember: false },
    { name: 'Kevin Lee', isFormalMember: false },
    { name: 'Mark White', isFormalMember: false },
    { name: 'Paul Thompson', isFormalMember: false },
  ]

  for (const visitor of visitors) {
    const player = await prisma.player.create({
      data: visitor,
    })
    createdPlayers.push(player)
    console.log(`✅ Created visitor: ${player.name}`)
  }

  // Create a sample weekend session
  const sessionDate = new Date('2024-07-20') // This Saturday
  const session = await prisma.weekendSession.create({
    data: {
      seasonId: season.id,
      sessionDate,
      sessionName: 'Saturday Session - Week 1',
      totalGames: 6,
      isCompleted: false,
    },
  })
  console.log('✅ Created weekend session:', session.sessionName)

  // Create teams for this session (divide players into 4 teams)
  const teamNames = ['Team A', 'Team B', 'Team C', 'Team D']
  const teamsData = []
  
  for (let i = 0; i < 4; i++) {
    const team = await prisma.team.create({
      data: {
        sessionId: session.id,
        teamName: teamNames[i],
      },
    })
    teamsData.push(team)
    console.log(`✅ Created team: ${team.teamName}`)
  }

  // Assign players to teams (3 players per team)
  const playersPerTeam = Math.floor(createdPlayers.length / 4)
  for (let i = 0; i < 4; i++) {
    const teamPlayers = createdPlayers.slice(i * playersPerTeam, (i + 1) * playersPerTeam)
    
    for (const player of teamPlayers) {
      await prisma.teamPlayer.create({
        data: {
          teamId: teamsData[i].id,
          playerId: player.id,
        },
      })
      console.log(`✅ Added ${player.name} to ${teamsData[i].teamName}`)
    }
  }

  console.log('🎉 Database seeded successfully!')
  console.log(`
📊 Summary:
- Season: ${season.name}
- Formal Members: ${formalMembers.length}
- Visitors: ${visitors.length}
- Teams: ${teamsData.length}
- Weekend Session: ${session.sessionName}

🚀 Ready to start recording games and goals!
  `)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })