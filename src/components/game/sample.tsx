'use client';

import { useState, useEffect } from 'react';
import { Team, Game, GameSession } from '@/types';
import { initializeTeams, updateTeamStats, sortTeamsByRanking } from '@/utils/scheduleGenerator';
import { PlusIcon, TrashIcon, PlayIcon, CheckIcon, FlagIcon } from '@heroicons/react/24/outline';

export default function GameScheduler() {
  const [numTeams, setNumTeams] = useState<number>(4);
  const [teamNames, setTeamNames] = useState<string[]>(['Team A', 'Team B', 'Team C', 'Team D']);
  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);

  // Initialize team names when number of teams changes
  useEffect(() => {
    const newTeamNames = Array.from({ length: numTeams }, (_, i) => 
      teamNames[i] || `Team ${String.fromCharCode(65 + i)}`
    );
    setTeamNames(newTeamNames);
  }, [numTeams]);

  // Handle team name changes
  const handleTeamNameChange = (index: number, name: string) => {
    const newTeamNames = [...teamNames];
    newTeamNames[index] = name || `Team ${String.fromCharCode(65 + index)}`;
    setTeamNames(newTeamNames);
  };

  // Generate sequential schedule (one game at a time) - 4 hours = ~34 games
  const generateSequentialSchedule = () => {
    const schedule: Game[] = [];
    const teams = teamNames.slice(0, numTeams);
    let gameId = 1;
    const targetGames = 34; // 4 hours ÷ 7 minutes ≈ 34 games
    
    if (numTeams === 3) {
      // For 3 teams: A-B, B-C, C-A (3 games per round)
      // Need ~11-12 rounds to reach 34 games
      const basePairs = [[0, 1], [1, 2], [2, 0]];
      const roundsNeeded = Math.ceil(targetGames / 3);
      
      for (let round = 1; round <= roundsNeeded; round++) {
        basePairs.forEach((pair, pairIndex) => {
          if (gameId <= targetGames) {
            schedule.push({
              id: `game_${gameId++}`,
              round: round,
              homeTeam: teams[pair[0]],
              awayTeam: teams[pair[1]],
              homeScore: null,
              awayScore: null,
              isCompleted: false,
            });
          }
        });
      }
    } else if (numTeams === 4) {
      // For 4 teams: A-B, C-D, A-C, B-D, A-D, B-C (6 games per round)
      // Need ~6 rounds to reach 34+ games
      const basePairs = [[0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2]];
      const roundsNeeded = Math.ceil(targetGames / 6);
      
      for (let round = 1; round <= roundsNeeded; round++) {
        basePairs.forEach((pair, pairIndex) => {
          if (gameId <= targetGames) {
            schedule.push({
              id: `game_${gameId++}`,
              round: round,
              homeTeam: teams[pair[0]],
              awayTeam: teams[pair[1]],
              homeScore: null,
              awayScore: null,
              isCompleted: false,
            });
          }
        });
      }
    }

    return schedule;
  };

  // Generate schedule
  const handleGenerateSchedule = () => {
    try {
      const filteredTeamNames = teamNames.slice(0, numTeams).filter(name => name.trim());
      const generatedGames = generateSequentialSchedule();
      const initializedTeams = initializeTeams(filteredTeamNames);
      
      const sessionId = `session_${Date.now()}`;
      const newSession: GameSession = {
        id: sessionId,
        date: new Date().toISOString().split('T')[0],
        teams: initializedTeams,
        games: generatedGames,
        isCompleted: false,
        sessionName: `Saturday Session - ${new Date().toLocaleDateString()}`,
      };

      setTeams(initializedTeams);
      setGames(generatedGames);
      setCurrentSession(newSession);
      setIsScheduled(true);
    } catch (error) {
      console.error('Error generating schedule:', error);
      alert('Error generating schedule. Please check your team setup.');
    }
  };

  // Update game score (but don't finalize yet)
  const handleScoreUpdate = (gameId: string, field: 'home' | 'away', value: string) => {
    const score = value === '' ? null : parseInt(value);
    
    const updatedGames = games.map(game => {
      if (game.id === gameId) {
        return {
          ...game,
          [field === 'home' ? 'homeScore' : 'awayScore']: score,
        };
      }
      return game;
    });

    setGames(updatedGames);
  };

  // Finish game and update league table
  const handleFinishGame = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    
    if (!game) return;
    
    // Validate scores are entered
    if (game.homeScore == null || game.awayScore == null) {
      alert('Please enter scores for both teams before finishing the game.');
      return;
    }

    // Mark game as completed
    const updatedGames = games.map(g => {
      if (g.id === gameId) {
        return { ...g, isCompleted: true };
      }
      return g;
    });

    // Update team stats
    const finishedGame = { ...game, isCompleted: true };
    const updatedTeams = updateTeamStats(teams, finishedGame);
    
    setGames(updatedGames);
    setTeams(sortTeamsByRanking(updatedTeams));
  };

  // Reset session
  const handleReset = () => {
    setTeams([]);
    setGames([]);
    setCurrentSession(null);
    setIsScheduled(false);
  };

  // Save session to history (localStorage for now)
  const handleSaveSession = () => {
    if (!currentSession) return;

    const savedSessions = JSON.parse(localStorage.getItem('gameSessions') || '[]');
    const updatedSession = {
      ...currentSession,
      teams,
      games,
      isCompleted: games.every(game => game.isCompleted),
    };
    
    const existingIndex = savedSessions.findIndex((s: GameSession) => s.id === currentSession.id);
    if (existingIndex >= 0) {
      savedSessions[existingIndex] = updatedSession;
    } else {
      savedSessions.push(updatedSession);
    }

    localStorage.setItem('gameSessions', JSON.stringify(savedSessions));
    alert('Session saved successfully!');
  };

  // Group games by round for better display
  const gamesByRound = games.reduce((acc, game) => {
    if (!acc[game.round]) {
      acc[game.round] = [];
    }
    acc[game.round].push(game);
    return acc;
  }, {} as { [key: number]: Game[] });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 font-heading">
          Game Scheduler
        </h1>
        <p className="text-xl text-gray-600">
          Create and manage your Saturday football schedule
        </p>
        
        {/* Game Duration Info */}
        <div className="game-duration-info mt-6">
          <div className="duration-title">⏱️ Game Day Information</div>
          <div className="duration-details">
            <div>• <span className="highlight">Game Duration:</span> 7 minutes per match</div>
            <div>• <span className="highlight">Total Games:</span> ~34 games to fill 4 hours</div>
            <div>• <span className="highlight">Format:</span> Sequential games (one at a time)</div>
            <div>• <span className="highlight">Rounds:</span> {numTeams === 3 ? '~12 rounds (3 games each)' : '~6 rounds (6 games each)'}</div>
          </div>
        </div>
      </div>

      {!isScheduled ? (
        /* Setup Form */
        <div className="football-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Setup Teams</h2>
          
          {/* Number of Teams */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Teams
            </label>
            <select
              value={numTeams}
              onChange={(e) => setNumTeams(parseInt(e.target.value))}
              className="w-full px-3 py-2 border-2 border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value={3}>3 Teams</option>
              <option value={4}>4 Teams</option>
            </select>
          </div>

          {/* Team Names */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Team Names
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: numTeams }).map((_, index) => (
                <div key={index} className="football-card p-4">
                  {/* Team Photo Placeholder */}
                  <div className="team-placeholder">
                    <div className="placeholder-icon">📸</div>
                    <div className="placeholder-text">Team Photo</div>
                  </div>
                  
                  {/* Team Logo Placeholder */}
                  <div className="team-logo-placeholder">
                    <div className="logo-text">{String.fromCharCode(65 + index)}</div>
                  </div>
                  
                  {/* Team Name Input */}
                  <input
                    type="text"
                    value={teamNames[index] || ''}
                    onChange={(e) => handleTeamNameChange(index, e.target.value)}
                    placeholder={`Team ${String.fromCharCode(65 + index)}`}
                    className="w-full px-3 py-2 border-2 border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-center font-semibold bg-yellow-50"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateSchedule}
            className="gradient-button inline-flex items-center px-6 py-3 text-lg font-semibold"
          >
            <PlayIcon className="w-5 h-5 mr-2" />
            Generate Schedule
          </button>
        </div>
      ) : (
        /* Schedule Display */
        <div className="space-y-8">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleSaveSession}
              className="gradient-button inline-flex items-center justify-center px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base"
            >
              <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Save Session
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300"
            >
              <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Reset
            </button>
          </div>

          {/* Current League Table */}
          <div className="football-card p-3 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Current Standings</h2>
            
            {/* Mobile-friendly cards for small screens */}
            <div className="block sm:hidden space-y-3">
              {teams.map((team, index) => (
                <div 
                  key={team.id} 
                  className={`bg-white border-2 rounded-lg p-4 ${index === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                      <div className="team-badge w-8 h-8 text-xs">
                        {team.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900 truncate">{team.name}</span>
                    </div>
                    <span className="text-xl font-bold text-yellow-600">{team.points} pts</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm text-center">
                    <div>
                      <div className="text-gray-500">P</div>
                      <div className="font-medium">{team.gamesPlayed}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">W-D-L</div>
                      <div className="font-medium">{team.wins}-{team.draws}-{team.losses}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Goals</div>
                      <div className="font-medium">{team.goalsFor}-{team.goalsAgainst}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">GD</div>
                      <div className="font-medium">
                        {team.goalsDifference > 0 ? '+' : ''}{team.goalsDifference}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table for larger screens */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full league-table">
                <thead>
                  <tr className="table-header">
                    <th className="px-2 lg:px-4 py-3 text-left">Pos</th>
                    <th className="px-2 lg:px-4 py-3 text-left">Team</th>
                    <th className="px-2 lg:px-4 py-3 text-center">P</th>
                    <th className="px-2 lg:px-4 py-3 text-center">W</th>
                    <th className="px-2 lg:px-4 py-3 text-center">D</th>
                    <th className="px-2 lg:px-4 py-3 text-center">L</th>
                    <th className="px-2 lg:px-4 py-3 text-center">GF</th>
                    <th className="px-2 lg:px-4 py-3 text-center">GA</th>
                    <th className="px-2 lg:px-4 py-3 text-center">GD</th>
                    <th className="px-2 lg:px-4 py-3 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, index) => (
                    <tr 
                      key={team.id} 
                      className={`table-row ${index === 0 ? 'champion' : ''}`}
                    >
                      <td className="px-2 lg:px-4 py-3 font-bold">{index + 1}</td>
                      <td className="px-2 lg:px-4 py-3">
                        <div className="flex items-center space-x-2 lg:space-x-3">
                          <div className="team-badge w-6 h-6 lg:w-8 lg:h-8 text-xs">
                            {team.name.charAt(0)}
                          </div>
                          <span className="font-medium text-sm lg:text-base truncate">{team.name}</span>
                        </div>
                      </td>
                      <td className="px-2 lg:px-4 py-3 text-center text-sm lg:text-base">{team.gamesPlayed}</td>
                      <td className="px-2 lg:px-4 py-3 text-center text-sm lg:text-base">{team.wins}</td>
                      <td className="px-2 lg:px-4 py-3 text-center text-sm lg:text-base">{team.draws}</td>
                      <td className="px-2 lg:px-4 py-3 text-center text-sm lg:text-base">{team.losses}</td>
                      <td className="px-2 lg:px-4 py-3 text-center text-sm lg:text-base">{team.goalsFor}</td>
                      <td className="px-2 lg:px-4 py-3 text-center text-sm lg:text-base">{team.goalsAgainst}</td>
                      <td className="px-2 lg:px-4 py-3 text-center font-medium text-sm lg:text-base">
                        {team.goalsDifference > 0 ? '+' : ''}{team.goalsDifference}
                      </td>
                      <td className="px-2 lg:px-4 py-3 text-center font-bold text-lg text-yellow-600">
                        {team.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Games Schedule - Grouped by Round */}
          <div className="space-y-6">
            {Object.entries(gamesByRound).map(([round, roundGames]) => (
              <div key={round} className="football-card p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Round {round}
                </h3>
                <div className="space-y-4">
                  {roundGames.map((game, gameIndex) => (
                    <div key={game.id} className="bg-gray-50 rounded-lg p-3 sm:p-6 border-2 border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs sm:text-sm font-medium text-gray-500">
                          Game {gameIndex + 1} • 7 min
                        </span>
                        <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${
                          game.isCompleted 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {game.isCompleted ? 'Final' : 'Live'}
                        </span>
                      </div>

                      {/* Mobile Layout */}
                      <div className="block sm:hidden space-y-4">
                        {/* Teams */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="team-badge w-8 h-8 text-xs flex-shrink-0">
                                {game.homeTeam.charAt(0)}
                              </div>
                              <span className="font-medium text-gray-900 truncate">{game.homeTeam}</span>
                            </div>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={game.homeScore == null ? '' : game.homeScore}
                              onChange={(e) => handleScoreUpdate(game.id, 'home', e.target.value)}
                              className="w-12 h-8 text-center border-2 border-yellow-300 rounded text-sm font-semibold bg-yellow-50 focus:outline-none focus:border-yellow-500"
                              placeholder="0"
                              disabled={game.isCompleted}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="team-badge w-8 h-8 text-xs flex-shrink-0">
                                {game.awayTeam.charAt(0)}
                              </div>
                              <span className="font-medium text-gray-900 truncate">{game.awayTeam}</span>
                            </div>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={game.awayScore == null ? '' : game.awayScore}
                              onChange={(e) => handleScoreUpdate(game.id, 'away', e.target.value)}
                              className="w-12 h-8 text-center border-2 border-yellow-300 rounded text-sm font-semibold bg-yellow-50 focus:outline-none focus:border-yellow-500"
                              placeholder="0"
                              disabled={game.isCompleted}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:flex items-center justify-between">
                        {/* Home Team */}
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="team-badge w-12 h-12 text-sm flex-shrink-0">
                            {game.homeTeam.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900 truncate">{game.homeTeam}</span>
                        </div>

                        {/* Score Inputs */}
                        <div className="flex items-center space-x-2 sm:space-x-4 mx-3 sm:mx-6 flex-shrink-0">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={game.homeScore == null ? '' : game.homeScore}
                            onChange={(e) => handleScoreUpdate(game.id, 'home', e.target.value)}
                            className="score-input"
                            placeholder="0"
                            disabled={game.isCompleted}
                          />
                          <span className="text-xl sm:text-2xl font-bold text-gray-400">-</span>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={game.awayScore == null ? '' : game.awayScore}
                            onChange={(e) => handleScoreUpdate(game.id, 'away', e.target.value)}
                            className="score-input"
                            placeholder="0"
                            disabled={game.isCompleted}
                          />
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center space-x-3 flex-1 justify-end min-w-0">
                          <span className="font-medium text-gray-900 truncate">{game.awayTeam}</span>
                          <div className="team-badge w-12 h-12 text-sm flex-shrink-0">
                            {game.awayTeam.charAt(0)}
                          </div>
                        </div>
                      </div>

                      {/* Finish Game Button */}
                      {!game.isCompleted && (
                        <div className="mt-4 text-center">
                          <button
                            onClick={() => handleFinishGame(game.id)}
                            className="gradient-button inline-flex items-center px-4 sm:px-6 py-2 font-semibold text-sm"
                          >
                            <FlagIcon className="w-4 h-4 mr-2" />
                            Finish Game
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}