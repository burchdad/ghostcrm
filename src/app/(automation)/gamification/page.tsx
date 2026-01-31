"use client";
import React from 'react';
import ComingSoonWrapper from '@/components/feedback/ComingSoonWrapper';

function GamificationContent() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gamification & Motivation</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            🎯 Set Challenge
          </button>
          <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
            🏆 View Rewards
          </button>
        </div>
      </div>

      {/* Achievement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Your Level</p>
              <p className="text-2xl font-bold text-purple-600">12</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              ⭐
            </div>
          </div>
          <p className="text-sm text-purple-600 mt-2">Senior Sales Rep</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Points</p>
              <p className="text-2xl font-bold text-blue-600">15,430</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              💎
            </div>
          </div>
          <p className="text-sm text-blue-600 mt-2">+320 this week</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Achievements</p>
              <p className="text-2xl font-bold text-green-600">47</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              🏆
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">3 new this month</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Team Rank</p>
              <p className="text-2xl font-bold text-orange-600">#3</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              🥉
            </div>
          </div>
          <p className="text-sm text-orange-600 mt-2">of 25 members</p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">🏆 Team Leaderboard</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <div className="font-medium">Sarah Johnson</div>
                  <div className="text-sm text-gray-600">18,250 points</div>
                </div>
              </div>
              <div className="text-2xl">🥇</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-gray-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <div className="font-medium">Mike Chen</div>
                  <div className="text-sm text-gray-600">16,890 points</div>
                </div>
              </div>
              <div className="text-2xl">🥈</div>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
              <div className="flex items-center gap-3">
                <div className="bg-orange-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <div className="font-medium">You</div>
                  <div className="text-sm text-gray-600">15,430 points</div>
                </div>
              </div>
              <div className="text-2xl">🥉</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">🎯 Active Challenges</h3>
          <div className="space-y-3">
            <div className="p-3 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Deal Closer Challenge</h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Active</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Close 10 deals this month</p>
              <div className="flex justify-between items-center">
                <div className="bg-gray-200 rounded-full h-2 flex-1 mr-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
                <span className="text-sm text-gray-600">6/10</span>
              </div>
            </div>

            <div className="p-3 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Lead Generator</h4>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Generate 25 qualified leads</p>
              <div className="flex justify-between items-center">
                <div className="bg-gray-200 rounded-full h-2 flex-1 mr-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '80%'}}></div>
                </div>
                <span className="text-sm text-gray-600">20/25</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">🏅 Recent Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">🎯</div>
              <h4 className="font-medium">Sharp Shooter</h4>
            </div>
            <p className="text-sm text-gray-700">Achieved 90% lead conversion rate</p>
            <p className="text-xs text-purple-600 mt-1">+500 points</p>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">💰</div>
              <h4 className="font-medium">Revenue Rockstar</h4>
            </div>
            <p className="text-sm text-gray-700">Generated $50K+ in monthly revenue</p>
            <p className="text-xs text-blue-600 mt-1">+750 points</p>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">⚡</div>
              <h4 className="font-medium">Speed Demon</h4>
            </div>
            <p className="text-sm text-gray-700">Responded to leads within 5 minutes</p>
            <p className="text-xs text-green-600 mt-1">+300 points</p>
          </div>
        </div>
      </div>

      {/* Rewards Store */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">🛍️ Rewards Store</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg text-center">
            <div className="text-3xl mb-2">☕</div>
            <h4 className="font-medium mb-1">Coffee Gift Card</h4>
            <p className="text-sm text-gray-600 mb-2">$25 Starbucks</p>
            <div className="text-purple-600 font-semibold mb-2">1,000 points</div>
            <button className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
              Redeem
            </button>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg text-center">
            <div className="text-3xl mb-2">🎧</div>
            <h4 className="font-medium mb-1">Wireless Headphones</h4>
            <p className="text-sm text-gray-600 mb-2">Premium Audio</p>
            <div className="text-purple-600 font-semibold mb-2">5,000 points</div>
            <button className="w-full px-3 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed text-sm">
              Not Enough Points
            </button>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg text-center">
            <div className="text-3xl mb-2">🏖️</div>
            <h4 className="font-medium mb-1">Extra PTO Day</h4>
            <p className="text-sm text-gray-600 mb-2">Paid time off</p>
            <div className="text-purple-600 font-semibold mb-2">3,000 points</div>
            <button className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
              Redeem
            </button>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg text-center">
            <div className="text-3xl mb-2">💰</div>
            <h4 className="font-medium mb-1">Cash Bonus</h4>
            <p className="text-sm text-gray-600 mb-2">$500 bonus</p>
            <div className="text-purple-600 font-semibold mb-2">10,000 points</div>
            <button className="w-full px-3 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed text-sm">
              Not Enough Points
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GamificationPage() {
  return (
    <ComingSoonWrapper 
      feature="gamification" 
      enabled={false}
      comingSoonDate="May 2026"
      description="Sales gamification with leaderboards, achievements, challenges, and reward systems"
    >
      <GamificationContent />
    </ComingSoonWrapper>
  );
}
