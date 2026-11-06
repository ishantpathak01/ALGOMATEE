import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { motion } from "framer-motion";
import { useAppContext } from "../../../../context/userContext";
import { getRewardTransections } from "./../../../../APIs/user";
import toast from "react-hot-toast";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";

function TransactionHistoryModal({ open, onClose }) {
  const [transactions, setTransactions] = useState([]);
  const { user } = useAppContext();

  useEffect(() => {
    const getData = async () => {
      let res = await getRewardTransections({ Id: user?._id });
      if (res.status === 200) {
        setTransactions(res.data.reverse());
      } else toast.error(res.message);
    };
    getData();
  }, [user]);

  return (
    <Dialog open={open} onClose={onClose} className="backdrop-blur-md ">
      <div className="bg-slate-900/80 border border-gray-600 rounded-lg shadow-xl p-6 text-white backdrop-blur-lg">
        <DialogTitle className="text-center text-2xl font-semibold flex items-center justify-center gap-2">
          <HistoryIcon className="text-blue-400" /> Transaction History
        </DialogTitle>
        <DialogContent className="mt-4">
          {transactions.length > 0 ? (
            <div className="max-h-80 overflow-y-auto custom-scrollbar pr-1">
              {transactions.map((tx, index) => (
                <motion.div
                  key={index}
                  className="bg-white/10 p-4 rounded-lg mb-3 flex justify-between items-center border border-gray-500 shadow-md"
                >
                  <span className="font-medium text-slate-200">
                    {tx.details}
                  </span>
                  <span
                    className={`text-wrap text-center ${
                      tx.category === "Credit"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {tx.category === "Credit"
                      ? `+${tx.amount || 1} ${
                          tx.amount == 1 ? "Coin" : "Coins"
                        }`
                      : `-${tx.amount || 25} ${
                          tx.amount == 1 ? "Coin" : "Coins"
                        }`}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">No transactions found</p>
          )}
        </DialogContent>
        <DialogActions className="flex justify-center mt-4">
          <motion.button
            className="border border-blue-500 text-blue-300 hover:bg-blue-600 px-5 py-2 rounded-lg shadow-md transition-all flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
          >
            <CloseIcon /> Close
          </motion.button>
        </DialogActions>
      </div>
    </Dialog>
  );
}

export default TransactionHistoryModal;
