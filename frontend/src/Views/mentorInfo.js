import React, { useEffect, useState } from "react";
import MentorData from "../components/mentorSearch/mentorData";
import Form from "../components/mentorSearch/form";
import { useParams } from "react-router-dom";
import { getMentorData } from "./../APIs/user";
import toast from "react-hot-toast";
function MentorInfo() {
  const { id } = useParams();
  const [mentor, setMentor] = useState();
  useEffect(() => {
    const getData = async () => {
      let data = await getMentorData({ Id: id });
      if (data.status == 200) {
        setMentor(data.data);
      } else {
        toast.error(data.message);
      }
    };
    getData();
  }, []);

  return (
    <div className="flex flex-row w-full h-screen pt-16">
      <div className="w-2/5 bg-gradient-to-b from-gray-900 to-black_A flex items-center">
        <MentorData data={mentor}></MentorData>
      </div>
      <div className="w-3/5 bg-slate-400 flex items-center">
        <Form data={mentor}></Form>
      </div>
    </div>
  );
}

export default MentorInfo;
