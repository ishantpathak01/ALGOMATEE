import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Logout as LogoutIcon,
  Person as ProfileIcon,
  Work as JobsIcon,
  School as CoursesIcon,
  Class as ClassroomIcon,
  People as MentorshipIcon,
  Chat as ChatsIcon,
  QuestionAnswer as QuestionsIcon,
  EmojiEvents as ContestsIcon,
  Settings as ManagementIcon,
  Menu as MenuIcon,
  ChevronLeft as CollapseIcon,
  ChevronRight as ExpandIcon,
} from "@mui/icons-material";
import { useAppContext } from "../../../context/userContext";
import { logout } from "../../../APIs/mentor";
import toast from "react-hot-toast";

const sidebarVariants = {
  expanded: { width: 280 },
  collapsed: { width: 80 },
};

const contentVariants = {
  expanded: { marginLeft: 280 },
  collapsed: { marginLeft: 80 },
};

const textVariants = {
  expanded: { opacity: 1, x: 0 },
  collapsed: { opacity: 0, x: -20 },
};

const iconVariants = {
  expanded: { marginRight: 12 },
  collapsed: { marginRight: 0 },
};

function Sidebar() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("profile");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const { user, setUser } = useAppContext();

  const navItems = [
    { id: "profile", label: "Profile", icon: <ProfileIcon /> },
    { id: "jobs", label: "Jobs", icon: <JobsIcon /> },
    { id: "courses", label: "Courses", icon: <CoursesIcon /> },
    { id: "classroom", label: "Classroom", icon: <ClassroomIcon /> },
    { id: "mentorship", label: "Mentorship", icon: <MentorshipIcon /> },
    { id: "chats", label: "Chats", icon: <ChatsIcon /> },
    { id: "questions", label: "Questions", icon: <QuestionsIcon /> },
    { id: "contests", label: "Contests", icon: <ContestsIcon /> },
    { id: "management", label: "Management", icon: <ManagementIcon /> },
  ];

  const handleNavigation = (id) => {
    navigate(`./${id}`);
    setCurrentView(id);
  };

  const handleLogOut = async () => {
    const res = await logout();
    if (res.status == 200) {
      toast.success(res.message);
      setUser(null);
      navigate("/auth/mentor");
    } else {
      toast.error(res.message);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 pt-16">
      <motion.aside
        initial={isCollapsed ? "collapsed" : "expanded"}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        className="fixed h-full z-40 bg-black_B border-r pl-1 border-gray-700 flex flex-col"
      >
        {/* Sidebar Header */}
        {isCollapsed ? (
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <button
              onClick={toggleSidebar}
              className="p-3 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              aria-label={"Expand sidebar"}
            >
              <ExpandIcon />
            </button>
          </div>
        ) : (
          <div className="flex absolute bg-black_B items-center justify-between p-0.5 top-8 right-[-20px] border border-gray-600 rounded-full">
            <button
              onClick={toggleSidebar}
              className="p-1 text-gray-300 hover:bg-gray-700 rounded-full hover:text-white transition-colors"
              aria-label={"Collapse sidebar"}
            >
              <CollapseIcon></CollapseIcon>
            </button>
          </div>
        )}

        {/* User Profile (hidden when collapsed) */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col items-center p-4 mt-2 border-b border-gray-700 overflow-hidden"
            >
              <img
                className="h-16 w-16 p-1 rounded-full border-4 border-gray-600 mb-3"
                src={user?.Picture}
                alt="User profile"
              />
              <h2 className="text-white font-medium text-center">
                {user?.Name}
              </h2>
              <p className="text-gray-400 text-sm text-center">{user?.Email}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`flex items-center w-full ${
                isCollapsed ? "p-3" : "p-2"
              } pl-3.5 rounded-lg mb-1 transition-colors ${
                currentView === item.id
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
              onClick={() => handleNavigation(item.id)}
            >
              <motion.span
                variants={iconVariants}
                animate={isCollapsed ? "collapsed" : "expanded"}
              >
                {item.icon}
              </motion.span>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    variants={textVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <div
          className={`absolute bottom-20 ${
            isCollapsed ? "w-2/3 ml-1" : "w-11/12"
          } left-3 border-t border-gray-700`}
        >
          <button
            className="flex items-center justify-center w-full p-3 mt-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            onClick={handleLogOut}
          >
            <motion.span
              variants={iconVariants}
              animate={isCollapsed ? "collapsed" : "expanded"}
            >
              <LogoutIcon />
            </motion.span>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  variants={textVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        initial={isCollapsed ? "collapsed" : "expanded"}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={contentVariants}
        className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-900 to-black"
      >
        <div className="p-6">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}

export default Sidebar;
