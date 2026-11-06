import React from "react";
import { motion } from "framer-motion";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

function ConfirmationModal({ open, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose} className="rounded-lg shadow-lg ">
      <DialogTitle className="text-center text-xl font-semibold text-gray-800 bg-gray-100 py-4">
        Confirm Your Doubt Request
      </DialogTitle>
      <DialogContent className="p-5 text-gray-700 text-sm bg-white">
        <p className="m-2 text-center">Each doubt costs <span className="font-semibold text-blue-600">25 coins</span>. This will be deducted from your balance.</p>
        <p className="m-2 text-center mt-0">Make sure your question is clear and precise for an effective mentor response.</p>
        <p className="text-gray-600 font-medium text-center">Not enough coins? Try solving challenges to earn more.</p>
        <p className="text-gray-600 font-medium text-center mt-2">If your doubt is rejected by the mentor, the coins will be added back to your account.</p>
      </DialogContent>
      <DialogActions className="flex justify-center gap-4 bg-gray-50 py-4 mb-2 rounded-b-lg">
        <motion.button 
          className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium px-5 py-1.5 rounded-md shadow-md transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
        >
          Cancel
        </motion.button>
        <motion.button 
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-5 py-2 mr-4 rounded-md shadow-md flex items-center gap-2 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onConfirm}
        >
          <TaskAltRoundedIcon /> <span>Confirm</span>
        </motion.button>
      </DialogActions>
    </Dialog>
  );
}
export default ConfirmationModal;