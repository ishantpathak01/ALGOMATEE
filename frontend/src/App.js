import React, { useEffect, useState, lazy, Suspense } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Preloader from "./components/general/preloader";
import Header from "./components/general/header";
import Footer from "./components/general/footer";
import Sidebar from "./components/general/sidebar";
import { useAppContext } from "./context/userContext";
import NOT_FOUND_IMG from "./assets/Illustrations/Not_Found_01.svg";
import ScrollToUp from "./components/scrollToUp";
import MentorQuestions from "./Views/dashboard/mentor/questions";

// Lazy Loading Components
const Homepage = lazy(() => import("./Views/homepage"));
const CourseInfo = lazy(() => import("./Views/courseInfo"));
const AuthenticationUser = lazy(() => import("./Views/Auth/userAuth.js"));
const AuthenticationMentor = lazy(() => import("./Views/Auth/mentorAuth.js"));
const MentorSearch = lazy(() => import("./Views/mentorSearch"));
const MentorInfo = lazy(() => import("./Views/mentorInfo"));
const JobSearch = lazy(() => import("./Views/JobSearch"));
const DashboardMentor = lazy(() =>
  import("./components/dashboard/mentor/sidebar")
);
const DashboardUser = lazy(() => import("./components/dashboard/user/sidebar"));
const PracticeCoding = lazy(() => import("./Views/practice/coding/practice"));
const PracticeDev = lazy(() =>
  import("./Views/practice/development/devPractice")
);

const MentorProfile = lazy(() => import("./Views/dashboard/mentor/profile"));
const MentorJobs = lazy(() => import("./Views/dashboard/mentor/jobs"));
const MentorChats = lazy(() => import("./Views/dashboard/mentor/chats"));
const MentorMentorship = lazy(() =>
  import("./Views/dashboard/mentor/mentorship")
);
const MentorCourses = lazy(() => import("./Views/dashboard/mentor/courses"));
const NewArticle = lazy(() => import("./Views/dashboard/mentor/newArticle"));
const Management = lazy(() => import("./Views/dashboard/mentor/management"));
const MentorContests = lazy(() => import("./Views/dashboard/mentor/contests"));
const ClassroomMentor = lazy(() =>
  import("./Views/dashboard/mentor/classroom")
);
const ClassroomNotesMentor = lazy(() =>
  import("./components/dashboard/mentor/classroom/notes")
);
const ClassroomAssignmentsMentor = lazy(() =>
  import("./components/dashboard/mentor/classroom/assignments")
);
const ClassroomStudents = lazy(() =>
  import("./components/dashboard/mentor/classroom/students")
);
const ClassroomNotesEditor = lazy(() => import("./Views/notesEditor"));
const ClassroomNotesUser = lazy(() =>
  import("./components/dashboard/user/classroom/notes")
);
const ClassroomAssignmentsUser = lazy(() =>
  import("./components/dashboard/user/classroom/assignments")
);
const TopicExplaination = lazy(() =>
  import("./Views/courseTopic/explaination")
);
const SkillTest = lazy(() => import("./Views/courseTopic/skillTest"));
const UserChats = lazy(() => import("./Views/dashboard/user/chats"));
const ClassroomUser = lazy(() => import("./Views/dashboard/user/classroom"));
const ClassroomAssignmentsInfo = lazy(() =>
  import("./components/dashboard/user/classroom/assignmentInfo")
);
const DoubtSessionMentor = lazy(() =>
  import("./Views/dashboard/mentor/videoCall")
);
const DoubtSessionUser = lazy(() => import("./Views/dashboard/user/videoCall"));
const UserProfile = lazy(() => import("./Views/dashboard/user/profile"));
const UserStudyPlansList = lazy(() =>
  import("./Views/dashboard/user/blueprint/blueprintsList")
);
const UserStudyPlan = lazy(() =>
  import("./Views/dashboard/user/blueprint/blueprint")
);
const CreateUserStudyPlan = lazy(() =>
  import("./Views/dashboard/user/blueprint/createBlueprint")
);
const UserDoubts = lazy(() => import("./Views/dashboard/user/doubts"));
const ProblemsSheet = lazy(() => import("./Views/courseTopic/problemsSheet"));
const PageNotFound = lazy(() => import("./Views/general/PageNotFound"));
const AdminPanel = lazy(() => import("./Views/admin/adminPanel"));
const AboutUs = lazy(() => import("./Views/general/AboutUs"));
const ContactUs = lazy(() => import("./Views/general/ContactUs"));
const TermAndConditions = lazy(() =>
  import("./Views/general/TermAndConditions")
);
const PrivacyAndPolicy = lazy(() => import("./Views/general/PrivacyAndPolicy"));
const AssessmentTest = lazy(() => import("./Views/assessment/assessment"));
const CodingSheet = lazy(() => import("./Views/codingSheet"));
const ResumeAnalyzer = lazy(() => import("./Views/resumeAnalyzer"));

