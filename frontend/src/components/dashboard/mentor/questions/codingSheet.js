import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Terminal } from "lucide-react";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import { getCodingSheet, deleteCodingProblem } from "../../../../APIs/problem";
import { useAppContext } from "../../../../context/userContext";
import { Pagination } from "@mui/material";
import Loading_SVG from "./../../../../assets/Illustrations/loading.svg";
import { platformsLogo } from "./../../../../ConstantData/problems";
import toast from "react-hot-toast";

function Questions({ setView, setId }) {
  const [loading, setLoading] = useState(true);
  const [update, setUpdate] = useState(false);
  const [sheet, setSheet] = useState([]);
  const { user } = useAppContext();
  const [totalQuestion, setTotalQuestions] = useState(0);
  const [selectedPage, setSelectedPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const handleDeleteProblem = async (id) => {
    try {
      let res = await deleteCodingProblem({ QuestionId: id, Id: user?._id });
      if (res.status === 200) {
        toast.success(res.message);
        setUpdate((prev) => !prev);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Failed to delete problem");
    }
  };

  const handleEditProblem = (problem) => {
    setId(problem._id);
    setView("AddCodingQuestion");
  };

  useEffect(() => {
    setLoading(true);

    const getSheetData = async () => {
      try {
        let res = await getCodingSheet({
          Page: selectedPage,
          SearchText: searchText,
          Limit: 10,
        });
        if (res.status === 200) {
          setSheet(res?.data[0]?.data);
          setTotalQuestions(res?.data[0]?.metadata[0]?.total);
        } else {
          setTotalQuestions(0);
          toast.error("Failed to load data");
        }
      } catch (error) {
        setTotalQuestions(0);
        toast.error("Some error occured");
      } finally {
        setLoading(false);
      }
    };

    getSheetData();
  }, [update]);

  return (
    <div className="min-h-screen w-full">
      <div className="text-white w-full">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-full mt-40">
            <img src={Loading_SVG} alt="Loading" className="w-20" />
            <h2 className="font-serif tracking-wider text-sm opacity-40">
              Loading
            </h2>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center">
            <h2 className="text-center w-11/12 text-2xl border-b-2  m-8 pb-2">
              Coding Sheet
            </h2>
            <div className="flex justify-center items-center flex-row m-2 space-x-6 ">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="p-2 bg-transparent rounded-md w-80 border-2 focus:outline-none pl-4"
                placeholder="Search Question"
              ></input>
              <button
                onClick={() => setUpdate(!update)}
                className="w-20 h-10 bg-slate-400 bg-opacity-10 hover:scale-95 duration-200 rounded-sm border-2"
              >
                Search
              </button>
            </div>
            <div className="flex flex-col justify-center w-full items-center">
              {sheet
                .slice()
                .reverse()
                .map((question) => (
                  <div
                    key={question._id}
                    className="bg-slate-600 border-2 border-opacity-40 border-white bg-opacity-30 items-center hover:bg-opacity-45 transition-all duration-200 p-3 rounded-md pl-6 pr-6 m-2 w-2/3 flex flex-col"
                  >
                    <div className="flex flex-row justify-between items-center w-full">
                      <h2>{question.Name}</h2>
                      <div className="flex flex-row justify-center items-center space-x-4">
                        <Link
                          to={`/practice/coding/${question._id}`}
                          className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-md bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white transition-all border border-blue-500/40"
                          title="Open and run in Code Runner Terminal"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Test Terminal</span>
                        </Link>
                        {question.Link && (
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={question.Link}
                          >
                            <img
                              src={
                                platformsLogo[question.Platform] ||
                                platformsLogo.AlgoMate
                              }
                              alt="Platform"
                              className="h-6 w-6"
                            />
                          </a>
                        )}
                        <button
                          onClick={() => handleEditProblem(question)}
                          className="text-blue-400 cursor-pointer"
                        >
                          <DescriptionOutlinedIcon />
                        </button>
                        <button
                          className="text-red-500 cursor-pointer"
                          onClick={() => handleDeleteProblem(question._id)}
                        >
                          <DeleteForeverOutlinedIcon />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-row justify-between items-center w-full pt-4">
                      <h3 className="opacity-50 text-sm">
                        [ Id - {question._id} ]
                      </h3>
                      <div
                        className="opacity-50 text-xsm max-w-80 flex flex-row justify-center overflow-x-auto"
                        style={{ scrollbarWidth: "none" }}
                      >
                        {question.Tags &&
                          question?.Tags.map((tag) => (
                            <h3 className="px-3 py-0.5 border m-1 rounded-full">
                              {tag}
                            </h3>
                          ))}
                        {question.Companies &&
                          question?.Companies.map((tag) => (
                            <h3 className="px-4 py-0.5 flex flex-row justify-center items-center space-x-1 border m-1 rounded-full">
                              <img
                                src={`https://logo.clearbit.com/${tag}.com`}
                                className="h-3 w-3 rounded-sm"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://img.icons8.com/ios-filled/50/circled.png";
                                }}
                              ></img>
                              <p>{tag}</p>
                            </h3>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <div className="flex justify-center items-center p-4 mb-10">
              <Pagination
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "white",
                    borderColor: "white",
                  },
                  "& .MuiPaginationItem-page.Mui-selected": {
                    backgroundColor: "white",
                    color: "black",
                  },
                  "& .MuiPaginationItem-ellipsis": { color: "white" },
                }}
                count={Math.ceil(totalQuestion / 10)}
                variant="outlined"
                shape="rounded"
                page={selectedPage}
                onChange={(e, val) => setSelectedPage(val)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Questions;
