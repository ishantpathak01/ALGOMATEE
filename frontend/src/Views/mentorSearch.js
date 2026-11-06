import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Card from "../components/mentorSearch/mentorCard";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { expertise as expertiseList } from "./../ConstantData/mentors";
import { getAllMentors } from "../APIs/user";
import { timeSlots } from "./../ConstantData/mentors";
import dayjs from "dayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import toast from "react-hot-toast";
import { Pagination } from "@mui/material";
import SVG_MENTOR from "./../assets/Illustrations/mentor.svg";

function Mentor() {
  const [MentorsData, setMentorsData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [expertise, setExpertise] = useState("Expertise");
  const [topic, setTopic] = useState("Topic");
  const [date, setDate] = useState(dayjs());
  const [dateChanged, setDateChanged] = useState(false);
  const [time, setTime] = useState("Interval");
  const [Page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const getMentorsData = async () => {
      try {
        let res = await getAllMentors({
          Page,
          Limit: 10,
          Name: searchText,
          Expertise: expertise == "Expertise" ? "" : expertise,
          Topic: topic == "Topic" ? "" : topic,
          Date: dateChanged ? date.format("YYYY-MM-DD") : "",
          Time: time == "Interval" ? "" : time,
        });
        if (res.status === 200) {
          setMentorsData(res.data);
          setTotal(res.total);
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        toast.error("Failed to fetch mentors");
      }
    };
    getMentorsData();
  }, [Page, searchText, time, date, topic, expertise]);

  return (
    <div className="pt-16">
      <motion.section
        className="bg-gradient-to-b from-black_B to-[#2b3342] text-white text-center py-16 px-8"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-5xl md:text-5xl mb-4 bg-clip-text text-transparent font-bold bg-gradient-to-br from-blue-500  to-pink-400">
          Experienced Mentors Ready to Guide
        </h1>
        <h2 className="text-lg md:text-xl font-serif tracking-wide mb-6">
          Providing personalized guidance and support to help you achieve your
          goals.
        </h2>

        <div className="flex items-center justify-center space-x-8 mt-8">
          {/* Image */}
          <div className="bg-slate-200 w-40 h-40 rounded-lg flex items-center justify-center opacity-90">
            <img
              src={SVG_MENTOR}
              alt="Mentor"
              className="h-32 w-32 object-cover "
            />
          </div>

          {/* Content Section */}
          <div className="text-left w-1/3">
            <p className="text-sm md:text-base tracking-wide font-sans">
              Our mentors offer extensive support by addressing doubts,
              conducting mock interviews, and facilitating in-depth discussions.
              They provide personalized guidance, enabling you to strengthen
              your understanding, enhance your skills, and achieve success in
              your academic and professional pursuits.
            </p>
          </div>
        </div>
      </motion.section>

      <section>
        <div className="sticky  p-4 top-16 z-10 bg-[#2c3345] shadow-lg flex flex-row justify-around items-center">
          <div className="relative flex items-center justify-center h-full px-4">
            <input
              type="text"
              placeholder="Search Mentors"
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-slate-200 bg-opacity-10 border-2 border-slate-400 pl-6 focus:outline-none tracking-wider text-white p-2 rounded-full w-80 max-w-md"
            />
            <div className="absolute right-9 text-slate-200 opacity-50 ">
              <SearchIcon></SearchIcon>
            </div>
          </div>
          <div className="flex flex-row justify-around w-[700px] ">
            <div className="group relative flex justify-center text-slate-100 border-2 py-2 px-4 rounded-md text-opacity-70 hover:bg-slate-100 hover:text-slate-800 cursor-pointer duration-200">
              {expertise}
              <KeyboardArrowDownIcon className="ml-2"></KeyboardArrowDownIcon>
              <div className=" group-hover:flex h-2 hidden absolute mt-8 w-48"></div>
              <ul className="group-hover:flex flex-col hidden absolute mt-10 text-white bg-slate-900 opacity-90 text-center">
                <li
                  onClick={() => {
                    setExpertise("Expertise");
                    setTopic("Topic");
                  }}
                  className="m-2 text-white px-6 py-2 text-nowrap hover:bg-white hover:text-slate-900 duration-200"
                >
                  All Fields
                </li>
                {Object.keys(expertiseList).map((key) => (
                  <li
                    key={key}
                    onClick={() => {
                      setExpertise(key);
                      setTopic("Topic");
                    }}
                    className="m-2 text-white px-6 py-2 text-nowrap hover:bg-white hover:text-slate-900 duration-200"
                  >
                    {key}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              {expertise !== "Expertise" && (
                <div className="group relative flex justify-center text-slate-100 border-2 py-2 px-4 rounded-md text-opacity-70 hover:bg-slate-100 hover:text-slate-800 cursor-pointer duration-200">
                  {topic}
                  <KeyboardArrowDownIcon className="ml-2"></KeyboardArrowDownIcon>
                  <div className=" group-hover:flex h-2 hidden absolute mt-8 w-48"></div>
                  <ul className="group-hover:flex flex-col hidden absolute mt-10 text-white bg-slate-900 opacity-90 text-center">
                    <div>
                      {expertiseList[expertise].map((topic, index) => (
                        <li
                          key={index}
                          onClick={() => setTopic(topic)}
                          className="m-2 text-white px-6 py-2 text-nowrap hover:bg-white hover:text-slate-900 duration-200"
                        >
                          {topic}
                        </li>
                      ))}
                    </div>
                  </ul>
                </div>
              )}
            </div>

            <div className="group relative flex justify-center text-slate-100 border-2 py-2 px-4 rounded-md text-opacity-70 tracking-wide hover:bg-slate-100 hover:text-slate-800 cursor-pointer duration-200">
              {dateChanged ? date.format("DD-MM-YYYY") : "Availability"}
              <KeyboardArrowDownIcon className="ml-2"></KeyboardArrowDownIcon>
              <div className=" group-hover:flex h-2 hidden absolute mt-8 w-48"></div>
              <div className="absolute mt-10 bg-slate-900 bg-opacity-90 rounded-md hidden group-hover:flex">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["DateCalendar"]}>
                    <DateCalendar
                      referenceDate={dayjs("2022-04-17")}
                      views={["year", "month", "day"]}
                      value={date}
                      onChange={(newValue) => {
                        setDate(newValue);
                        setDateChanged(true);
                      }}
                      sx={{
                        color: "white",
                        ".MuiPickersDay-root": { color: "white" },
                        ".MuiTypography-root": { color: "white" },
                        ".MuiSvgIcon-root": { color: "white" },
                        ".Mui-selected": { backgroundColor: "#ffffff33" }, // Light white for selected dates
                      }}
                      shouldDisableDate={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </div>
            </div>
            <div>
              {dateChanged && (
                <div className="group relative flex justify-center text-slate-100 border-2 py-2 px-4 rounded-md text-opacity-70 tracking-wide hover:bg-slate-100 hover:text-slate-800 cursor-pointer duration-200">
                  <h2 className="w-24 text-center">{time}</h2>
                  <KeyboardArrowDownIcon className="ml-2"></KeyboardArrowDownIcon>
                  <div className=" group-hover:flex h-2 hidden absolute mt-8 w-48"></div>
                  <div className="absolute mt-10 bg-slate-900 text-white bg-opacity-90 hidden group-hover:flex">
                    <div className="h-96 overflow-y-auto custom-scrollbar">
                      {timeSlots.map((slot) => (
                        <button
                          onClick={(e) => setTime(slot)}
                          className="p-3 w-full text-center hover:bg-white font-semibold font-sans hover:text-slate-900"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <motion.div
          className="bg-slate-900 bg-opacity-15 flex flex-row flex-wrap justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {MentorsData.length > 0 ? (
            MentorsData.map((mentor) => (
              <motion.div
                key={mentor.id}
                className="m-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Card mentor={mentor}></Card>
              </motion.div>
            ))
          ) : (
            <p className="p-20 text-slate-600">
              No mentors available at the moment.
            </p>
          )}
        </motion.div>
        <div className="bg-slate-900 bg-opacity-15 pt-0 pb-20 flex justify-center items-center">
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
      </section>
    </div>
  );
}

export default Mentor;