function App() {
  const [isMobile, setIsMobile] = useState(true);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { user } = useAppContext();
  const UserRoute = ({ element, redirectTo }) => {
    console.log(user);
    console.log("user routes");

    return user && user.Type == "User" ? (
      element
    ) : (
      <Navigate to={"/auth/user"} />
    );
  };

  const MentorRoute = ({ element, redirectTo }) => {
    console.log(user);
    console.log("mentor routes");

    return user && user.Type == "Mentor" ? (
      element
    ) : (
      <Navigate to={"/auth/mentor"} />
    );
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <>
      {loading ? (
        <Preloader />
      ) : (
        <>
          {isMobile ? (
            <div className="App font-roboto">
              <Toaster position="bottom-right" />
              <Router>
                <Header />
                <ScrollToUp />
                <Routes>
                  {/* Public Routes */}
                  <Route
                    path="/"
                    element={
                      <>
                        <Homepage />
                        <Footer />
                      </>
                    }
                  />
                  <Route path="/auth/user" element={<AuthenticationUser />} />
                  <Route
                    path="/auth/mentor"
                    element={<AuthenticationMentor />}
                  />
                  <Route path="/course" element={<Sidebar />}>
                    <Route path=":id" element={<CourseInfo />} />
                    <Route
                      path=":id/:topic/documentation"
                      element={<TopicExplaination />}
                    />
                    <Route
                      path=":id/:topic/sheet"
                      element={<ProblemsSheet />}
                    />
                    <Route
                      path=":id/:topic/skillTest"
                      element={<SkillTest />}
                    />
                  </Route>
                  <Route
                    path="/mentorSearch"
                    element={
                      <>
                        <MentorSearch />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/resumeAnalyzer"
                    element={
                      <>
                        <ResumeAnalyzer />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/mentorSearch/:id"
                    element={
                      <>
                        <MentorInfo />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/jobs"
                    element={
                      <>
                        <JobSearch />
                        <Footer />
                      </>
                    }
                  />

                  <Route
                    path="/sheet"
                    element={
                      <>
                        <CodingSheet />
                        <Footer />
                      </>
                    }
                  />

                  {/* Protected Routes */}
                  <Route
                    path="/dashboard/user"
                    element={
                      <UserRoute
                        element={<DashboardUser />}
                        redirectTo="/auth/user"
                      />
                    }
                  >
                    <Route path="chats" element={<UserChats />} />
                    <Route path="profile" element={<UserProfile />} />
                    <Route path="doubts" element={<UserDoubts />} />
                    <Route path="blueprints" element={<UserStudyPlansList />} />
                    <Route
                      path="blueprints/:planId"
                      element={<UserStudyPlan />}
                    />
                    <Route
                      path="blueprints/create"
                      element={<CreateUserStudyPlan />}
                    />

                    <Route
                      path="doubt-session"
                      element={<DoubtSessionUser />}
                    />
                    <Route path="classroom" element={<ClassroomUser />} />
                    <Route path="classroom/:name">
                      <Route
                        path="notes"
                        element={<ClassroomNotesUser></ClassroomNotesUser>}
                      ></Route>
                      <Route
                        path="assignments"
                        element={
                          <ClassroomAssignmentsUser></ClassroomAssignmentsUser>
                        }
                      ></Route>
                      <Route
                        path="assignments/:assignmentId"
                        element={
                          <ClassroomAssignmentsInfo></ClassroomAssignmentsInfo>
                        }
                      ></Route>
                    </Route>
                  </Route>
                  <Route
                    path="/user/assessment/:topic"
                    element={<AssessmentTest />}
                  />
                  <Route
                    path="/dashboard/mentor"
                    element={
                      <MentorRoute
                        element={<DashboardMentor />}
                        redirectTo="/auth/mentor"
                      />
                    }
                  >
                    <Route path="profile" element={<MentorProfile />} />
                    <Route path="jobs" element={<MentorJobs />} />
                    <Route path="mentorship" element={<MentorMentorship />} />
                    <Route path="courses" element={<MentorCourses />} />
                    <Route path="classroom" element={<ClassroomMentor />} />
                    <Route path="classroom/:name">
                      <Route
                        path="notes"
                        element={<ClassroomNotesMentor></ClassroomNotesMentor>}
                      ></Route>
                      <Route
                        path="assignments"
                        element={
                          <ClassroomAssignmentsMentor></ClassroomAssignmentsMentor>
                        }
                      ></Route>
                      <Route
                        path="students"
                        element={<ClassroomStudents></ClassroomStudents>}
                      ></Route>
                    </Route>
                    <Route path="newArticle" element={<NewArticle />} />
                    <Route path="chats" element={<MentorChats />} />
                    <Route
                      path="doubt-session"
                      element={<DoubtSessionMentor />}
                    />
                    <Route path="questions" element={<MentorQuestions />} />
                    <Route path="contests" element={<MentorContests />} />
                    <Route path="management" element={<Management />} />
                  </Route>
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route
                    path="/*"
                    element={<PageNotFound></PageNotFound>}
                  ></Route>
                  <Route
                    path="/notesEditor"
                    element={<ClassroomNotesEditor></ClassroomNotesEditor>}
                  ></Route>
                  <Route path="/aboutUs" element={<AboutUs></AboutUs>}></Route>
                  <Route
                    path="/contactUs"
                    element={<ContactUs></ContactUs>}
                  ></Route>
                  <Route
                    path="/termsAndConditions"
                    element={<TermAndConditions></TermAndConditions>}
                  ></Route>
                  <Route
                    path="/privacyPolicy"
                    element={<PrivacyAndPolicy></PrivacyAndPolicy>}
                  ></Route>

                  <Route
                    path="/practice/coding/:problemId"
                    element={
                      <>
                        <PracticeCoding />
                      </>
                    }
                  />
                  <Route
                    path="/practice/development/:problemId"
                    element={
                      <>
                        <PracticeDev />
                      </>
                    }
                  />
                </Routes>
              </Router>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center p-8 h-screen bg-black_A">
              <img src={NOT_FOUND_IMG} className="w-4/5 mb-10"></img>
              <h2 className="text-center text-lg font-serif text-blue-100 text-opacity-75">
                This website is not optimized for mobile screens. Please access
                it on a desktop or larger screen for the best experience.
              </h2>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default App;
