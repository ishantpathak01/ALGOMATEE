import React, { useEffect, useState } from "react";
import Snowfall from "./../animations/snow.js";
import {
  getCodingSheet,
  getSolvedCodingQuestionsList,
} from "../APIs/problem.js";
import Introduction from "./../components/codingSheet/introduction.js";
import Header from "./../components/codingSheet/header.js";
import TagFilters from "./../components/codingSheet/tagFilters.js";

import { Pagination } from "@mui/material";
import { codingProblemTags } from "../ConstantData/problems.js";
import { useAppContext } from "./../context/userContext.js";
import Sheet from "../components/codingSheet/sheet.js";
import Statistics from "../components/codingSheet/statistics.js";
function CodingSheet() {
  const [codingQuestions, setCodingQuestions] = useState([]);
  const [Page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [solvedFilter, setSolvedFilter] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [solvedQuestions, setSolvedQuestionsList] = useState([]);
  const { user } = useAppContext();
  const [sheetSize, setSheetSize] = useState(0);
  const progress = (solvedQuestions.length / sheetSize) * 100;

  useEffect(() => {
    const getSheet = async () => {
      try {
        let res = await getCodingSheet({
          Page,
          Limit: 10,
          SearchText: searchText,
          Tag: selectedTag,
        });

        if (res?.status === 200) {
          setCodingQuestions(res.data[0]?.data || []);
          setTotal(res.data[0]?.metadata[0]?.total || 0);
          setSheetSize(
            Math.max(res.data[0]?.metadata[0]?.total || 0, sheetSize)
          );
        }
      } catch (error) {
        console.error("Error fetching coding sheetSize:", error);
      }
    };
    getSheet();
  }, [Page, searchText, selectedTag]);

  useEffect(() => {
    let getSolvedQuestions = async () => {
      let res = await getSolvedCodingQuestionsList({ Id: user?._id });
      if (res.status == 200) {
        setSolvedQuestionsList(res.list || []);
        console.log(res.list);
      }
    };
    getSolvedQuestions();
  }, []);

  return (
    <div className="relative pt-20 bg-gradient-to-b from-gray-900 to-black min-h-screen text-white py-16 px-6 md:px-40">
      <Snowfall />
      <Introduction></Introduction>

      <Header
        setSearchText={setSearchText}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        solvedFilter={solvedFilter}
        setSolvedFilter={setSolvedFilter}
      ></Header>

      <div className="flex flex-col md:flex-row justify-center items-start gap-8 mt-6">
        <Sheet
          codingQuestions={codingQuestions}
          solvedFilter={solvedFilter}
          solvedQuestions={solvedQuestions}
        ></Sheet>

        <section className="w-full md:w-1/3 flex flex-col gap-6">
          <TagFilters
            setSelectedTag={setSelectedTag}
            codingProblemTags={codingProblemTags}
            selectedTag={selectedTag}
          ></TagFilters>

          <Statistics
            sheetSize={sheetSize}
            solvedQuestions={solvedQuestions}
            progress={progress}
          >
            {" "}
          </Statistics>
        </section>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-10">
        <Pagination
          count={Math.ceil(total / 10)}
          onChange={(e, value) => setPage(value)}
          variant="outlined"
          shape="rounded"
          sx={{
            "& .MuiPaginationItem-root": {
              backgroundColor: "#D3D3D3",
              color: "#2F4F4F",
            },
            "& .MuiPaginationItem-root.Mui-selected": {
              backgroundColor: "#232c3b",
              color: "#FFFFFF",
            },
            "& .MuiPaginationItem-root.Mui-selected:hover": {
              backgroundColor: "#151c29",
            },
          }}
        />
      </div>
    </div>
  );
}

export default CodingSheet;
