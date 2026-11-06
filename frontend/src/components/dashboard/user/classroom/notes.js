import React, { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { getNotesCalendar } from "../../../../APIs/classroom";
import { useAppContext } from "../../../../context/userContext";
import toast from "react-hot-toast";

const Notes = () => {
  const [calendar, setCalendar] = useState(null);
  const navigate = useNavigate();
  const params = useParams();
  const section = params.name;
  const { user } = useAppContext();

  useEffect(() => {
    const fetchCalendar = async () => {
      let res = await getNotesCalendar({
        Id: user?._id,
        ClassroomId: section,
      });

      if (res.status === 200) {
        setCalendar(res.data);
      } else {
        toast.error("Failed to load notes calendar.");
      }
    };

    if (user && section) {
      fetchCalendar();
    }
  }, [user, section]);

  const groupedNotes = {};
  if (calendar?.Data) {
    Object.entries(calendar.Data)
      .sort(([dateA], [dateB]) => dayjs(dateA).diff(dayjs(dateB)))
      .forEach(([date, note]) => {
        const monthYear = dayjs(date).format("MMMM YYYY");
        if (!groupedNotes[monthYear]) {
          groupedNotes[monthYear] = [];
        }
        groupedNotes[monthYear].push({ date, note });
      });
  }

  const handleShowNotes = (date) => {
    const formattedDate = dayjs(date).format("DD-MM-YYYY");
    const url = `/notesEditor?section=${section}&date=${formattedDate}`;
    const newWindow = window.open(
      url,
      "_blank",
      "width=" +
        window.screen.availWidth +
        ",height=" +
        window.screen.availHeight
    );
    if (newWindow) {
      newWindow.moveTo(0, 0);
    }
  };

  return (
    <div className="relative min-h-screen text-white p-6 flex flex-col items-center">
      <button
        onClick={() => navigate("/dashboard/user/classroom")}
        className="absolute top-1 left-14 border-2 rounded-md p-1 border-opacity-30 bg-slate-500 bg-opacity-10 hover:bg-opacity-20 duration-200"
      >
        <ArrowBackIcon />
      </button>
      <h1 className="text-3xl border-b-2 font-semibold pb-2 w-full text-center">
        Notes Calendar
      </h1>

      <div className="text-white mt-10 w-full max-w-2xl">
        {Object.keys(groupedNotes).length > 0 ? (
          Object.entries(groupedNotes).map(([monthYear, notes]) => (
            <div key={monthYear} className="mt-6">
              <div className="text-md italic text-center opacity-45">
                {monthYear}
              </div>
              <div className="mt-2 space-y-2">
                {notes.map(({ date, note }) => (
                  <div
                    onClick={() => {
                      handleShowNotes(date);
                    }}
                    className="flex items-center cursor-pointer hover:scale-95 duration-200 p-3 justify-between pl-8 pr-8 bg-[#151d26] border-white border-opacity-20 border-2 bg-opacity-50 rounded-lg shadow-md w-full"
                  >
                    <p className="tracking-wider truncate w-96 overflow-ellipsis">
                      {note}
                    </p>
                    <p className="font-thin tracking-widest opacity-55 text-sm text-white">
                      {dayjs(date).format("DD/MMM/YYYY")}
                    </p>{" "}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-lg font-serif italic opacity-45 tracking-wider mt-60 text-center">
            No notes available
          </p>
        )}
      </div>
    </div>
  );
};

export default Notes;
