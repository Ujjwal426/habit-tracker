import React from "react";

const Navbar = ({ sections, currentSection, onSectionChange }) => {
  return (
    <nav className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-check text-lg"></i>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">
                Habit Tracker
              </span>
              <p className="text-xs text-gray-500 hidden sm:block">
                Build Better Habits
              </p>
            </div>
          </div>

          <ul className="flex items-center gap-1 sm:gap-2">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => onSectionChange(section.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    currentSection === section.id
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-gray-900 shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md"
                  }`}
                >
                  <i
                    className={`fas ${section.icon} ${currentSection === section.id ? "text-gray-900" : "text-indigo-500"}`}
                  ></i>
                  <span className="hidden sm:inline">{section.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
