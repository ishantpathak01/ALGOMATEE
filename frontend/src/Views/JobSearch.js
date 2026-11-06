import React, { useEffect, useState } from "react";
import Introduction from "./../components/jobSearch/introduction.js";
import Card from "./../components/jobSearch/card.js";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { getAllJobs } from "./../APIs/user.js";
import JobFilters from "./../ConstantData/jobs.js";
import ClearIcon from "@mui/icons-material/Clear";
import { Pagination, CircularProgress } from "@mui/material";
import Aurora from './../animations/aurora.js'
function JobSearch() {
  const [experience, setExperience] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [accordion, setAccordion] = useState({
    experience: false,
    location: false,
    type: false,
  });

  const [searchExperience, setSearchExperience] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchType, setSearchType] = useState("");
  const [Jobs, setJobs] = useState([]);
  const [totaljobs, setTotaljobs] = useState(0);
  const [selectedPage, setSelectedPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getjobsData = async () => {
      setLoading(true);
      let jobs = await getAllJobs({
        Limit: 10,
        Page: selectedPage,
        Type: type,
        Experience: experience,
        Location: location,
      });
      if (jobs.status === 200) {
        setJobs(jobs.data);
        setTotaljobs(jobs.total);
      }
      setLoading(false);
    };
    getjobsData();
  }, [selectedPage, type, experience, location]);

  const toggleAccordion = (key) => {
    setAccordion((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-gradient-to-b from-[#111726] to-black_A flex flex-col pt-20">
      <Aurora></Aurora>
      <Introduction />
      {(type !== "" || location !== "" || experience !== "") && (
        <div className="w-full h-14 bg-slate-500 flex flex-row justify-center items-center">
          {experience !== "" && (
            <button
              onClick={() => setExperience("")}
              className="bg-slate-700 hover:scale-95 transition-all flex flex-row space-x-2 cursor-pointer border-2 text-slate-950 m-2 p-2 rounded-full px-4"
            >
              <p>{experience}</p>
              <ClearIcon />
            </button>
          )}
          {location !== "" && (
            <button
              onClick={() => setLocation("")}
              className="bg-slate-700 hover:scale-95 transition-all flex flex-row space-x-2 cursor-pointer border-2 text-slate-950 m-2 p-2 rounded-full px-4"
            >
              <p>{location}</p>
              <ClearIcon />
            </button>
          )}
          {type !== "" && (
            <button
              onClick={() => setType("")}
              className="bg-slate-700 hover:scale-95 transition-all flex flex-row space-x-2 cursor-pointer border-2 text-slate-950 m-2 p-2 rounded-full px-4"
            >
              <p>{type}</p>
              <ClearIcon />
            </button>
          )}
        </div>
      )}
      <section className="w-full flex flex-row gap-8 justify-center">
        <div className="flex flex-col w-2/4 gap-4 mb-10">
          {loading ? (
            <div className="flex justify-center items-center h-80">
              <CircularProgress />
            </div>
          ) : Jobs.length !== 0 ? (
            Jobs.map((job, index) => <Card key={index} data={job} />)
          ) : (
            <div className="text-center text-gray-600 mt-80">
              No results found.
            </div>
          )}
        </div>

        <div className="h-fit mt-6 mb-20 flex flex-col gap-6 p-4 bg-slate-400  shadow-md rounded-lg w-1/4">
          {/* Experience Filter */}
          <div className="flex flex-col border-b pb-4">
            <button
              onClick={() => toggleAccordion("experience")}
              className="font-semibold text-slate-900 text-left mb-2 flex justify-between items-center p-2"
            >
              Experience
              {accordion.experience ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </button>
            <div
              className={`transition-all duration-300 overflow-y-scroll  ${
                accordion.experience ? "max-h-96" : "max-h-0"
              }`}
              style={{
                transition: "all 0.3s",
                overflowX: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.8)",
              }}
            >
              <input
                type="text"
                placeholder="Search Experience"
                value={searchExperience}
                onChange={(e) => setSearchExperience(e.target.value)}
                className="p-2 mb-2 w-full focus:outline-none bg-gray-700 text-slate-900 rounded"
              />
              {JobFilters?.ExperienceInYears.filter((exp) =>
                exp.toLowerCase().includes(searchExperience.toLowerCase())
              ).map((exp, index) => (
                <div
                  key={index}
                  onClick={() => setExperience(exp)}
                  className={`cursor-pointer p-2  ${
                    experience === exp
                      ? "bg-gray-700 text-slate-900"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {exp}
                </div>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div className="flex flex-col border-b pb-4">
            <button
              onClick={() => toggleAccordion("location")}
              className="font-semibold text-slate-950 text-left mb-2 flex justify-between items-center p-2"
            >
              Location
              {accordion.location ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </button>
            <div
              className={`transition-all duration-300 overflow-y-scroll ${
                accordion.location ? "max-h-96" : "max-h-0"
              }`}
              style={{
                transition: "all 0.3s",
                overflowX: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.8)",
              }}
            >
              <input
                type="text"
                placeholder="Search Location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="p-2 mb-2 w-full focus:outline-none bg-gray-700 text-slate-950 rounded"
              />
              {JobFilters?.ITJobLocations.filter((loc) =>
                loc.toLowerCase().includes(searchLocation.toLowerCase())
              ).map((loc, index) => (
                <div
                  key={index}
                  onClick={() => setLocation(loc)}
                  className={`cursor-pointer p-2  ${
                    location === loc
                      ? "bg-gray-700 text-slate-950"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {loc}
                </div>
              ))}
            </div>
          </div>

          {/* Job Type Filter */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleAccordion("type")}
              className="font-semibold text-slate-950 text-left mb-2 flex justify-between items-center p-2"
            >
              Job Type
              {accordion.type ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </button>
            <div
              className={`transition-all duration-300 overflow-y-scroll  ${
                accordion.type ? "max-h-96" : "max-h-0"
              }`}
              style={{
                transition: "all 0.3s",
                overflowX: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.8)",
              }}
            >
              <input
                type="text"
                placeholder="Search Job Type"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="p-2 mb-2 w-full focus:outline-none bg-gray-700 text-slate-950 rounded"
              />
              {JobFilters?.JobTypes.filter((jobType) =>
                jobType.toLowerCase().includes(searchType.toLowerCase())
              ).map((jobType, index) => (
                <div
                  key={index}
                  onClick={() => setType(jobType)}
                  className={`cursor-pointer p-2  ${
                    type === jobType
                      ? "bg-gray-700 text-slate-950"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {jobType}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-center items-center p-4 mb-10">
        <Pagination
          sx={{
            "& .MuiPaginationItem-root": {
              color: "slate-950",
              borderColor: "slate-950",
              backgroundColor: "grey",
            },
            "& .MuiPaginationItem-page.Mui-selected": {
              backgroundColor: "black",
              color: "slate-950",
            },
            "& .MuiPaginationItem-ellipsis": {
              color: "slate-950",
              backgroundColor: "grey",
            },
          }}
          count={Math.ceil(totaljobs / 10)}
          variant="outlined"
          shape="rounded"
          page={selectedPage}
          onChange={(e, val) => setSelectedPage(val)}
        />
      </div>
    </div>
  );
}

export default JobSearch;
