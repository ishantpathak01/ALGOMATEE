import React, { useEffect, useState } from "react";
import { Modal, Avatar } from "@mui/material";
import { motion } from "framer-motion";
import { getAssignmentScore } from "./../../../../APIs/classroom";
import { useAppContext } from "../../../../context/userContext";
function ScoreCardModal({ close, assignmentId }) {
  const [students, setStudents] = useState([]);
  const { user } = useAppContext();

  useEffect(() => {
    const getScore = async () => {
      let res = await getAssignmentScore({
        Id: user?._id,
        AssignmentId: assignmentId,
      });
      if (res.status == 200) {
        setStudents(res.data);
      }
    };
    getScore();
  }, []);

  const getScoreColor = (totalscore) => {
    if (totalscore >= 90) {
      return "bg-gradient-to-r from-green-400 to-green-600";
    } else if (totalscore >= 80) {
      return "bg-gradient-to-r from-blue-400 to-blue-600";
    } else if (totalscore >= 70) {
      return "bg-gradient-to-r from-yellow-400 to-yellow-600";
    } else if (totalscore >= 60) {
      return "bg-gradient-to-r from-orange-400 to-orange-600";
    } else {
      return "bg-gradient-to-r from-red-400 to-red-600";
    }
  };

  return (
    <Modal
      open={true}
      onClose={close}
      className="flex justify-center items-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5 }}
        className="w-4/5 bg-black_B text-white p-6 rounded-lg shadow-xl h-4/5 overflow-y-auto custom-scrollbar border-8 border-black_B"
      >
        <h1 className="text-center border-b-2 pb-2 mb-4 text-4xl font-bold text-gradient">
          Students' Score Card 🎓
        </h1>

        <div className="space-y-6">
          {students.map((student, index) => (
            <motion.div
              key={index}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-r from-gray-800 to-gray-700 p-4 rounded-lg flex justify-between items-center w-full shadow-md"
            >
              <Avatar
                src={`https://robohash.org/${student.name}?size=100x100`}
                alt={student.name}
                sx={{ width: 50, height: 50, border: "2px solid grey" }}
              />
              <div className="flex-1 ml-4">
                <h2 className="text-lg font-semibold">{student.name}</h2>
                <p className="text-sm text-gray-300">{student.email}</p>
              </div>
              <div className="w-2/5">
                <p className="text-sm mb-1">Score: {student.totalscore}%</p>
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${student.totalscore}%` }}
                  transition={{ duration: 1 }}
                  className={`h-3 rounded-full ${getScoreColor(
                    student.totalscore
                  )}`}
                ></motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={close}
          className="mt-8 bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-full block mx-auto shadow-lg"
        >
          Close
        </motion.button>
      </motion.div>
    </Modal>
  );
}

export default ScoreCardModal;
