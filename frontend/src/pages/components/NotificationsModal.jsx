import { FaTimes, FaCheck, FaTimes as FaXmark, FaPlus, FaCheckCircle } from "react-icons/fa";

export default function NotificationsModal({ 
  showNotificationBox, 
  setShowNotificationBox, 
  notifications, 
  handleNotificationAction,
  medicines 
}) {
  if (!showNotificationBox) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end p-4">
      <div className="bg-white rounded-lg shadow-xl w-96 max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
          <button
            onClick={() => setShowNotificationBox(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes size={16} />
          </button>
        </div>
        
        <div className="p-4 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <FaCheckCircle size={32} className="mx-auto" />
              </div>
              <p className="text-gray-500">No notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const medicine = medicines.find(m => m._id === notification.medicineId);
                return (
                  <div key={notification.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        notification.type === 'refill' 
                          ? 'bg-orange-100 text-orange-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {notification.type === 'refill' ? '🔄' : '⏰'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-800 text-sm">
                            {notification.name}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            notification.type === 'refill' 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {notification.type === 'refill' ? 'Refill' : 'Reminder'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {notification.msg}
                        </p>
                        {medicine && (
                          <div className="mt-2 text-xs text-gray-500 space-y-1">
                            {medicine.dosage && (
                              <div>💊 Dosage: {medicine.dosage}</div>
                            )}
                            {medicine.beforeAfterFood && (
                              <div>🍽️ {medicine.beforeAfterFood}</div>
                            )}
                            {notification.time && (
                              <div>🕐 Time: {notification.time}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {notification.type === 'refill' ? (
                      <div className="flex gap-2 mt-3">
                                                                         <button
                          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                          onClick={() => handleNotificationAction(notification.id, 'Refill', notification.medicineId)}
                        >
                          <FaPlus size={12} />
                          Refill Medicine
                        </button>
                        <button 
                          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                          onClick={() => handleNotificationAction(notification.id, 'Cured', notification.medicineId)}
                        >
                          <FaCheck size={12} />
                          Mark as Cured
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-3">
                        <button 
                          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                          onClick={() => handleNotificationAction(notification.id, 'Taken', notification.medicineId)}
                        >
                          <FaCheck size={12} />
                          Mark as Taken
                        </button>
                        <button 
                          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                          onClick={() => handleNotificationAction(notification.id, 'Skipped', notification.medicineId)}
                        >
                          <FaXmark size={12} />
                          Mark as Skipped
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 