import React, { useState, useEffect } from "react";
import { Bell, Search, Trophy } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { userAPI } from "../../services/user";

const StudentHeader = ({ title, subtitle }) => {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const fetchUserPoints = async () => {
      try {
        const response = await userAPI.getDashboard();

        // Access points from the correct path based on your API response
        const userPoints = response.data.stats?.submissions?.totalPoints || 0;
        setPoints(userPoints);
      } catch (error) {
        console.error("Failed to fetch user points:", error);
        // Fallback to user points from auth context if available
        if (user?.points) {
          setPoints(user.points);
        }
      }
    };

    fetchUserPoints();
  }, [user]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Points Display */}
            <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                {points} pts
              </span>
            </div>

            {/* Search - Optional */}
            {/* <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search..."
              />
            </div> */}

            {/* Notifications - Optional */}
            {/* <button className="relative p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button> */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;
