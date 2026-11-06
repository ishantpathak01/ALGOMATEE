import React, { useEffect, useState } from "react";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import {
  getNotesCalendar,
  addNotesInCalendar,
  updateCalanderNote,
} from "../../../../APIs/classroom";
import { useAppContext } from "../../../../context/userContext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const Notes = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [calendar, setCalendar] = useState(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteName, setNoteName] = useState("");
  const [editNoteId, setEditNoteId] = useState(null);
  const [editedNoteName, setEditedNoteName] = useState("");

  const navigate = useNavigate();
  const params = useParams();
  const section = params.name;
  const { user } = useAppContext();

  useEffect(() => {
    const fetchCalendar = async () => {
      let res = await getNotesCalendar({ Id: user?._id, ClassroomId: section });

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

  const handleDateChange = (newValue) => {
    if (newValue) setSelectedDate(newValue);
  };

  const handleAddNotes = async () => {
    if (!noteName.trim()) {
      toast.error("Note name cannot be empty.");
      return;
    }

    const formattedDate = selectedDate.format("YYYY-MM-DD");

    let res = await addNotesInCalendar({
      Id: user?._id,
      Date: formattedDate,
      Name: noteName,
      CalendarId: calendar?._id,
    });

    if (res.status === 200) {
      toast.success(res.message);
      setCalendar((prev) => ({
        ...prev,
        Data: { ...prev.Data, [formattedDate]: noteName },
      }));
      setNoteName("");
      setShowAddNote(false);
    } else {
      toast.error(res.message);
    }
  };

  const groupedNotes = {};
  if (calendar?.Data) {
    Object.entries(calendar.Data)
      .sort(([dateA], [dateB]) => dayjs(dateA).diff(dayjs(dateB)))
      .forEach(([date, note]) => {
        const monthYear = dayjs(date).format("MMMM YYYY");
        if (!groupedNotes[monthYear]) groupedNotes[monthYear] = [];
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

  const handleEditNote = async (date) => {
    if (!editedNoteName.trim()) {
      toast.error("Note name cannot be empty.");
      return;
    }
    let res = await updateCalanderNote({
      Id: user?._id,
      CalendarId: calendar?._id,
      Date: date,
      Name: editedNoteName,
    });
    if (res.status == 200) {
      setCalendar((prev) => ({
        ...prev,
        Data: { ...prev.Data, [date]: editedNoteName },
      }));
      setEditNoteId(null);
    }
    if (res.status == 200) toast.success(res.message);
    else toast.error(res.message);
  };

  return (
    <div className="relative min-h-screen text-white p-6 flex flex-col items-center">
      <button
        onClick={() => navigate("/dashboard/mentor/classroom")}
        className="absolute top-1 left-14 border-2 rounded-md p-1 border-opacity-30 bg-slate-500 bg-opacity-10 hover:bg-opacity-20 duration-200"
      >
        <ArrowBackIcon />
      </button>
      <h1 className="text-3xl border-b-2 font-semibold pb-2 w-full text-center">
        Notes Calendar
      </h1>
      <button
        onClick={() => setShowAddNote(!showAddNote)}
        className="absolute right-20 w-36 top-24 flex flex-row items-center justify-center space-x-3 border focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 border-slate-500 text-slate-500 hover:text-white hover:bg-slate-800 focus:ring-slate-500"
      >
        <p>Add Notes</p>
        <AddCircleOutlineOutlinedIcon />
      </button>

      {showAddNote && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-[#2e3b4d] p-6 rounded-xl shadow-lg mt-32 w-[90%] sm:w-1/2"
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              sx={{
                "& .MuiPickersDay-root, & .MuiTypography-root, & .MuiSvgIcon-root, & .MuiPickersYear-yearButton":
                  {
                    color: "white",
                  },
                backgroundColor: "#1d232b",
                borderRadius: "20px",
              }}
              value={selectedDate}
              onChange={handleDateChange}
            />
          </LocalizationProvider>
          <input
            type="text"
            placeholder="Enter Topic Name"
            value={noteName}
            onChange={(e) => setNoteName(e.target.value)}
            className="mt-4 w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleAddNotes}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:border transition duration-200"
          >
            Save Note
          </button>
        </motion.div>
      )}

      <div className="text-white mt-16 w-full max-w-2xl">
        {Object.keys(groupedNotes).length > 0 ? (
          Object.entries(groupedNotes).map(([monthYear, notes]) => (
            <div key={monthYear} className="mt-6">
              <div className="text-md italic text-center opacity-45">
                {monthYear}
              </div>
              <div className="mt-2 space-y-2">
                {notes.map(({ date, note }) => (
                  <div
                    key={date}
                    onDoubleClick={() => {
                      setEditNoteId(date);
                      setEditedNoteName(note);
                    }}
                    className="flex items-center cursor-pointer hover:scale-95 duration-200 p-3 justify-between pl-8 pr-8 bg-[#151d26] border-white border-opacity-20 border-2 bg-opacity-50 rounded-lg shadow-md w-full"
                  >
                    {editNoteId === date ? (
                      <input
                        type="text"
                        value={editedNoteName}
                        onChange={(e) => setEditedNoteName(e.target.value)}
                        onBlur={() => handleEditNote(date)}
                        placeholder="Topic Name"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditNote(date);
                        }}
                        autoFocus
                        className="w-96 bg-gray-800 p-2 rounded-md text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="tracking-wider truncate w-96 overflow-ellipsis">
                        {note}
                      </p>
                    )}
                    <p className="font-thin tracking-widest opacity-55 text-sm text-white">
                      {dayjs(date).format("DD/MMM/YYYY")}
                    </p>
                    <button
                      onClick={() => handleShowNotes(date)}
                      className="font-thin tracking-widest opacity-55 text-sm hover:text-blue-300  text-white"
                    >
                      View
                    </button>
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
