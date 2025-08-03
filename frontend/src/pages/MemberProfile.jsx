import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function MemberProfile({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // DOB selector states
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const handleDobSelect = () => {
    const formattedDob = `${selectedDay.toString().padStart(2, "0")}-${selectedMonth
      .toString()
      .padStart(2, "0")}-${selectedYear}`;
    setMember({ ...member, dob: formattedDob });
    setShowDobPicker(false);
  };

  // Fetch member + medicines
  useEffect(() => {
    if (!user) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/members/single/${id}`)
      .then((res) => res.json())
      .then((data) => setMember(data));

    fetch(`${import.meta.env.VITE_API_URL}/api/medicines/${user.uid}?memberId=${id}`)
      .then((res) => res.json())
      .then((data) => setMedicines(data));
  }, [id, user]);

  // Delete member
  const handleDelete = async () => {
    if (!window.confirm("Delete this member?")) return;
    await fetch(`${import.meta.env.VITE_API_URL}/api/members/${id}`, { method: "DELETE" });
    navigate("/profile");
  };

  // Save edited details
  const handleSave = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/members/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(member),
    });
    setIsEditing(false);
  };

  if (!member) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{member.memberName} - Profile</h1>

      {/* Member Info */}
      <div className="border p-4 rounded mb-6 bg-white shadow">
        {isEditing ? (
          <>
            <label className="block font-medium mt-2">Name</label>
            <input
              className="border p-2 w-full rounded"
              value={member.memberName}
              onChange={(e) =>
                setMember({ ...member, memberName: e.target.value })
              }
            />

            <label className="block font-medium mt-2">Age</label>
            <input
              type="number"
              className="border p-2 w-full rounded"
              value={member.age}
              onChange={(e) => setMember({ ...member, age: e.target.value })}
            />

            <label className="block font-medium mt-2">Date of Birth</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDobPicker(!showDobPicker)}
                className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-left"
              >
                <span
                  className={member.dob ? "text-gray-900" : "text-gray-500"}
                >
                  {member.dob ? member.dob : "Date of Birth"}
                </span>
              </button>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              {/* DOB Picker Modal */}
              {showDobPicker && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                  <div className="grid grid-cols-3 gap-4">
                    {/* Day */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Day
                      </label>
                      <select
                        value={selectedDay}
                        onChange={(e) =>
                          setSelectedDay(parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Array.from(
                          {
                            length: getDaysInMonth(selectedYear, selectedMonth),
                          },
                          (_, i) => i + 1
                        ).map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Month */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Month
                      </label>
                      <select
                        value={selectedMonth}
                        onChange={(e) =>
                          setSelectedMonth(parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {months.map((month, index) => (
                          <option key={index + 1} value={index + 1}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Year */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year
                      </label>
                      <select
                        value={selectedYear}
                        onChange={(e) =>
                          setSelectedYear(parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Array.from(
                          { length: 100 },
                          (_, i) => new Date().getFullYear() - i
                        ).map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={handleDobSelect}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDobPicker(false)}
                      className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <label className="block font-medium mt-2">Phone</label>
            <input
              className="border p-2 w-full rounded"
              placeholder="Indian"
              value={member.phone || ""}
              onChange={(e) => setMember({ ...member, phone: e.target.value })}
            />

            <label className="block font-medium mt-2">Medical Issues</label>
            <textarea
              className="border p-2 w-full rounded"
              value={member.medicalIssues || ""}
              onChange={(e) =>
                setMember({ ...member, medicalIssues: e.target.value })
              }
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p>
              <b>Age:</b> {member.age}
            </p>
            <p>
              <b>DOB:</b> {member.dob || "Not set"}
            </p>
            <p>
              <b>Phone:</b> {member.phone || "Not set"}
            </p>
            <p>
              <b>Medical Issues:</b> {member.medicalIssues || "None"}
            </p>
          </>
        )}
      </div>

      {/* Edit / Delete */}
      <div className="flex gap-4 mb-6">
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-yellow-500 px-4 py-2 text-white rounded"
          >
            Edit
          </button>
        )}
        <button
          onClick={handleDelete}
          className="bg-red-500 px-4 py-2 text-white rounded"
        >
          Delete
        </button>
      </div>

      {/* Medicine History */}
      <h2 className="text-xl font-semibold mb-2">Medicine History</h2>
      <ul className="space-y-2">
        {medicines.map((m) => (
          <li key={m._id} className="border p-2 rounded bg-white shadow">
            <b>{m.name}</b> - {m.dosage} ({m.timesPerDay}x/day, {m.durationDays}{" "}
            days)
          </li>
        ))}
      </ul>
    </div>
  );
}

