import React, { useEffect, useState } from "react";
import {
  getUnverifiedMentors,
  getUnverifiedArticles,
  approveMentor,
  approveArticle,
} from "./../../../APIs/mentor";
import { motion } from "framer-motion";
import { LocationOn, Language, Work } from "@mui/icons-material";
import { useAppContext } from "../../../context/userContext";
import { CheckCircle, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
function Management() {
  const [mentors, setMentors] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(true);
  const { user } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      let unverified_mentors = await getUnverifiedMentors({ Id: user?._id });
      let unverified_articles = await getUnverifiedArticles({ Id: user?._id });

      if (unverified_mentors.status === 200) {
        setMentors(unverified_mentors.data);
      }
      if (unverified_articles.status === 200) {
        setArticles(unverified_articles.data);
      }
    };
    getData();
    setLoading(false);
  }, []);

  const handleApproveMentor = async (id) => {
    let res = await approveMentor({ Id: user?._id, MentorId: id });
    if (res.status == 200) {
      setMentors(mentors.filter((mentor) => mentor._id !== id));
      toast.success(res.message);
    } else toast.error(res.message);
  };

  const handleApproveArticle = async (id) => {
    let res = await approveArticle({ Id: user?._id, ArticleId: id });
    if (res.status === 200) {
      if (res.deleted) {
        setArticles(articles.filter((article) => article._id !== id));
      } else {
        setArticles(
          articles.map((article) =>
            article._id === id
              ? {
                  ...article,
                  Moderators: [user?._id],
                }
              : article
          )
        );
      }
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handlePreview = (id) => {
    navigate("/dashboard/mentor/newArticle", {
      state: { Task: "Preview", Id: id },
    });
  };

  if (!user.Verified) {
    return (
      <div className="min-h-screen text-white text-lg opacity-50 flex justify-center items-center flex-col space-y-2">
        <h1>Your request has not been approved by the manager yet.</h1>
        <h1>Please contact the managers as soon as possible to proceed.</h1>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-row justify-around text-white mb-10 border-b-2">
        <button
          onClick={() => setView(true)}
          className={`w-1/2 ${
            view ? "bg-slate-400" : "bg-transparent"
          } pt-4 pb-4 border-r-2 bg-opacity-15 `}
        >
          Pending Articles
        </button>
        <button
          onClick={() => setView(false)}
          className={`w-1/2 ${
            !view ? "bg-slate-400" : "bg-transparent"
          } pt-4 pb-4 border-r-2 bg-opacity-15 `}
        >
          Pending Mentors
        </button>
      </div>
      {view ? (
        <div className="min-h-screen  text-white p-5 w-full flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-8 border-b-2 pb-2 w-full text-center border-slate-700">
            Unverified Articles
          </h2>
          {loading ? (
            <motion.div
              animate={{ opacity: [0, 1] }}
              transition={{ duration: 1 }}
              className="text-center"
            >
              <p>Loading articles...</p>
            </motion.div>
          ) : articles.length === 0 ? (
            <p className="opacity-80 mt-40 text-xl">
              No unverified articles available.
            </p>
          ) : (
            articles.map((article) => (
              <motion.div
                key={article._id}
                className="bg-slate-600 bg-opacity-30 p-4 w-2/3 rounded-sm mb-4 flex items-center shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mr-10 overflow-ellipsis">
                    {article.Name}
                  </h3>
                  <p className="text-sm text-gray-300 mb-2 ml-2 mr-4">
                    {article.Description}
                  </p>
                  <p className="text-xs text-gray-400">
                    Author: {article.Author}
                  </p>
                  {article.Moderators?.length > 0 && (
                    <p className="text-xs text-green-400">
                      Approved by: {article.Moderators[0]}
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <motion.button
                    className={`px-4 py-2 rounded-sm flex items-center gap-2 transition-all duration-300 transform ${
                      article.Moderators.includes(user?._id)
                        ? "bg-slate-500 bg-opacity-55 text-white cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600 text-white hover:scale-105"
                    }`}
                    whileHover={{
                      scale: article.Moderators.includes(user?._id) ? 1 : 1.1,
                    }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      !article.Moderators.includes(user?._id) &&
                      handleApproveArticle(article._id)
                    }
                    disabled={article.Moderators.includes(user?._id)}
                  >
                    <CheckCircle fontSize="small" />
                    {article.Moderators.includes(user?._id)
                      ? "Approved"
                      : "Approve"}
                  </motion.button>

                  <motion.button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-sm flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePreview(article._id)}
                  >
                    <Visibility fontSize="small" />
                    Preview
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div>
          <div className="min-h-screen  text-white p-5 w-full flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-8 border-b-2 pb-2 w-full text-center border-slate-700">
              Unverified Mentors
            </h2>
            {loading ? (
              <motion.div
                animate={{ opacity: [0, 1] }}
                transition={{ duration: 1 }}
                className="text-center"
              >
                <p>Loading mentors...</p>
              </motion.div>
            ) : mentors.length === 0 ? (
              <p className="opacity-80 mt-40 text-xl">
                No unverified mentors available.
              </p>
            ) : (
              mentors.map((mentor) => (
                <motion.div
                  key={mentor._id}
                  className="bg-slate-600 bg-opacity-30 p-4 w-2/3 rounded-sm mb-4 flex items-center shadow-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <img
                    src={mentor.Picture}
                    alt={mentor.Name}
                    className="w-24 h-24 m-6 rounded-full border-2 border-white"
                  />
                  <div className="flex-1 ">
                    <h2 className="text-lg font-semibold">{mentor.Name}</h2>
                    <p className="text-sm ml-4 opacity-80 font-serif tracking-wider">
                      {mentor.Email}
                    </p>
                    <div className="flex items-center space-x-8 m-3 opacity-80">
                      <p className="text-sm flex items-center">
                        <LocationOn className="mr-1" /> {mentor.Location}
                      </p>
                      <p>|</p>
                      <p className="text-sm flex items-center">
                        <Work className="mr-1" /> {mentor.Experience} years
                      </p>
                      <p>|</p>
                      <p className="text-sm flex items-center">
                        <Language className="mr-1" />{" "}
                        {mentor.Languages?.join(", ")}
                      </p>
                    </div>
                    <p
                      className="text-sm italic w-96 max-h-20 overflow-y-auto m-2 ml-4 tracking-wider"
                      style={{ scrollbarWidth: "none" }}
                    >
                      "{mentor.About}"
                    </p>
                  </div>
                  <motion.button
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-sm mr-10 transition-all duration-300 transform hover:scale-105"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleApproveMentor(mentor._id)}
                  >
                    Approve
                  </motion.button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Management;
