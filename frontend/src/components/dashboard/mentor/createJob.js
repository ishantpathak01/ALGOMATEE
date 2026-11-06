import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
} from "@mui/material";
import ControlPointRoundedIcon from "@mui/icons-material/ControlPointRounded";
import JobData from "../../../ConstantData/jobs";
import { postJob } from "./../../../APIs/mentor";
import toast from "react-hot-toast";

function CreateJob({ author, setOpen }) {
  const [job, setJob] = useState({
    Company: "",
    Position: "",
    Experience: "Fresher",
    ApplyLink: "",
    Location: "Bangalore, India",
    Type: "Remote",
    Salary: "",
    Author: author,
  });

  const handleInputChange = (e) => {
    setJob({
      ...job,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    if (
      job.Company.trim() != "" &&
      job.Position.trim() != "" &&
      job.Experience.trim() != "" &&
      job.ApplyLink.trim() != "" &&
      job.Location.trim() != "" &&
      job.Type.trim() != "" &&
      job.Salary.trim() != "" &&
      job.Author.trim() != ""
    ) {
      let res = await postJob({
        Id: author,
        JobData: job,
      });
      if (res.status == 200) {
        toast.success(res.message);
        setTimeout(() => {
          setOpen(false);
        }, 2000);
      } else {
        toast.error(res.message);
      }
    } else {
      toast.error("Please fill all the fields.");
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={true} onClose={handleClose} className="rounded-lg text-white">
      <DialogTitle
        style={{
          color: "#4d6169",
          textAlign: "center",
          backgroundColor: "#1b1e24",
          borderRadius: "10px 10px 0 0",
        }}
      >
        <h1 className="font-semibold text-2xl border-b-2 pb-2 border-slate-400">
          New Job
        </h1>
      </DialogTitle>
      <DialogContent
        style={{
          backgroundColor: "#1b1e24",
          color: "white",
          scrollbarWidth: "none",
          borderRadius: "0 0 10px 10px",
        }}
      >
        <div style={{ padding: "20px" }}>
          <input
            type="text"
            placeholder="Company"
            name="Company"
            style={{
              width: "100%",
              padding: "10px",
              margin: "10px 0",
              backgroundColor: "#14171c",
              color: "#ffffff",
              borderRadius: "5px",
            }}
            value={job.Company}
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Position"
            name="Position"
            style={{
              width: "100%",
              padding: "10px",
              margin: "10px 0",
              backgroundColor: "#14171c",
              color: "#ffffff",
              borderRadius: "5px",
            }}
            value={job.Position}
            onChange={handleInputChange}
          />
          <Select
            name="Experience"
            fullWidth
            margin="normal"
            style={{
              backgroundColor: "#14171c",
              color: "#ffffff",
              marginTop: "10px",
              borderRadius: "5px",
            }}
            value={job.Experience}
            onChange={handleInputChange}
          >
            {JobData?.ExperienceInYears.map((exp) => (
              <MenuItem value={exp}>{exp}</MenuItem>
            ))}
          </Select>
          <Select
            name="Location"
            fullWidth
            margin="normal"
            style={{
              backgroundColor: "#14171c",
              color: "#ffffff",
              marginTop: "15px",
              borderRadius: "5px",
            }}
            value={job.Location}
            onChange={handleInputChange}
          >
            {JobData?.ITJobLocations.map((loc) => (
              <MenuItem value={loc}>{loc}</MenuItem>
            ))}
          </Select>
          <Select
            name="Type"
            fullWidth
            margin="normal"
            style={{
              backgroundColor: "#14171c",
              color: "#ffffff",
              marginTop: "15px",
              marginBottom: "8px",
              borderRadius: "5px",
            }}
            value={job.Type}
            onChange={handleInputChange}
          >
            {JobData.JobTypes.map((type) => (
              <MenuItem value={type}>{type}</MenuItem>
            ))}
          </Select>
          <input
            type="text"
            placeholder="Apply Link"
            name="ApplyLink"
            style={{
              width: "100%",
              padding: "10px",
              margin: "10px 0",
              backgroundColor: "#14171c",
              color: "#ffffff",
              borderRadius: "5px",
            }}
            value={job.ApplyLink}
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Salary"
            name="Salary"
            style={{
              width: "100%",
              padding: "10px",
              margin: "10px 0",
              backgroundColor: "#14171c",
              color: "#ffffff",
              borderRadius: "5px",
            }}
            value={job.Salary}
            onChange={handleInputChange}
          />
          <button
            onClick={handleSubmit}
            className="w-full flex mt-4 flex-row items-center justify-center space-x-2 border focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 border-slate-500 text-slate-500 hover:text-white hover:bg-slate-800 focus:ring-slate-500"
          >
            <h2>Create Job</h2>
            <ControlPointRoundedIcon></ControlPointRoundedIcon>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateJob;
