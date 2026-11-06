import React, { useState } from "react";
import { useAppContext } from "../../../context/userContext";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import AddAPhotoOutlinedIcon from "@mui/icons-material/AddAPhotoOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import GTranslateIcon from "@mui/icons-material/GTranslate";
import { updateMentorProfile } from "./../../../APIs/mentor";
import { expertise as ExpertiseList } from "./../../../ConstantData/mentors";
import toast from "react-hot-toast";
function Profile() {
  const { user, setUser } = useAppContext();
  const [picture, setPicture] = useState(null);
  const [updatedUser, setUpdatedUser] = useState({
    ...user,
    Expertise: user?.Expertise || {},
  });
  const [editing, setEditing] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUpdatedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    let btn = document.getElementById("update");
    btn.disabled = true;
    btn.style.cssText = "cursor: not-allowed; opacity: 50%;";
    const formData = new FormData();
    formData.append("Id", user?._id);
    formData.append("Data", JSON.stringify(updatedUser));
    formData.append("Picture", picture);

    let res = await updateMentorProfile(formData);
    if (res.status == 200) {
      toast.success(res.message);
      setUser(updatedUser);
      if (picture) setUser({ ...user, Picture: URL.createObjectURL(picture) });
      setEditing(false);
    } else {
      toast.error(res.message);
      setUpdatedUser(user);
    }
    btn.disabled = false;
    btn.style.cssText = "cursor: pointer; opacity: 100%;";
  };

  return (
    <div className="text-white min-h-screen">
      <div className="relative pb-4">
        {editing ? (
          <button
            onClick={handleUpdateProfile}
            id="update"
            className="absolute right-20 w-32 flex flex-row items-center justify-center top-4 space-x-2 border focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 border-slate-500 text-slate-500 hover:text-white hover:bg-slate-800 focus:ring-slate-500"
          >
            <h2>Update</h2>
            <TaskAltIcon fontSize="small"></TaskAltIcon>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="absolute right-20 w-34 flex flex-row items-center justify-center top-4 space-x-2 border focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 border-slate-500 text-slate-500 hover:text-white hover:bg-slate-800 focus:ring-slate-500"
          >
            <h2>Edit profile</h2>
            <ModeEditOutlineOutlinedIcon fontSize="small"></ModeEditOutlineOutlinedIcon>
          </button>
        )}
      </div>
      <div>
        <div className=" flex flex-row justify-around m-20 mb-10 mt-8 pt-10">
          <div className="bg-[#2c303d] bg-opacity-50 w-2/5 mr-4 p-8 flex flex-col justify-center items-center rounded-xl">
            {editing ? (
              <label className="h-40 w-40 rounded-full bg-slate-400 shadow-lg text-slate-900 flex justify-center items-center border-2 border-slate-900 hover:bg-opacity-55 transition-all duration-200 cursor-pointer">
                <AddAPhotoOutlinedIcon sx={{ fontSize: "40px" }} />
                <input
                  onChange={(e) => {
                    setPicture(e.target.files[0]);
                  }}
                  type="file"
                  accept="image/png"
                  className="hidden"
                />
              </label>
            ) : (
              <img
                src={user?.Picture}
                className="h-40 w-40 rounded-full border-2 p-1"
                alt="Profile"
              />
            )}

            <h1 className="mt-4 text-lg font-semibold font-sans">
              {editing ? (
                <input
                  className="bg-slate-200 bg-opacity-10 rounded-md pl-2 py-1 focus:outline-none mb-2"
                  placeholder="Name"
                  value={updatedUser?.Name || ""}
                  name="Name"
                  onChange={handleInputChange}
                />
              ) : (
                <p>{user?.Name || "Unknown User"}</p>
              )}
            </h1>

            <h2 className="font-serif">
              <p>{user?.Email || "No email provided"}</p>
            </h2>

            <h2 className="font-serif mt-2 opacity-50 italic">
              <p>password</p>
            </h2>
          </div>

          <div className="bg-[#2c303d] bg-opacity-50 w-3/5 p-6 flex flex-col justify-center items-center rounded-xl">
            {editing ? (
              <textarea
                className="bg-slate-200 bg-opacity-20 rounded-xl p-4 text-xl"
                value={updatedUser?.About}
                placeholder="Enter details about yourself. (max 200 chars)"
                rows={8}
                cols={50}
                name="About"
                maxLength={200}
                onChange={handleInputChange}
              ></textarea>
            ) : (
              <p className="text-xl p-4 opacity-75 text-center">
                {user?.About}
              </p>
            )}
          </div>
        </div>
        <div className="bg-[#2c303d] bg-opacity-50 m-28 mt-0 mb-10 rounded-xl p-6 flex flex-row justify-around">
          <div>
            {editing ? (
              <div className="flex flex-row space-x-3 justify-center items-center">
                <LocationOnIcon></LocationOnIcon>
                <input
                  value={updatedUser?.Location}
                  placeholder="Location"
                  name="Location"
                  onChange={handleInputChange}
                  className="rounded-md p-2 bg-slate-200 bg-opacity-20 pl-2 pr-2 focus:outline-none"
                ></input>
              </div>
            ) : (
              <div className="flex flex-row space-x-3">
                <LocationOnIcon></LocationOnIcon>
                <h2>{user?.Location}</h2>
              </div>
            )}
          </div>
          <div>
            {editing ? (
              <div className="flex flex-row space-x-3 justify-center items-center">
                <WorkOutlineIcon></WorkOutlineIcon>
                <input
                  value={updatedUser?.Experience}
                  placeholder="Experience in years"
                  name="Experience"
                  onChange={handleInputChange}
                  className="rounded-md p-2 bg-slate-200 bg-opacity-20 pl-2 pr-2 focus:outline-none"
                ></input>
              </div>
            ) : (
              <div className="flex flex-row space-x-3">
                <WorkOutlineIcon></WorkOutlineIcon>
                <h2>{user?.Experience} years</h2>
              </div>
            )}
          </div>
          <div>
            {editing ? (
              <div className="flex flex-row space-x-3 justify-center items-center">
                <GTranslateIcon></GTranslateIcon>
                <input
                  value={updatedUser?.Languages.join(" ")}
                  placeholder="Enter languages (space separated)"
                  name="Languages"
                  onChange={(e) =>
                    setUpdatedUser((prev) => ({
                      ...prev,
                      Languages: e.target.value.split(" "),
                    }))
                  }
                  className="rounded-md p-2 bg-slate-200 bg-opacity-20 pl-2 pr-2 focus:outline-none"
                ></input>
              </div>
            ) : (
              <div className="flex flex-row space-x-3">
                <GTranslateIcon></GTranslateIcon>
                <div className="flex flex-row">
                  {user.Languages.map((lang, i) => (
                    <ul className="flex flex-row space-x-2" key={i}>
                      <li className="ml-2">{lang}</li>
                      {i !== user?.Languages.length - 1 && <p>|</p>}
                    </ul>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="text-white min-h-screen">
        <div className="bg-[#2c303d] bg-opacity-50 m-28 mt-0 mb-10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 border-b-2 pb-2">
            Expertise
          </h2>
          {editing ? (
            <div>
              {Object.entries(ExpertiseList).map(([category, skills]) => (
                <div key={category}>
                  <h2 className="font-sans font-semibold">{category}</h2>
                  <div className="m-2 bg-slate-400 bg-opacity-15 rounded-lg p-2 ">
                    {skills.map((skill) => {
                      const isSelected =
                        updatedUser?.Expertise?.[category]?.includes(skill);
                      return (
                        <button
                          key={skill}
                          onClick={() => {
                            setUpdatedUser((prevUser) => {
                              const newExpertise = { ...prevUser.Expertise };
                              if (!Array.isArray(newExpertise[category])) {
                                newExpertise[category] = [];
                              }
                              if (isSelected) {
                                newExpertise[category] = newExpertise[
                                  category
                                ].filter((s) => s !== skill);
                                if (newExpertise[category].length === 0) {
                                  delete newExpertise[category];
                                }
                              } else {
                                newExpertise[category] = [
                                  ...newExpertise[category],
                                  skill,
                                ];
                              }
                              return { ...prevUser, Expertise: newExpertise };
                            });
                          }}
                          className={`m-2 px-4 py-2 rounded-full shadow hover:scale-95 text-xsm transition-all ${
                            isSelected
                              ? "bg-slate-800 text-white"
                              : "bg-slate-400 text-slate-900"
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {Object.entries(updatedUser?.Expertise).map(
                ([category, skills]) => (
                  <div key={category} className="mb-4">
                    <div className="flex items-center mb-2">
                      <h3 className="font-semibold">{category}</h3>
                    </div>
                    <div
                      className="ml-4 flex flex-row items-center overflow-x-scroll bg-slate-300 bg-opacity-5 rounded-md p-1 "
                      style={{ scrollbarWidth: "none" }}
                    >
                      {skills.map((skill, index) => (
                        <div key={index} className="flex items-center ">
                          <p className="p-1 px-3  rounded-md bg-slate-700 m-1">
                            {skill}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
