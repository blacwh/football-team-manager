import { Team, Game } from '@/types';

/**
 * Generate a round-robin schedule using the circle method.
 * A "BYE" placeholder is added when the team count is odd and any games
 * involving the BYE are skipped. This implementation does not currently
 * enforce a limit on consecutive rest periods for teams.
 * @param teamNames Array of team names
 * @returns Array of games with proper scheduling
 */
export function generateSchedule(teamNames: string[]): Game[] {
  const numTeams = teamNames.length;
  const games: Game[] = [];
  let gameId = 1;

  if (numTeams < 3) {
    throw new Error('Need at least 3 teams to generate schedule');
  }

  // For odd number of teams, add a "BYE" team
  const teams = [...teamNames];
  if (numTeams % 2 !== 0) {
    teams.push('BYE');
  }

  const totalTeams = teams.length;
  const totalRounds = totalTeams - 1;
  const gamesPerRound = totalTeams / 2;

  // Generate round-robin schedule using the circle method
  for (let round = 0; round < totalRounds; round++) {
    const roundGames: Game[] = [];
    
    for (let game = 0; game < gamesPerRound; game++) {
      let homeIndex: number;
      let awayIndex: number;

      if (game === 0) {
        // First team stays fixed
        homeIndex = 0;
        awayIndex = totalTeams - 1 - round;
      } else {
        // Calculate positions for other games
        homeIndex = (round + game) % (totalTeams - 1);
        if (homeIndex >= totalTeams - 1 - round) {
          homeIndex = (homeIndex + 1) % (totalTeams - 1);
        }
        if (homeIndex === 0) {
          homeIndex = totalTeams - 1;
        }
        
        awayIndex = (totalTeams - 1 - round + totalTeams - 1 - game) % (totalTeams - 1);
        if (awayIndex >= totalTeams - 1 - round) {
          awayIndex = (awayIndex + 1) % (totalTeams - 1);
        }
        if (awayIndex === 0) {
          awayIndex = totalTeams - 1;
        }
      }

      // Skip games involving BYE team
      if (teams[homeIndex] !== 'BYE' && teams[awayIndex] !== 'BYE') {
        roundGames.push({
          id: gameId.toString(),
          homeTeam: teams[homeIndex],
          awayTeam: teams[awayIndex],
          isCompleted: false,
          round: round + 1,
          gameDate: new Date().toISOString().split('T')[0],
        });
        gameId++;
      }
    }
    
    games.push(...roundGames);
  }

  return games;
}

/**
 * Initialize teams with default stats
 * @param teamNames Array of team names
 * @returns Array of team objects with initialized stats
 */
export function initializeTeams(teamNames: string[]): Team[] {
  return teamNames.map((name, index) => ({
    id: (index + 1).toString(),
    name,
    points: 0,
    gamesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalsDifference: 0,
  }));
}

/**
 * Update team stats based on game results
 * @param teams Current teams array
 * @param game Completed game with scores
 * @returns Updated teams array
 */
export function updateTeamStats(teams: Team[], game: Game): Team[] {
  if (!game.isCompleted || game.homeScore == null || game.awayScore == null) {
    return teams;
  }

  return teams.map(team => {
    if (team.name === game.homeTeam) {
      const isWin = game.homeScore! > game.awayScore!;
      const isDraw = game.homeScore! === game.awayScore!;
      
      return {
        ...team,
        gamesPlayed: team.gamesPlayed + 1,
        points: team.points + (isWin ? 3 : isDraw ? 1 : 0),
        wins: team.wins + (isWin ? 1 : 0),
        draws: team.draws + (isDraw ? 1 : 0),
        losses: team.losses + (!isWin && !isDraw ? 1 : 0),
        goalsFor: team.goalsFor + game.homeScore!,
        goalsAgainst: team.goalsAgainst + game.awayScore!,
        goalsDifference: (team.goalsFor + game.homeScore!) - (team.goalsAgainst + game.awayScore!),
      };
    } else if (team.name === game.awayTeam) {
      const isWin = game.awayScore! > game.homeScore!;
      const isDraw = game.homeScore! === game.awayScore!;
      
      return {
        ...team,
        gamesPlayed: team.gamesPlayed + 1,
        points: team.points + (isWin ? 3 : isDraw ? 1 : 0),
        wins: team.wins + (isWin ? 1 : 0),
        draws: team.draws + (isDraw ? 1 : 0),
        losses: team.losses + (!isWin && !isDraw ? 1 : 0),
        goalsFor: team.goalsFor + game.awayScore!,
        goalsAgainst: team.goalsAgainst + game.homeScore!,
        goalsDifference: (team.goalsFor + game.awayScore!) - (team.goalsAgainst + game.homeScore!),
      };
    }
    return team;
  });
}

/**
 * Sort teams by points, then by goal difference, then by goals scored
 * @param teams Array of teams to sort
 * @returns Sorted teams array
 */
export function sortTeamsByRanking(teams: Team[]): Team[] {
  return [...teams].sort((a, b) => {
    // Primary: Points (descending)
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    
    // Secondary: Goal difference (descending)
    if (b.goalsDifference !== a.goalsDifference) {
      return b.goalsDifference - a.goalsDifference;
    }
    
    // Tertiary: Goals scored (descending)
    return b.goalsFor - a.goalsFor;
  });
}