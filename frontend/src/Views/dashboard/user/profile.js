import React, { useEffect, useState, lazy, Suspense } from "react";
import "react-calendar-heatmap/dist/styles.css";
import { Select, MenuItem, FormControl, IconButton } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useAppContext } from "../../../context/userContext";
import { motion } from "framer-motion";
import { updateUserProfile, getSubmissions } from "../../../APIs/user";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import LeetCode_SVG from "../../../assets/Logos/coding-Platforms/leetcode_white.svg";
import COINS_ANIMATION from "../../../assets/Icons/coins.gif";
import CoinHistoryModel from "../../../components/dashboard/user/profile/coinsHistory";
import CalendarHeatmap from "react-calendar-heatmap";
import GitHubIcon from "@mui/icons-material/GitHub";
import LanguageIcon from "@mui/icons-material/Language";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import AddAPhotoOutlinedIcon from "@mui/icons-material/AddAPhotoOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

function Profile() {
  const { user, setUser } = useAppContext();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const [editing, setEditing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [startDate, setStartDate] = useState(new Date(`${selectedYear}-01-01`));
  const [endDate, setEndDate] = useState(new Date(`${selectedYear}-12-31`));
  const [picture, setPicture] = useState(null);
  const [submissions, setSubmissions] = useState(null);
  const [updatedUser, setUpdatedUser] = useState({
    ...user,
    Expertise: user?.Expertise || {},
  });

  const [coinHistoryModel, setCoinHistoryModel] = useState(false);

  const handleYearChange = (event) => {
    const year = parseInt(event.target.value);
    setSelectedYear(year);
    setStartDate(new Date(`${year}-01-01`));
    setEndDate(new Date(`${year}-12-31`));
  };

  const [openIndex, setOpenIndex] = useState(null);

  const toggleCode = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  const handleUpdateProfile = async () => {
    let btn = document.getElementById("update");
    btn.disabled = true;
    btn.style.cssText = "cursor: not-allowed; opacity: 50%;";

    const formData = new FormData();
    formData.append("Id", user?._id);
    formData.append("Data", JSON.stringify(updatedUser));
    formData.append("Picture", picture);

    let res = await updateUserProfile(formData);
    if (res.status == 200) {
      toast.success(res.message);
      setUser(updatedUser);
      if (picture) setUser({ ...user, Picture: URL.createObjectURL(picture) });
      setEditing(false);
    } else {
      toast.error(res.message);
      setUpdatedUser(user);
    }
    btn.disabled = false;
    btn.style.cssText = "cursor: pointer; opacity: 100%;";
  };

  useEffect(() => {
    const getSubmissionsData = async () => {
      let res = await getSubmissions({ Id: user?._id });
      if (res.status == 200) {
        setSubmissions(res.data);
      }
    };
    getSubmissionsData();
  }, []);

  const [heatmapValues, setHeatmapValues] = useState([]);

  useEffect(() => {
    if (!submissions) return;

    const transformedValues = Object.entries(
      submissions?.Submissions || {}
    ).map(([date, count]) => ({
      date,
      count,
    }));

    setHeatmapValues(transformedValues);
  }, [submissions]);

  return (
    <div className="relative text-white min-h-screen flex flex-col items-center p-8 text-center tracking-wider">
      <button
        onClick={() => setCoinHistoryModel(true)}
        className="absolute right-60 w-28 flex flex-row items-center justify-between pl-3 top-4 pr-3 border focus:outline-none font-medium rounded-lg text-sm text-center me-2 mb-2 border-yellow-500 text-slate-500 hover:text-white hover:bg-gradient-to-br hover:from-[#e37210] hover:to-[#b6861e] focus:ring-slate-500"
      >
        <img src={COINS_ANIMATION} className="h-10 w-10 " alt="coins" />
        <h2 className="text-2xl font-teko mt-1 mr-2 text-yellow-400">
          {user?.Coins}
        </h2>
        <div className="relative group">
          <InfoOutlinedIcon fontSize="extra-small" sx={{ color: "#7d7d7c" }} />
          <div className="absolute hidden group-hover:block bg-slate-800 backdrop-blur-sm border border-slate-600 bg-opacity-85 z-50 bottom-9 rounded-md right-[-30px] p-2 font-thin text-xsm text-white w-60">
            Earn 1 coin daily by solving a question. Use these coins to ask
            doubts from mentors.
          </div>
        </div>
      </button>
      {coinHistoryModel && (
        <CoinHistoryModel
          open={true}
          onClose={() => setCoinHistoryModel(false)}
        ></CoinHistoryModel>
      )}

      {editing ? (
        <button
          onClick={handleUpdateProfile}
          id="update"
          className="absolute right-20 w-32 flex flex-row items-center justify-center top-4 space-x-2 border focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 border-slate-500 text-slate-500 hover:text-white hover:bg-slate-800 focus:ring-slate-500"
        >
          <h2>Update</h2>
          <TaskAltIcon fontSize="small"></TaskAltIcon>
        </button>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="absolute right-20 w-32 flex flex-row items-center justify-center top-4 space-x-2 border focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 border-slate-500 text-slate-500 hover:text-white hover:bg-slate-800 focus:ring-slate-500"
        >
          <h2>Edit</h2>
          <TaskAltIcon fontSize="small"></TaskAltIcon>
        </button>
      )}
      <div
        className="flex flex-row gap-6 justify-center items-center w-11/12 bg-gray-800 bg-opacity-50 p-8 rounded-xl shadow-xl border border-gray-700 backdrop-blur-lg mt-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-gray-900 p-6 rounded-lg flex flex-col items-center shadow-lg border border-gray-700 backdrop-blur-md">
          {editing ? (
            <label className="h-36 w-36 rounded-full bg-slate-400 shadow-lg text-slate-900 flex justify-center items-center border-2 border-slate-900 hover:bg-opacity-55 transition-all duration-200 cursor-pointer">
              <AddAPhotoOutlinedIcon sx={{ fontSize: "40px" }} />
              <input
                onChange={(e) => {
                  setPicture(e.target.files[0]);
                }}
                type="file"
                accept="image/png"
                className="hidden"
              />
            </label>
          ) : (
            <img
              src={user?.Picture}
              className="w-36 h-36 p-1 rounded-full shadow-md border-4 border-gray-700"
              alt="Profile"
            />
          )}
          {!editing ? (
            <h2 className="text-xl font-semibold text-gray-100 mt-4">
              {user?.Name}
            </h2>
          ) : (
            <input
              className="m-2 rounded text-sm p-1 pl-2 bg-slate-400 bg-opacity-45"
              placeholder="Name"
              value={updatedUser?.Name}
              onChange={(e) => {
                setUpdatedUser((prev) => ({
                  ...prev,
                  Name: e.target.value,
                }));
              }}
            ></input>
          )}
          <h3 className="text-gray-400 text-sm">{user?.Email}</h3>
        </div>
        <div className="flex flex-col justify-between space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg flex flex-col shadow-lg w-full border items-center justify-center h-36 text-center border-gray-700 backdrop-blur-md">
            {editing ? (
              <textarea
                className="text-lg font-light leading-relaxed text-gray-400 bg-slate-400 bg-opacity-40 rounded-lg p-4 focus:outline-none"
                value={updatedUser?.Bio || ""}
                placeholder="Enter details about yourself. (max 200 chars)"
                rows={4}
                cols={58}
                name="About"
                maxLength={200}
                onChange={(e) => {
                  setUpdatedUser((prev) => ({
                    ...prev,
                    Bio: e.target.value,
                  }));
                }}
              ></textarea>
            ) : (
              <p className="text-md p-4 opacity-75 text-center">
                {user?.Bio ||
                  "Tell the world about yourself! Add a bio to share your interests, experiences, or anything that makes you unique."}
              </p>
            )}
          </div>

          <div className="bg-gray-900 p-6 rounded-lg flex flex-col shadow-lg border border-gray-700 backdrop-blur-md">
            {editing ? (
              <div className="flex flex-row justify-center items-center space-x-3 pl-2 pr-2">
                <h1 className="flex flex-row space-x-1 justify-center items-center">
                  <GitHubIcon />
                  <input
                    type="text"
                    className="bg-gray-800 text-white w-24 text-sm p-1 pl-2 rounded-md outline-none border border-gray-600 focus:ring-2 focus:ring-blue-500"
                    placeholder="GitHub"
                    name="GitHub"
                    value={updatedUser?.ProfileLinks?.GitHub}
                    onChange={(e) => {
                      setUpdatedUser((prev) => ({
                        ...prev,
                        ProfileLinks: {
                          ...prev.ProfileLinks,
                          GitHub: e.target.value,
                        },
                      }));
                    }}
                  />
                </h1>
                <p>|</p>
                <h1 className="flex flex-row space-x-1 justify-center items-center">
                  <LanguageIcon />
                  <input
                    type="text"
                    className="bg-gray-800 text-white w-24 text-sm p-1 pl-2 rounded-md outline-none border border-gray-600 focus:ring-2 focus:ring-blue-500"
                    placeholder="Portfolio"
                    name="Portfolio"
                    value={updatedUser?.ProfileLinks?.Portfolio}
                    onChange={(e) => {
                      setUpdatedUser((prev) => ({
                        ...prev,
                        ProfileLinks: {
                          ...prev.ProfileLinks,
                          Portfolio: e.target.value,
                        },
                      }));
                    }}
                  />
                </h1>
                <p>|</p>
                <h1 className="flex flex-row space-x-1 justify-center items-center">
                  <img src={LeetCode_SVG} className="w-5 h-5" alt="leetcode" />
                  <input
                    type="text"
                    className="bg-gray-800 text-white w-24  text-sm p-1 pl-2 rounded-md outline-none border border-gray-600 focus:ring-2 focus:ring-blue-500"
                    placeholder="LeetCode"
                    name="LeetCode"
                    value={updatedUser?.ProfileLinks?.LeetCode}
                    onChange={(e) => {
                      setUpdatedUser((prev) => ({
                        ...prev,
                        ProfileLinks: {
                          ...prev.ProfileLinks,
                          LeetCode: e.target.value,
                        },
                      }));
                    }}
                  />
                </h1>
                <p>|</p>
                <h1 className="flex flex-row space-x-1 justify-center items-center">
                  <LinkedInIcon />
                  <input
                    type="text"
                    className="bg-gray-800 text-white w-24 text-sm p-1 pl-2 rounded-md outline-none border border-gray-600 focus:ring-2 focus:ring-blue-500"
                    placeholder="LinkedIn"
                    name="LinkedIn"
                    value={updatedUser?.ProfileLinks?.LinkedIn}
                    onChange={(e) => {
                      setUpdatedUser((prev) => ({
                        ...prev,
                        ProfileLinks: {
                          ...prev.ProfileLinks,
                          LinkedIn: e.target.value,
                        },
                      }));
                    }}
                  />
                </h1>
              </div>
            ) : (
              <div className="flex flex-row justify-center items-center space-x-4 pl-14 pr-14">
                <a
                  href={user?.ProfileLinks?.GitHub || "#"}
                  className="flex flex-row justify-center items-center space-x-2 cursor-pointer hover:opacity-50 duration-300"
                >
                  <GitHubIcon />
                  <p className="opacity-80">Github</p>
                </a>
                <p>|</p>
                <a
                  href={user?.ProfileLinks?.Portfolio || "#"}
                  className="flex flex-row justify-center items-center space-x-2 cursor-pointer hover:opacity-50 duration-300"
                >
                  <LanguageIcon />
                  <p className="opacity-80">Portfolio</p>
                </a>
                <p>|</p>
                <a
                  href={user?.ProfileLinks?.LeetCode || "#"}
                  className="flex flex-row justify-center items-center space-x-2 cursor-pointer hover:opacity-50 duration-300"
                >
                  <img src={LeetCode_SVG} className="w-5 h-5" alt="leetcode" />
                  <p className="opacity-80">LeetCode</p>
                </a>
                <p>|</p>
                <h3
                  href={user?.ProfileLinks?.LinkedIn || "#"}
                  className="flex flex-row justify-center items-center space-x-2 cursor-pointer hover:opacity-50 duration-300"
                >
                  <LinkedInIcon />
                  <p className="opacity-80">LinkedIn</p>
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-11/12 mt-8 p-8 pt-6 rounded-xl bg-gray-800 bg-opacity-50 shadow-lg border border-gray-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-left text-white font-semibold">
            My Submissions
          </h2>
          <FormControl className="min-w-max scale-75">
            <Select
              value={selectedYear}
              onChange={handleYearChange}
              className="bg-slate-400 bg-opacity-15 border pr-2 h-10 rounded-md shadow-lg"
              sx={{
                color: "white",
                "& .MuiSelect-icon": { color: "white" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: "#1F2937",
                  },
                },
              }}
              IconComponent={(props) => (
                <ArrowDropDownIcon {...props} className="text-white" />
              )}
            >
              {years.map((year) => (
                <MenuItem
                  key={year}
                  value={year}
                  sx={{
                    color: "white",
                    backgroundColor: "#1F2937",
                    "&:hover": { backgroundColor: "#374151" },
                  }}
                >
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={heatmapValues}
          classForValue={(value) => {
            if (!value) return "fill-gray-700";

            if (value.count < 3) return "fill-blue-300";
            if (value.count < 5) return "fill-blue-500";
            if (value.count < 7) return "fill-blue-700";
            return "fill-blue-900";
          }}
        />
      </div>
      <div className="w-11/12 mt-8 p-8 pt-6 rounded-xl bg-gray-800 bg-opacity-50 shadow-lg border border-gray-600">
        <h2 className="text-2xl text-left text-white font-semibold mb-4">
          Recent Submissions
        </h2>
        <div className="flex flex-col gap-3">
          {submissions?.RecentSubmissions?.length > 0 ? (
            submissions.RecentSubmissions.map((submission, index) => (
              <div
                key={index}
                className="p-2 pl-6 pr-6 bg-gray-900 bg-opacity-50 rounded-lg shadow-md border border-gray-700"
              >
                <div className="flex justify-between items-center">
                  <Link
                    to={`/practice/coding/${submission.QuestionId}`}
                    className="text-lg font-medium text-white"
                  >
                    {submission.Title}
                  </Link>
                  <p className="text-gray-300 text-sm">{submission.Language}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">
                      {new Date(submission.Timestamp).toLocaleDateString()}
                    </span>
                    <IconButton
                      onClick={() => toggleCode(index)}
                      sx={{ color: "white" }}
                    >
                      {openIndex === index ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </div>
                </div>

                {openIndex === index && (
                  <motion.pre
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-800 text-gray-200 text-sm mt-2 p-3 rounded-md overflow-x-auto"
                  >
                    <code className="whitespace-pre-wrap">
                      {submission.Code}
                    </code>
                  </motion.pre>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center">No recent submissions</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
