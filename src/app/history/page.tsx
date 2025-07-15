'use client';

import { useState, useEffect } from 'react';
import { GameSession } from '@/types';
import { CalendarIcon, TrophyIcon, ClockIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function GameHistoryPage() {
  const [savedSessions, setSavedSessions] = useState<GameSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved sessions from localStorage
  useEffect(() => {
    try {
      const sessions = JSON.parse(localStorage.getItem('gameSessions') || '[]');
      setSavedSessions(sessions.sort((a: GameSession, b: GameSession) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    } catch (error) {
      console.error('Error loading saved sessions:', error);
      setSavedSessions([]);
    }
    setIsLoading(false);
  }, []);

  // Delete a session
  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      const updatedSessions = savedSessions.filter(session => session.id !== sessionId);
      setSavedSessions(updatedSessions);
      localStorage.setItem('gameSessions', JSON.stringify(updatedSessions));
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
    }
  };

  // Calculate total stats
  const totalStats = savedSessions.reduce((acc, session) => {
    acc.totalSessions += 1;
    acc.totalGames += session.games.length;
    acc.completedGames += session.games.filter(game => game.isCompleted).length;
    return acc;
  }, { totalSessions: 0, totalGames: 0, completedGames: 0 });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 font-heading">
          Game History
        </h1>
        <p className="text-xl text-gray-600">
          Review your past Saturday football sessions
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="football-card p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            <CalendarIcon className="w-8 h-8 text-yellow-900" />
          </div>
          <div className="text-3xl font-bold text-yellow-600 mb-2">{totalStats.totalSessions}</div>
          <div className="text-gray-600">Total Sessions</div>
        </div>
        
        <div className="football-card p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            <TrophyIcon className="w-8 h-8 text-yellow-900" />
          </div>
          <div className="text-3xl font-bold text-yellow-600 mb-2">{totalStats.totalGames}</div>
          <div className="text-gray-600">Total Matches</div>
        </div>
        
        <div className="football-card p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            <ClockIcon className="w-8 h-8 text-yellow-900" />
          </div>
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {Math.round((totalStats.totalGames * 7) / 60)}h {(totalStats.totalGames * 7) % 60}m
          </div>
          <div className="text-gray-600">Total Game Time</div>
        </div>
      </div>

      {savedSessions.length === 0 ? (
        /* No Sessions */
        <div className="football-card p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center opacity-50">
            <CalendarIcon className="w-12 h-12 text-yellow-900" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No Game History Yet</h3>
          <p className="text-gray-600 mb-8">
            Start playing games and saving sessions to see your history here!
          </p>
          <a
            href="/scheduler"
            className="gradient-button inline-flex items-center px-6 py-3 font-semibold"
          >
            <TrophyIcon className="w-5 h-5 mr-2" />
            Start Your First Game
          </a>
        </div>
      ) : (
        /* Sessions List and Details */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sessions List */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sessions</h2>
            <div className="space-y-4">
              {savedSessions.map((session) => (
                <div
                  key={session.id}
                  className={`football-card p-4 cursor-pointer transition-all duration-200 ${
                    selectedSession?.id === session.id ? 'border-yellow-400 shadow-team' : ''
                  }`}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(session.date).toLocaleDateString()}
                    </div>
                    <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                      session.isCompleted 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {session.isCompleted ? 'Completed' : 'In Progress'}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {session.teams.length} teams • {session.games.length} games
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {session.games.filter(g => g.isCompleted).length}/{session.games.length} completed
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSession(session);
                        }}
                        className="text-yellow-600 hover:text-yellow-700"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Details */}
          <div className="lg:col-span-2">
            {selectedSession ? (
              <div className="space-y-6">
                <div className="football-card p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {selectedSession.sessionName}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{selectedSession.teams.length}</div>
                      <div className="text-sm text-gray-600">Teams</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{selectedSession.games.length}</div>
                      <div className="text-sm text-gray-600">Games</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedSession.games.filter(g => g.isCompleted).length}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedSession.games.length * 7}m
                      </div>
                      <div className="text-sm text-gray-600">Duration</div>
                    </div>
                  </div>
                </div>

                {/* Final League Table */}
                <div className="football-card p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Final Standings</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full league-table">
                      <thead>
                        <tr className="table-header">
                          <th className="px-4 py-3 text-left">Pos</th>
                          <th className="px-4 py-3 text-left">Team</th>
                          <th className="px-4 py-3 text-center">P</th>
                          <th className="px-4 py-3 text-center">W</th>
                          <th className="px-4 py-3 text-center">D</th>
                          <th className="px-4 py-3 text-center">L</th>
                          <th className="px-4 py-3 text-center">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSession.teams.map((team, index) => (
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
                            <td className="px-4 py-3 text-center font-bold text-lg text-yellow-600">
                              {team.points}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Games Results */}
                <div className="football-card p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Match Results</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedSession.games.map((game) => (
                      <div key={game.id} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-500">Round {game.round}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            game.isCompleted 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {game.isCompleted ? 'Final' : 'Not Played'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="team-badge w-8 h-8 text-xs">
                              {game.homeTeam.charAt(0)}
                            </div>
                            <span className="font-medium text-sm">{game.homeTeam}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-lg">
                              {game.homeScore ?? '-'}
                            </span>
                            <span className="text-gray-400">-</span>
                            <span className="font-bold text-lg">
                              {game.awayScore ?? '-'}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{game.awayTeam}</span>
                            <div className="team-badge w-8 h-8 text-xs">
                              {game.awayTeam.charAt(0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="football-card p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center opacity-50">
                  <EyeIcon className="w-8 h-8 text-yellow-900" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Session</h3>
                <p className="text-gray-600">
                  Click on a session from the list to view its details
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}