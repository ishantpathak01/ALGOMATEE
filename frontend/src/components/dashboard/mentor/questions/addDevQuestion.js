import React, { useEffect, useState, useRef, useCallback } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Code as CodeIcon,
  Save as SaveIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { addDevQuestion, getDevProblem } from "../../../../APIs/problem";
import { useAppContext } from "./../../../../context/userContext";

// Custom toolbar configuration
const CustomToolbar = () => (
  <div id="toolbar">
    <select className="ql-header">
      <option value="1">Heading 1</option>
      <option value="2">Heading 2</option>
      <option value="3">Heading 3</option>
      <option value="">Normal</option>
    </select>
    <button className="ql-bold" />
    <button className="ql-italic" />
    <button className="ql-underline" />
    <button className="ql-strike" />
    <button className="ql-list" value="ordered" />
    <button className="ql-list" value="bullet" />
    <button className="ql-link" />
    <button className="ql-image" />
  </div>
);

const AddDevQuestion = ({ id, setView }) => {
  const { user } = useAppContext();
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [files, setFiles] = useState([]);
  const [editingFileIndex, setEditingFileIndex] = useState(null);
  const [newFile, setNewFile] = useState({
    name: "",
    content: "",
    boilerplate: "",
    testingPoints: "",
  });
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const quillRef = useRef(null);

  // Memoized editor modules to prevent unnecessary recreations
  const modules = useRef({
    toolbar: {
      container: "#toolbar",
      handlers: {
        image: imageHandler,
      },
    },
    clipboard: {
      matchVisual: false,
    },
  }).current;

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
    "align",
  ];

  useEffect(() => {
    if (id) {
      const getProblem = async () => {
        try {
          let res = await getDevProblem({ Id: id, UserType: "Mentor" });
          console.log(res.data);
          if (res.status === 200) {
            setTitle(res.data.Name);
            setStatement(res.data.Statement || "");
            setFiles(res.data.Files || []);
          }
        } catch (error) {
          toast.error("Failed to load problem data");
        }
      };
      getProblem();
    }
  }, [id]);

  const handleEditorChange = useCallback((content) => {
    setStatement(content);
  }, []);

  function imageHandler() {
    const url = prompt("Enter the image URL:");
    if (url) {
      const editor = quillRef.current?.getEditor();
      if (editor) {
        const range = editor.getSelection();
        editor.insertEmbed(range.index, "image", url, "user");
        setTimeout(() => {
          const img = editor.container.querySelector(`img[src="${url}"]`);
          if (img) {
            img.classList.add("mx-auto", "block");
          }
        }, 10);
      }
    }
  }

  const handleAddFile = () => {
    if (!newFile.name.trim()) {
      toast.error("File name is required");
      return;
    }

    const fileName = newFile.name.includes(".")
      ? newFile.name
      : `${newFile.name}.html`;

    const fileData = {
      name: fileName,
      content: newFile.content,
      boilerplate: newFile.boilerplate,
      testingPoints: newFile.testingPoints,
    };

    if (editingFileIndex !== null) {
      setFiles(
        files.map((file, i) => (i === editingFileIndex ? fileData : file))
      );
      setEditingFileIndex(null);
    } else {
      setFiles([...files, fileData]);
    }

    resetFileForm();
    setShowFileDialog(false);
  };

  const resetFileForm = () => {
    setNewFile({
      name: "",
      content: "",
      boilerplate: "",
      testingPoints: "",
    });
  };

  const handleEditFile = (index) => {
    setEditingFileIndex(index);
    setNewFile({
      name: files[index].name.replace(".html", ""),
      content: files[index].content,
      boilerplate: files[index].boilerplate,
      testingPoints: files[index].testingPoints,
    });
    setShowFileDialog(true);
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !statement.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const res = await addDevQuestion({
        Id: user?._id,
        ProblemId: id,
        Name: title,
        Statement: statement,
        Files: files,
      });

      if (res.status === 201) {
        toast.success(res.message);
        setView("DevSheetSection");
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Failed to save question");
    }
  };

  return (
    <div className="w-full p-6 text-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-white">
        {id ? "Edit" : "Add New"} Development Question
      </h1>
      <div className="border-b border-gray-700 my-6"></div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-3 hover:bg-slate-400 hover:bg-opacity-20 border border-slate-400 text-slate-400 rounded-md text-sm font-medium transition-colors"
        >
          <SaveIcon className="!w-5 !h-5" />
          Save Question
        </button>
      </div>

      <div className="space-y-2">
        <div className="space-y-2 mb-8">
          <label
            htmlFor="problem-title"
            className="block text-sm font-medium text-white"
          >
            Problem Title
          </label>
          <input
            id="problem-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 focus:outline-none border bg-gray-800 bg-opacity-30 text-white"
            placeholder="Landing Page of E-Commerce"
          />
        </div>

        <h2 className="text-xl font-semibold text-white">Problem Statement</h2>
        <CustomToolbar />
        <div className="border border-gray-700 rounded-lg overflow-hidden h-[400px]">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={statement}
            onChange={handleEditorChange}
            modules={modules}
            formats={formats}
            className="bg-gray-800 bg-opacity-25 text-white h-[calc(100%-42px)]"
            placeholder="Write your problem statement here..."
            preserveWhitespace
          />
        </div>
      </div>

      <div className="space-y-4 mt-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Project Files</h2>
          <button
            type="button"
            onClick={() => {
              resetFileForm();
              setShowFileDialog(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors"
          >
            <AddIcon className="!w-5 !h-5" />
            Add New File
          </button>
        </div>

        {files.length === 0 && !showFileDialog && (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-lg text-center text-gray-400">
            <CodeIcon className="!w-10 !h-10 mb-3 text-gray-500" />
            <p>
              No files added yet. Click the button above to add project files.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {files.map((file, index) => (
            <div
              key={index}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 px-3 py-1 border border-blue-500 text-blue-400 rounded-full text-sm">
                  <CodeIcon className="!w-4 !h-4" />
                  <span>{file.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditFile(index)}
                    className="text-blue-400 hover:text-blue-300 p-1"
                    title="Edit file"
                  >
                    <EditIcon className="!w-5 !h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Delete file"
                  >
                    <DeleteIcon className="!w-5 !h-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-400 mb-1">
                  Content Preview:
                </h3>
                <pre className="bg-gray-900 p-3 rounded-md overflow-x-auto text-xs font-mono text-gray-300 border border-gray-700 max-h-40 overflow-y-auto">
                  {file?.content?.substring(0, 200)}
                  {file?.content?.length > 200 ? "..." : ""}
                </pre>
              </div>

              <div className="mt-3">
                <h3 className="text-sm font-medium text-gray-400 mb-1">
                  Testing Points:
                </h3>
                <div className="bg-gray-900 p-3 rounded-md text-sm text-gray-300 border border-gray-700 max-h-32 overflow-y-auto">
                  {file.testingPoints || (
                    <span className="text-gray-500">
                      No testing points defined
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {showFileDialog && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">
              {editingFileIndex !== null ? "Edit File" : "Add New File"}
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="file-name"
                  className="block text-sm font-medium text-gray-400"
                >
                  File Name (e.g., index, script, styles)
                </label>
                <div className="flex items-center">
                  <input
                    id="file-name"
                    type="text"
                    value={newFile.name}
                    onChange={(e) =>
                      setNewFile({ ...newFile, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 rounded-l-md border border-gray-700 bg-gray-900 text-white focus:outline-none"
                    placeholder="index"
                  />
                  <span className="px-4 py-2 bg-gray-700 text-gray-300 border border-l-0 border-gray-700 rounded-r-md">
                    .html
                  </span>
                </div>
              </div>

              <div className="border-b border-gray-700">
                <nav className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab("content")}
                    className={`py-2 px-3 text-sm font-medium rounded-t-md ${
                      activeTab === "content"
                        ? "bg-gray-700 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Content
                  </button>
                  <button
                    onClick={() => setActiveTab("boilerplate")}
                    className={`py-2 px-3 text-sm font-medium rounded-t-md ${
                      activeTab === "boilerplate"
                        ? "bg-gray-700 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Boilerplate
                  </button>
                  <button
                    onClick={() => setActiveTab("testing")}
                    className={`py-2 px-3 text-sm font-medium rounded-t-md ${
                      activeTab === "testing"
                        ? "bg-gray-700 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Testing Points
                  </button>
                </nav>
              </div>

              {activeTab === "content" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400">
                    File Content
                  </label>
                  <textarea
                    value={newFile.content}
                    onChange={(e) =>
                      setNewFile({ ...newFile, content: e.target.value })
                    }
                    placeholder={`<!-- Add your HTML here -->\n<div>Your content goes here</div>`}
                    className="w-full px-4 py-2 rounded-md border border-gray-700 bg-gray-900 text-white font-mono text-sm focus:outline-none min-h-[200px]"
                    rows={8}
                  />
                </div>
              )}

              {activeTab === "boilerplate" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400">
                    Boilerplate Code (starter code for students)
                  </label>
                  <textarea
                    value={newFile.boilerplate}
                    onChange={(e) =>
                      setNewFile({ ...newFile, boilerplate: e.target.value })
                    }
                    placeholder={`<!-- Starter code -->\n<div class="container">\n  <!-- Students will build on this -->\n</div>`}
                    className="w-full px-4 py-2 rounded-md border border-gray-700 bg-gray-900 text-white font-mono text-sm focus:outline-none min-h-[200px]"
                    rows={8}
                  />
                </div>
              )}

              {activeTab === "testing" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400">
                    AI Testing Points (one per line)
                  </label>
                  <textarea
                    value={newFile.testingPoints}
                    onChange={(e) =>
                      setNewFile({ ...newFile, testingPoints: e.target.value })
                    }
                    placeholder={`- Check if the navbar is responsive\n- Verify the contact form has validation\n- Ensure all images have alt text`}
                    className="w-full px-4 py-2 rounded-md border border-gray-700 bg-gray-900 text-white font-mono text-sm focus:outline-none min-h-[200px]"
                    rows={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    List specific elements or functionality the AI should check
                    when evaluating submissions.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowFileDialog(false);
                  setEditingFileIndex(null);
                }}
                className="px-4 py-2 border border-gray-600 hover:bg-gray-700 text-gray-300 rounded-full text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddFile}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors"
              >
                <SaveIcon className="!w-5 !h-5" />
                {editingFileIndex !== null ? "Update File" : "Save File"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddDevQuestion;
