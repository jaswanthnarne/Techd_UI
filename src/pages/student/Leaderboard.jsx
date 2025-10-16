import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StudentLayout from '../../components/layout/StudentLayout'; // Change this from Layout to StudentLayout
import Card from '../../components/ui/Card';
import { userCTFAPI } from '../../services/user';
import { 
  Trophy, 
  Crown,
  TrendingUp,
  User,
  Target
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

const Leaderboard = () => {
  const { id } = useParams(); // CTF ID for specific leaderboard
  const [leaderboard, setLeaderboard] = useState([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(id ? 'ctf' : 'global');

  useEffect(() => {
    fetchLeaderboard();
  }, [view, id]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      let response;
      
      if (view === 'global') {
        response = await userCTFAPI.getGlobalLeaderboard({ limit: 100 });
        setGlobalLeaderboard(response.data.leaderboard);
      } else if (id) {
        response = await userCTFAPI.getLeaderboard(id);
        setLeaderboard(response.data.leaderboard);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return <Crown className="h-6 w-6 text-yellow-500" />;
    } else if (rank === 2) {
      return <Trophy className="h-5 w-5 text-gray-400" />;
    } else if (rank === 3) {
      return <Trophy className="h-5 w-5 text-orange-500" />;
    }
    return <span className="text-lg font-semibold text-gray-500">{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-200';
    if (rank === 2) return 'bg-gray-50 border-gray-200';
    if (rank === 3) return 'bg-orange-50 border-orange-200';
    return 'bg-white border-gray-200';
  };

  const currentData = view === 'global' ? globalLeaderboard : leaderboard;

  return (
    <StudentLayout // Changed from Layout to StudentLayout
      title={view === 'global' ? "Global Leaderboard" : "CTF Leaderboard"} 
      subtitle={view === 'global' ? "Top performers across all challenges" : "Top performers in this challenge"}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* View Toggle */}
        {!id && (
          <Card>
            <Card.Content className="p-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setView('global')}
                  className={`flex-1 py-3 px-4 rounded-lg text-center transition-colors ${
                    view === 'global'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <TrendingUp className="h-5 w-5 mx-auto mb-2" />
                  <div className="font-medium">Global Leaderboard</div>
                  <div className="text-sm opacity-80">All-time top performers</div>
                </button>
                
                {id && (
                  <button
                    onClick={() => setView('ctf')}
                    className={`flex-1 py-3 px-4 rounded-lg text-center transition-colors ${
                      view === 'ctf'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Target className="h-5 w-5 mx-auto mb-2" />
                    <div className="font-medium">CTF Leaderboard</div>
                    <div className="text-sm opacity-80">This challenge only</div>
                  </button>
                )}
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Leaderboard */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              {view === 'global' ? 'Global Rankings' : 'CTF Rankings'}
            </h3>
          </Card.Header>
          <Card.Content>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader size="lg" />
              </div>
            ) : currentData.length > 0 ? (
              <div className="space-y-3">
                {/* Top 3 Podium */}
                {currentData.slice(0, 3).length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {currentData.slice(0, 3).map((entry, index) => (
                      <div
                        key={entry._id}
                        className={`p-6 rounded-lg border-2 text-center ${getRankColor(index + 1)}`}
                      >
                        <div className="flex justify-center mb-4">
                          {getRankBadge(index + 1)}
                        </div>
                        <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold mx-auto mb-3">
                          {entry.user.fullName.charAt(0)}
                        </div>
                        <h4 className="font-semibold text-gray-900 truncate">
                          {entry.user.fullName}
                        </h4>
                        <p className="text-sm text-gray-500 mb-2">{entry.user.specialization}</p>
                        <div className="text-2xl font-bold text-primary-600">
                          {entry.totalPoints || entry.points}
                        </div>
                        <div className="text-sm text-gray-500">points</div>
                        {entry.solveCount && (
                          <div className="text-xs text-gray-400 mt-1">
                            {entry.solveCount} solves
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Rest of the leaderboard */}
                <div className="space-y-2">
                  {currentData.slice(3).map((entry, index) => (
                    <div
                      key={entry._id}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 text-center">
                          <span className="text-lg font-semibold text-gray-500">
                            {index + 4}
                          </span>
                        </div>
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{entry.user.fullName}</h4>
                          <p className="text-sm text-gray-500">{entry.user.specialization}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary-600">
                          {entry.totalPoints || entry.points}
                        </div>
                        <div className="text-sm text-gray-500">points</div>
                        {entry.solveCount && (
                          <div className="text-xs text-gray-400">
                            {entry.solveCount} solves
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No rankings yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {view === 'global' 
                    ? 'Be the first to solve challenges and appear on the leaderboard!'
                    : 'No one has solved this challenge yet.'
                  }
                </p>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Statistics */}
        {currentData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <Card.Content className="text-center p-6">
                <div className="text-2xl font-bold text-primary-600">{currentData.length}</div>
                <div className="text-sm text-gray-500">Total Participants</div>
              </Card.Content>
            </Card>
            
            <Card>
              <Card.Content className="text-center p-6">
                <div className="text-2xl font-bold text-green-600">
                  {Math.max(...currentData.map(e => e.totalPoints || e.points))}
                </div>
                <div className="text-sm text-gray-500">Highest Score</div>
              </Card.Content>
            </Card>
            
            <Card>
              <Card.Content className="text-center p-6">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(currentData.reduce((sum, e) => sum + (e.totalPoints || e.points), 0) / currentData.length)}
                </div>
                <div className="text-sm text-gray-500">Average Score</div>
              </Card.Content>
            </Card>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default Leaderboard;