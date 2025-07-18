'use client';

import { useEffect, useState } from 'react';
import { Team, GameSession } from '@/types';
import { sortTeamsByRanking } from '@/utils/scheduleGenerator';

export default function LeaguePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const sessions: GameSession[] = JSON.parse(
        localStorage.getItem('gameSessions') || '[]'
      );
      if (sessions.length > 0) {
        const latest = sessions.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        setTeams(sortTeamsByRanking(latest.teams));
      }
    } catch (error) {
      console.error('Error loading league standings:', error);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 font-heading">
          League Standings
        </h1>
        <p className="text-gray-600">
          Latest results from your most recent session
        </p>
      </div>

      {teams.length === 0 ? (
        <div className="football-card p-12 text-center">
          <p className="text-gray-600">No league data available.</p>
        </div>
      ) : (
        <div className="football-card p-6 overflow-x-auto">
          <table className="w-full league-table">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left">Pos</th>
                <th className="px-4 py-3 text-left">Team</th>
                <th className="px-4 py-3 text-center">P</th>
                <th className="px-4 py-3 text-center">W</th>
                <th className="px-4 py-3 text-center">D</th>
                <th className="px-4 py-3 text-center">L</th>
                <th className="px-4 py-3 text-center">GF</th>
                <th className="px-4 py-3 text-center">GA</th>
                <th className="px-4 py-3 text-center">GD</th>
                <th className="px-4 py-3 text-center">Pts</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <tr
                  key={team.id}
                  className={`table-row ${index === 0 ? 'champion' : ''}`}
                >
                  <td className="px-4 py-3 font-bold">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="team-badge w-8 h-8 text-xs">
                        {team.name.charAt(0)}
                      </div>
                      <span className="font-medium">{team.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">{team.gamesPlayed}</td>
                  <td className="px-4 py-3 text-center">{team.wins}</td>
                  <td className="px-4 py-3 text-center">{team.draws}</td>
                  <td className="px-4 py-3 text-center">{team.losses}</td>
                  <td className="px-4 py-3 text-center">{team.goalsFor}</td>
                  <td className="px-4 py-3 text-center">{team.goalsAgainst}</td>
                  <td className="px-4 py-3 text-center font-medium">
                    {team.goalsDifference > 0 ? '+' : ''}
                    {team.goalsDifference}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-lg text-yellow-600">
                    {team.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
