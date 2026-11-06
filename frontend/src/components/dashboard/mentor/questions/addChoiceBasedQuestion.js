import React, { useState, useEffect } from "react";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import { addChoiceBasedProblem } from "../../../../APIs/problem";
import { useAppContext } from "../../../../context/userContext";
import toast from "react-hot-toast";

function Questions({
  statement,
  setStatement,
  options,
  setOptions,
  tags,
  setTags,
  id,
  setView,
}) {
  const { user } = useAppContext();
  const [newTag, setNewTag] = useState("");
  const [isUploadDisabled, setIsUploadDisabled] = useState(true);

  useEffect(() => {
    setIsUploadDisabled(
      statement.trim() === "" ||
        options.length < 2 ||
        !options.some((opt) => opt.IsValid) ||
        tags.length === 0
    );
  }, [statement, options, tags]);

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, { Name: "", IsValid: false }]);
    } else {
      toast.error("You can add a maximum of 5 options.");
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    } else {
      toast.error("At least two options are required.");
    }
  };

  const handleOptionChange = (index, field, value) => {
    setOptions((prevOptions) =>
      prevOptions.map((opt, i) =>
        field === "IsValid"
          ? { ...opt, IsValid: i === index }
          : i === index
          ? { ...opt, [field]: value }
          : opt
      )
    );
  };

  const handleRemoveTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (newTag.trim() === "") {
      toast.error("Tag cannot be empty.");
      return;
    }
    if (tags.includes(newTag.trim())) {
      toast.error("Tag already exists.");
      return;
    }
    setTags((prev) => [...prev, newTag.trim()]);
    setNewTag("");
  };

  const handleUpload = async () => {
    setIsUploadDisabled(true);
    const res = await addChoiceBasedProblem({
      Id: user._id,
      Statement: statement.trim(),
      Options: options,
      Type: true,
      Tags: tags,
      ProblemId: id,
    });

    if (res.status === 201) {
      toast.success(res.message);
      setView("MCQSheet");
    } else {
      toast.error(res.message);
    }
    setIsUploadDisabled(false);
  };

  return (
    <div className="min-h-screen w-full text-white flex flex-col">
      <div className="relative">
        <div className="flex justify-end p-4">
          <button
            onClick={handleUpload}
            disabled={isUploadDisabled}
            className={`absolute w-36 flex right-32 items-center justify-center space-x-3 border rounded-lg text-sm px-5 py-2.5 transition-all ${
              isUploadDisabled
                ? "text-gray-500 cursor-not-allowed border-gray-500"
                : "text-slate-500 hover:text-white hover:bg-slate-800"
            }`}
          >
            <h2 className="tracking-wide">Upload</h2>
            <BookmarkBorderOutlinedIcon />
          </button>
        </div>

        <div className="w-full flex flex-col">
          <section className="w-full h-68 mb-20 flex justify-center">
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="h-60 w-4/5 mt-16 bg-transparent border-2 p-4 focus:outline-none"
              placeholder="Enter the Statement"
            />
          </section>

          <div className="flex justify-center items-center w-full flex-col">
            <div className="w-4/5 mt-0 flex flex-col">
              <h2 className="text-xl border-b-2 pb-2 w-full mb-4 font-serif">
                Options
              </h2>
              {options.map((option, index) => (
                <div
                  key={index}
                  className="mb-4 flex flex-row items-center space-x-4 p-2"
                >
                  <input
                    type="text"
                    className="p-2 pl-4 text-sm border-2 rounded bg-transparent focus:outline-none"
                    placeholder="Option"
                    value={option.Name}
                    onChange={(e) =>
                      handleOptionChange(index, "Name", e.target.value)
                    }
                  />
                  <input
                    type="checkbox"
                    checked={option.IsValid}
                    onChange={() => handleOptionChange(index, "IsValid", true)}
                  />
                  <button
                    onClick={() => handleRemoveOption(index)}
                    className="text-red-500 bg-slate-400 bg-opacity-10 rounded-md px-4 py-1 hover:scale-95 duration-200"
                  >
                    <DeleteForeverOutlinedIcon />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddOption}
                className="bg-slate-200 text-slate-900 mt-4 p-2 rounded mb-10 w-60 bg-opacity-60 hover:bg-slate-800 hover:text-white duration-300"
              >
                Add Option
              </button>
            </div>

            <div className="flex flex-col justify-center w-4/5 rounded-lg bg-opacity-15 mb-20 mt-4">
              <h1 className="text-2xl border-b-2 pb-2 w-full mb-2">
                Question Tags
              </h1>
              <div className="m-4 flex flex-row space-x-4 items-center">
                {tags.map((tag, i) => (
                  <h1
                    key={i}
                    onClick={() => handleRemoveTag(i)}
                    className="bg-slate-400 bg-opacity-20 hover:bg-opacity-60 cursor-pointer transition-all duration-200 px-4 py-1 rounded-md"
                  >
                    {tag}
                  </h1>
                ))}
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="bg-transparent p-1 border-2 rounded-md pl-2 focus:outline-none w-32"
                  placeholder="New tag"
                />
                <button
                  onClick={handleAddTag}
                  className="m-1 bg-slate-300 bg-opacity-40 ml-2 p-1 rounded-lg"
                >
                  <AddCircleOutlineRoundedIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Questions;
