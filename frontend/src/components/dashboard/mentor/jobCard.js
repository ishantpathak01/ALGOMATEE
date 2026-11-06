import React from "react";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { deleteJob } from "./../../../APIs/mentor";
import { useAppContext } from "../../../context/userContext";
import toast from "react-hot-toast";

function Card({ data, setDeleteJob }) {
  const { user } = useAppContext();
  const handleDelete = async () => {
    if (user) {
      let res = await deleteJob({
        JobId: data._id,
        Id: user?._id,
      });
      if (res.status == 200) {
        toast.success(res.message);
        setDeleteJob((prevDelete) => !prevDelete);
      } else {
        toast.error(res.message);
      }
    } else {
      toast.success("Some error occured");
    }
  };

  return (
    <div className="w-full flex flex-col justify-between items-center">
      <div className="bg-slate-400  text-slate-950 m-4 p-4 flex flex-row justify-between items-center shadow-lg shadow-black_A  rounded-md cursor-pointer w-2/3">
        <div className="flex flex-col ">
          <div>
            <h1 className="text-lg font-semibold">{data.Position}</h1>
            <h1 className="ml-2 font-serif">{data.Company}</h1>
          </div>
          <div className="flex flex-row mt-1 text-sm opacity-80">
            <h3 className="p-2 pt-0 flex flex-row justify-center items-center space-x-1">
              <p>
                <WorkOutlineOutlinedIcon fontSize="small"></WorkOutlineOutlinedIcon>
              </p>
              <p className="mt-1">{data.Experience}</p>
            </h3>
            |
            <h3 className="p-2 pt-0 flex flex-row justify-center items-center space-x-1">
              <p>
                <RoomOutlinedIcon fontSize="small"></RoomOutlinedIcon>
              </p>
              <p className="mt-1">{data.Location}</p>
            </h3>
            |
            <h3 className="p-2 pt-0 flex flex-row justify-center items-center space-x-1">
              <p>
                <HomeWorkOutlinedIcon fontSize="small"></HomeWorkOutlinedIcon>
              </p>
              <p className="mt-1">{data.Type}</p>
            </h3>
            |
            <h3 className="p-2 pt-0 flex flex-row justify-center items-center space-x-1">
              <p>
                <PaymentsOutlinedIcon fontSize="small"></PaymentsOutlinedIcon>
              </p>
              <p className="mt-1">{data.Salary}</p>
            </h3>
          </div>
        </div>
        <div className="mr-4 ml-4">
          <button
            className="border border-slate-950  px-6 py-1.5 rounded-md text-slate-950 transition-all duration-300 font-serif hover:text-slate-400 hover:bg-slate-950"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default Card;
