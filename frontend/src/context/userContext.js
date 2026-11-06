import React, { createContext, useContext, useEffect, useState } from "react";
import { getAllCourses } from "../APIs/user";
import { refreshRequest as loginMentor } from "../APIs/mentor";
import { refreshRequest as loginUser } from "../APIs/user";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [courses, setCourses] = useState([]);

  const refreshUser = async (currentUser) => {
    if (!currentUser) return;
    try {
      let refreshedUser = null;
      if (currentUser.Type === "Mentor") {
        const mentorRes = await loginMentor(currentUser._id);
        if (mentorRes.status === 200) refreshedUser = mentorRes.mentor;
        else setUser(null);
      } else {
        const userRes = await loginUser(currentUser._id);
        if (userRes.status === 200) refreshedUser = userRes.user;
        else setUser(null);
      }
      if (refreshedUser) setUser(refreshedUser);
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("User");
    if (storedUser) {
      let data = JSON.parse(storedUser);
      if (!data.Expertise) data.Expertise = {};
      setUser(data);
      refreshUser(data);
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("User", JSON.stringify(user));
    } else {
      localStorage.removeItem("User");
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) await refreshUser(user);
      try {
        const courseRes = await getAllCourses();
        if (courseRes.status === 200) setCourses(courseRes.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchData();
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("User");
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        courses,
        setCourses,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
