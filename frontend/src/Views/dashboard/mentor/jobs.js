import React, { useEffect, useState } from "react";
import { myJobs } from "./../../../APIs/mentor";
import toast from "react-hot-toast";
import JobModel from "./../../../components/dashboard/mentor/createJob";
import JobCard from "./../../../components/dashboard/mentor/jobCard";
import ControlPointRoundedIcon from "@mui/icons-material/ControlPointRounded";
import { useAppContext } from "../../../context/userContext";
function Jobs() {
  const { user } = useAppContext();

  const [postedJobs, setPostedJobs] = useState([]);
  const [addJobModel, setAddJobModel] = useState(false);
  const [deleteJob, setDeleteJob] = useState(false);

  useEffect(() => {
    const getJobData = async () => {
      if (user !== undefined) {
        let res = await myJobs({ Id: user?._id });
        if (res.status == 200) {
          setPostedJobs(res.jobs);
        } else {
          toast.error(res.message);
        }
      }
    };
    getJobData();
  }, [user, addJobModel, deleteJob]);

  if (!user.Verified) {
    return (
      <div className="min-h-screen text-white text-lg opacity-50 flex justify-center items-center flex-col space-y-2">
        <h1>Your request has not been approved by the manager yet.</h1>
        <h1>Please contact the managers as soon as possible to proceed.</h1>
      </div>
    );
  }

  return (
    <div className="text-white " style={{ scrollbarWidth: "none" }}>
      <div className="relative pb-20">
        <button
          onClick={() => setAddJobModel(!addJobModel)}
          className="absolute right-40 w-40 flex flex-row items-center justify-center top-4 space-x-2 border focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 border-slate-500 text-slate-500 hover:text-white hover:bg-slate-800 focus:ring-slate-500"
        >
          <h2>Create Job</h2>
          <ControlPointRoundedIcon></ControlPointRoundedIcon>
        </button>
        {addJobModel && (
          <JobModel author={user?._id} setOpen={setAddJobModel}></JobModel>
        )}
      </div>
      <div className="h-max">
        {postedJobs.length == 0 ? (
          <div className="flex justify-center items-center p-80">
            <h1 className="text-2xl opacity-50 font-serif">
              You have not posted any Job yet
            </h1>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center mb-10 min-h-screen">
            {postedJobs
              .slice()
              .reverse()
              .map((job) => (
                <JobCard data={job} setDeleteJob={setDeleteJob}></JobCard>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Jobs;
