import React, { useEffect, useState } from "react";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import {
  getChoiceBasedSheet,
  deleteChoiceBasedProblem,
} from "../../../../APIs/problem";
import { useAppContext } from "../../../../context/userContext";
import { Pagination } from "@mui/material";
import Loading_SVG from "./../../../../assets/Illustrations/loading.svg";
import toast from "react-hot-toast";

function Questions({ setStatement, setOptions, setTags, setView, setId }) {
  const [loading, setLoading] = useState(true);
  const [update, setUpdate] = useState(false);
  const [sheet, setSheet] = useState([]);
  const [totalQuestion, setTotalQuestions] = useState(0);
  const [selectedPage, setSelectedPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const { user } = useAppContext();

  const handleDeleteProblem = async (id) => {
    try {
      let res = await deleteChoiceBasedProblem({
        QuestionId: id,
        Id: user._id,
      });

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

  useEffect(() => {
    setLoading(true);

    const getSheetData = async () => {
      try {
        let res = await getChoiceBasedSheet({
          Page: selectedPage,
          Limit: 10,
          SearchText: searchText,
        });
        if (res.status === 200) {
          setSheet(res?.data[0]?.data);
          setTotalQuestions(res?.data[0]?.metadata[0]?.total);
        } else {
          toast.error("Failed to load data");
        }
      } catch (error) {
        setTotalQuestions(0);
        toast.error("Some error occurred");
      } finally {
        setLoading(false);
      }
    };

    getSheetData();
  }, [update, selectedPage]);

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
              MCQ Sheet
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
                    className="bg-slate-600 border-2 border-white border-opacity-40 bg-opacity-20 items-center hover:bg-opacity-45 transition-all duration-200 p-3 rounded-md pl-6 pr-6 m-2 w-2/3 flex flex-col"
                  >
                    <div className="flex flex-col w-full">
                      <h2>{question?.Statement}</h2>
                      <div className="ml-4">
                        {question?.Options.map((opt, i) => (
                          <h2 className="flex flex-row space-x-4">
                            <p>
                              {i + 1}. {opt.Name}
                            </p>
                            <p>{opt.IsValid ? "✅" : "❌"}</p>
                          </h2>
                        ))}
                      </div>
                      <div className="ml-4 flex flex-row text-sm opacity-45 mt-2">
                        {question?.Tags.map((tag) => (
                          <h2 className="flex scale-75 bg-black_A bg-opacity-50 px-4  border-2  rounded-full py-1  flex-row space-x-4">
                            <p>{tag}</p>
                          </h2>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-row justify-between items-center w-full">
                      <h3 className="opacity-50 text-sm">
                        [ Id - {question._id} ]
                      </h3>
                      <h3 className="opacity-50 text-sm">
                        [ Posted by - {question.Id} ]
                      </h3>
                      <div className="opacity-50 text-sm space-x-4">
                        <button
                          onClick={() => {
                            setStatement(question.Statement);
                            setOptions(question.Options);
                            setTags(question.Tags);
                            setView("addMCQ");
                            setId(question._id);
                          }}
                          className="hover:bg-black_A p-2 rounded-full text-blue-500"
                        >
                          <DescriptionOutlinedIcon></DescriptionOutlinedIcon>
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteProblem(question._id);
                          }}
                          className="hover:bg-black_A p-2 rounded-full text-red-500"
                        >
                          <DeleteForeverOutlinedIcon></DeleteForeverOutlinedIcon>
                        </button>
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
