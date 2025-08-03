import { useState, useEffect } from 'react';
import { FaChartLine, FaTable, FaCalendarAlt, FaUser, FaPills, FaCheckCircle, FaTimesCircle, FaArrowUp, FaArrowDown, FaSmile, FaMeh, FaFrown } from 'react-icons/fa';
import Header from './components/Header';
import NotificationsModal from './components/NotificationsModal';

export default function Analytics({ user }) {
  const [analytics, setAnalytics] = useState([]);
  const [trends, setTrends] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [dateRange, setDateRange] = useState('30');
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, trends
  const [displayName, setDisplayName] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotificationBox, setShowNotificationBox] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState(new Set());

  useEffect(() => {
    if (user) {
      // Get user's display name from the backend
      fetch(`http://localhost:5000/api/users/${user.uid}`)
        .then((res) => res.json())
        .then((data) => {
          setDisplayName(data?.name || user.email);
        })
        .catch(() => setDisplayName(user.email));
      
      fetchAnalytics();
    }
  }, [user, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/medicine-logs/analytics/${user.uid}?days=${dateRange}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Update main user's email with actual user email
      const updatedData = data.map(memberData => {
        if (memberData.member.isMainUser) {
          return {
            ...memberData,
            member: {
              ...memberData.member,
              email: user.email
            }
          };
        }
        return memberData;
      });
      
      setAnalytics(updatedData);
      
      // Fetch trends for each member
      const trendsData = {};
      for (const memberData of updatedData) {
        try {
          const trendsResponse = await fetch(`http://localhost:5000/api/medicine-logs/trends/${memberData.member.id}?days=${dateRange}&userId=${user.uid}`);
          if (trendsResponse.ok) {
            const memberTrends = await trendsResponse.json();
            trendsData[memberData.member.id] = memberTrends;
          }
        } catch (error) {
          console.error(`Error fetching trends for member ${memberData.member.id}:`, error);
        }
      }
      setTrends(trendsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics([]);
      setTrends({});
    } finally {
      setLoading(false);
    }
  };

  const getAdherenceColor = (rate) => {
    if (rate >= 90) return 'text-green-600 bg-green-50';
    if (rate >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getAdherenceIcon = (rate) => {
    if (rate >= 90) return <FaSmile className="text-green-500" />;
    if (rate >= 70) return <FaMeh className="text-yellow-500" />;
    return <FaFrown className="text-red-500" />;
  };

  const getAdherenceMessage = (rate) => {
    if (rate >= 90) return "Excellent! Keep up the great work!";
    if (rate >= 70) return "Good job! Try to take medicines more regularly.";
    return "Please try to take medicines on time more often.";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle notification actions (placeholder for Analytics page)
  const handleNotificationAction = async (id, action, medicineId) => {
    // Remove the notification from the list
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    // Mark as dismissed
    dismissedNotifications.add(id);
    setDismissedNotifications(new Set(dismissedNotifications));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          user={user}
          displayName={displayName}
          notifications={notifications}
          showNotificationBox={showNotificationBox}
          setShowNotificationBox={setShowNotificationBox}
          handleNotificationAction={handleNotificationAction}
          medicines={[]}
        />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user}
        displayName={displayName}
        notifications={notifications}
        showNotificationBox={showNotificationBox}
        setShowNotificationBox={setShowNotificationBox}
        handleNotificationAction={handleNotificationAction}
        medicines={[]}
      />
      
      {/* Notifications Modal */}
      <NotificationsModal 
        showNotificationBox={showNotificationBox}
        setShowNotificationBox={setShowNotificationBox}
        notifications={notifications}
        handleNotificationAction={handleNotificationAction}
        medicines={[]}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medicine Tracking Report</h1>
          <p className="text-gray-600 text-lg">See how well everyone is taking their medicines</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode('overview')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'overview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaChartLine className="inline mr-2" />
                Summary
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'detailed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaTable className="inline mr-2" />
                Medicine List
              </button>
              <button
                onClick={() => setViewMode('trends')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'trends'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaCalendarAlt className="inline mr-2" />
                Daily Progress
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Time Period:</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7">Last week</option>
                <option value="30">Last month</option>
                <option value="90">Last 3 months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Overview Mode */}
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {analytics.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <FaChartLine className="text-6xl text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">No Medicine Data Yet</h3>
                <p className="text-gray-500 mb-6 text-lg">
                  Start adding medicines and tracking doses to see your report here.
                </p>
                <div className="flex justify-center space-x-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-700">📊 Add medicines to family members</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-700">✅ Mark when medicines are taken</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-700">📈 See how well everyone is doing</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Family Members</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.length}</p>
                      </div>
                      <FaUser className="text-blue-600 text-2xl" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Medicines</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.reduce((sum, member) => sum + member.summary.totalMedicines, 0)}
                        </p>
                      </div>
                      <FaPills className="text-green-600 text-2xl" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Medicines Taken</p>
                        <p className="text-2xl font-bold text-green-600">
                          {analytics.reduce((sum, member) => sum + member.summary.totalTaken, 0)}
                        </p>
                      </div>
                      <FaCheckCircle className="text-green-600 text-2xl" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Medicines Missed</p>
                        <p className="text-2xl font-bold text-red-600">
                          {analytics.reduce((sum, member) => sum + member.summary.totalMissed, 0)}
                        </p>
                      </div>
                      <FaTimesCircle className="text-red-600 text-2xl" />
                    </div>
                  </div>
                </div>

                {/* Member Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analytics.map((memberData) => (
                    <div
                      key={memberData.member.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedMember(memberData)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900">{memberData.member.name}</h3>
                            {memberData.member.isMainUser && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{memberData.member.email}</p>
                        </div>
                        <div className="text-2xl">
                          {getAdherenceIcon(memberData.summary.adherenceRate)}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Medicines:</span>
                          <span className="font-medium">{memberData.summary.totalMedicines}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Taken:</span>
                          <span className="font-medium text-green-600">{memberData.summary.totalTaken}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Missed:</span>
                          <span className="font-medium text-red-600">{memberData.summary.totalMissed}</span>
                        </div>
                      </div>

                      {/* Simple Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>How well they're doing:</span>
                          <span>{memberData.summary.adherenceRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${
                              memberData.summary.adherenceRate >= 90
                                ? 'bg-green-500'
                                : memberData.summary.adherenceRate >= 70
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${memberData.summary.adherenceRate}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {getAdherenceMessage(memberData.summary.adherenceRate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Detailed View Mode */}
        {viewMode === 'detailed' && (
          <div className="space-y-6">
            {analytics.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <FaTable className="text-6xl text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">No Medicine List Available</h3>
                <p className="text-gray-500">Add medicines and track doses to see the detailed list.</p>
              </div>
            ) : (
              analytics.map((memberData) => (
              <div key={memberData.member.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-semibold text-gray-900">{memberData.member.name}</h3>
                        {memberData.member.isMainUser && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500">{memberData.member.email}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`px-4 py-2 rounded-full text-sm font-medium ${getAdherenceColor(memberData.summary.adherenceRate)}`}>
                        {getAdherenceIcon(memberData.summary.adherenceRate)}
                        <span className="ml-2">{memberData.summary.adherenceRate}% Good</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Medicine Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Dosage</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">Times/Day</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">Taken</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">Missed</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">How Well</th>
                        </tr>
                      </thead>
                      <tbody>
                        {memberData.medicines.map((medicine) => (
                          <tr key={medicine.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900">{medicine.name}</div>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{medicine.dosage || 'Not set'}</td>
                            <td className="py-3 px-4 text-center text-gray-600">{medicine.timesPerDay || 'Not set'}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-green-600 font-medium">{medicine.taken}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-red-600 font-medium">{medicine.missed}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAdherenceColor(medicine.adherenceRate)}`}>
                                {medicine.adherenceRate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        )}

        {/* Trends Mode - Simplified for Older People */}
        {viewMode === 'trends' && (
          <div className="space-y-6">
            {analytics.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">No Daily Progress Available</h3>
                <p className="text-gray-500">Add medicines and track doses to see daily progress.</p>
              </div>
            ) : (
              analytics.map((memberData) => (
              <div key={memberData.member.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-semibold text-gray-900">{memberData.member.name} - Daily Progress</h3>
                    {memberData.member.isMainUser && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getAdherenceColor(memberData.summary.adherenceRate)}`}>
                    {memberData.summary.adherenceRate}% Overall
                  </div>
                </div>

                {trends[memberData.member.id] && trends[memberData.member.id].length > 0 ? (
                  <div className="space-y-4">
                    {/* Simple Daily Progress */}
                    <div className="text-center mb-4">
                      <h4 className="text-lg font-medium text-gray-700 mb-2">How many medicines were taken each day:</h4>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {trends[memberData.member.id].slice(-7).map((day, index) => {
                        const total = day.taken + day.missed;
                        const percentage = total > 0 ? Math.round((day.taken / total) * 100) : 0;
                        
                        return (
                          <div key={index} className="text-center">
                            <div className="mb-2">
                              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                percentage >= 90 ? 'bg-green-500' :
                                percentage >= 70 ? 'bg-yellow-500' :
                                percentage > 0 ? 'bg-red-500' : 'bg-gray-300'
                              }`}>
                                {percentage}%
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(day.date)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {day.taken} taken, {day.missed} missed
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Simple Legend */}
                    <div className="flex items-center justify-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">90%+ (Great!)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                        <span className="text-gray-600">70-89% (Good)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span className="text-gray-600">Below 70% (Need to improve)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FaCalendarAlt className="text-4xl mx-auto mb-4 text-gray-300" />
                    <p>No daily progress data available for the selected time period</p>
                  </div>
                )}
              </div>
            ))
            )}
          </div>
        )}

        {/* Member Detail Modal */}
        {selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedMember.member.name} - Detailed Report</h2>
                    {selectedMember.member.isMainUser && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimesCircle size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Member Info</h3>
                    <p className="text-sm text-blue-700">Email: {selectedMember.member.email}</p>
                    <p className="text-sm text-blue-700">Age: {selectedMember.member.age || 'Not set'}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">Summary</h3>
                    <p className="text-sm text-green-700">Total Medicines: {selectedMember.summary.totalMedicines}</p>
                    <p className="text-sm text-green-700">How Well: {selectedMember.summary.adherenceRate}%</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2">Activity</h3>
                    <p className="text-sm text-yellow-700">Taken: {selectedMember.summary.totalTaken}</p>
                    <p className="text-sm text-yellow-700">Missed: {selectedMember.summary.totalMissed}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Medicine Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Dosage</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">Times/Day</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">Taken</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">Missed</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">How Well</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMember.medicines.map((medicine) => (
                        <tr key={medicine.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{medicine.name}</div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{medicine.dosage || 'Not set'}</td>
                          <td className="py-3 px-4 text-center text-gray-600">{medicine.timesPerDay || 'Not set'}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-green-600 font-medium">{medicine.taken}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-red-600 font-medium">{medicine.missed}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAdherenceColor(medicine.adherenceRate)}`}>
                              {medicine.adherenceRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 