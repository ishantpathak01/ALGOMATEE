import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { useState, useRef, useEffect } from "react";
import BackupIcon from "@mui/icons-material/Backup";
import { getNotes, saveNotes } from "../APIs/classroom";
import { useAppContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Editor() {
  const [notesData, setNotesData] = useState(null);
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const params = new URLSearchParams(window.location.search);
  const section = params.get("section");
  const date = params.get("date");
  const { user } = useAppContext();

  if (!user) {
    navigate("/");
  }

  const handleMount = (editor) => {
    editorRef.current = editor;
  };

  const saveDrawing = async () => {
    if (!editorRef.current) {
      toast.error("Editor not initialized.");
      return;
    }

    const drawingData = editorRef.current.store.getSnapshot();
    try {
      const res = await saveNotes({
        Date: date,
        ClassroomId: section,
        Id: user?._id,
        Data: JSON.stringify(drawingData),
      });

      if (res.status === 200) {
        toast.success(res.message || "Notes saved successfully!");
      } else {
        toast.error(res.message || "Failed to save notes.");
      }
    } catch (error) {
      toast.error(error.message || "Failed to save notes.");
    }
  };

  useEffect(() => {
    const getNotesData = async () => {
      try {
        const res = await getNotes({
          Date: date,
          ClassroomId: section,
        });
        if (res.status === 200) {
          if (res.data?.Data) {
            setNotesData(res.data.Data);
          } else {
            toast.error("No valid drawing data found in response.");
          }
        }
      } catch (error) {
        toast.error(error.message || "Failed to fetch drawing data.");
      }
    };

    if (date && section) {
      getNotesData();
    }
  }, [date, section]);

  useEffect(() => {
    if (notesData && editorRef.current) {
      try {
        editorRef.current.store.loadSnapshot(JSON.parse(notesData));
      } catch (error) {
        toast.error("Failed to load drawing data: " + error.message);
      }
    }
  }, [notesData]);

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw onMount={handleMount} />
      {user?.Type === "Mentor" && (
        <button
          onClick={saveDrawing}
          className="absolute top-10 p-3 w-40 flex flex-row justify-center items-center space-x-3 bg-blue-500 text-white rounded-br-md hover:bg-blue-600 transition z-10"
        >
          <p>Save</p>
          <BackupIcon />
        </button>
      )}
    </div>
  );
}
