import { FaPlus, FaUser, FaUsers, FaHeart } from "react-icons/fa";

export default function MemberSelector({ 
  members, 
  selectedMember, 
  setSelectedMember, 
  displayName, 
  mainUser,
  user,
  setIsAddingMember 
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <FaUsers className="text-blue-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Family Members</h2>
            <p className="text-gray-500 text-sm">Select who you're managing medicines for</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsAddingMember(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-3 font-medium"
        >
          <FaPlus size={16} />
          <span className="hidden sm:inline">Add Member</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Main user card */}
        <div
          onClick={() => setSelectedMember('main')}
          className={`relative cursor-pointer rounded-xl p-6 border-2 transition-all duration-200 hover:shadow-md ${
            selectedMember === 'main'
              ? "border-blue-500 bg-blue-50 shadow-md"
              : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50"
          }`}
        >
          {selectedMember === 'main' && (
            <div className="absolute -top-2 -right-2 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center">
              <FaHeart className="text-white" size={12} />
            </div>
          )}
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
              selectedMember === 'main' ? 'bg-blue-500' : 'bg-gray-300'
            }`}>
              <FaUser className={`${selectedMember === 'main' ? 'text-white' : 'text-gray-600'}`} size={18} />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-lg ${selectedMember === 'main' ? 'text-blue-800' : 'text-gray-800'}`}>
                {displayName}
              </h3>
              <p className={`text-sm ${selectedMember === 'main' ? 'text-blue-600' : 'text-gray-500'}`}>
                {mainUser?.age ? `Age: ${mainUser.age} • ` : ''}{user?.email || 'Main Account'}
              </p>
            </div>
          </div>
          {selectedMember === 'main' && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-600 font-medium">Active</span>
                <span className="text-blue-500">●</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Member cards */}
        {members.map((member) => (
          <div
            key={member._id}
            onClick={() => setSelectedMember(member._id)}
            className={`relative cursor-pointer rounded-xl p-6 border-2 transition-all duration-200 hover:shadow-md ${
              selectedMember === member._id
                ? "border-green-500 bg-green-50 shadow-md"
                : "border-gray-200 bg-gray-50 hover:border-green-300 hover:bg-green-50"
            }`}
          >
            {selectedMember === member._id && (
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                <FaHeart className="text-white" size={12} />
              </div>
            )}
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                selectedMember === member._id ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                <FaUser className={`${selectedMember === member._id ? 'text-white' : 'text-gray-600'}`} size={18} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-lg ${selectedMember === member._id ? 'text-green-800' : 'text-gray-800'}`}>
                  {member.memberName}
                </h3>
                <p className={`text-sm ${selectedMember === member._id ? 'text-green-600' : 'text-gray-500'}`}>
                  Age: {member.age} • {member.email}
                </p>
              </div>
            </div>
            {selectedMember === member._id && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 font-medium">Active</span>
                  <span className="text-green-500">●</span>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Add member card */}
        <div
          onClick={() => setIsAddingMember(true)}
          className="cursor-pointer rounded-xl p-6 border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 hover:shadow-md"
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPlus className="text-gray-600" size={18} />
              </div>
              <h3 className="font-semibold text-gray-700 text-lg">Add New Member</h3>
              <p className="text-gray-500 text-sm">Family member or patient</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Help text */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 text-base">How it works</h4>
            <p className="text-blue-700 text-sm mt-2">
              Click on any family member card to manage their medicines. You can add multiple family members and track everyone's medications separately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 