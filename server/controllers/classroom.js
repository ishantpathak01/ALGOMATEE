import mongoose from "mongoose";
import Classroom from "./../models/classroom.js";
import User from "./../models/user.js";
import Mentor from "./../models/mentor.js";
import Notes from "../models/Notes.js";
import Assignment from "./../models/Assignment.js";
import AssignmentAttendie from "./../models/assignmentAttendees.js";
import NotesCalendar from "./../models/notesCalendar.js";
import calander from "./../models/notesCalendar.js";

export const createSection = async (req, res) => {
  try {
    const section = new Classroom(req.body);
    await section.save();
    return res.json({ status: 201, message: "Classroom created successfully" });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getMySections = async (req, res) => {
  try {
    const sections = await Classroom.find({ Id: req.query.Id });
    return res.json({ status: 200, data: sections });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const addStudent = async (req, res) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    const { Id, UserEmail, RoomId } = req.body;
    const mentor = await Mentor.findById(Id);
    if (!mentor) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ status: 401, message: "You are not authorized" });
    }
    const user = await User.findOne({ Email: UserEmail }).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ status: 404, message: "Wrong student email-Id" });
    }

    const classroom = await Classroom.findById(RoomId).session(session);
    if (!classroom) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ status: 404, message: "Wrong classroom Id" });
    }
    if (classroom.Id != Id) {
      return res.json({ status: 401, message: "You are not authorized" });
    }
    const existingStudent = classroom.Students.find(
      (student) => student.Email === user.Email
    );

    if (existingStudent) {
      existingStudent.Status = true;
      await classroom.save({ session });
      await session.commitTransaction();
      session.endSession();
      return res.json({
        status: 200,
        message: "Student already exists, status updated to active.",
      });
    }
    classroom.Students.push({
      Name: user.Name,
      Email: user.Email,
      Status: true,
    });
    user.Classrooms.push({
      Name: classroom.Remark,
      Id: RoomId,
      Mentor: mentor.Name,
    });

    await user.save({ session });
    await classroom.save({ session });

    await session.commitTransaction();
    session.endSession();
    return res.json({ status: 200, message: "Student added successfully." });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const saveNotes = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.body.ClassroomId);
    if (!classroom) {
      return res.json({ status: 404, message: "Wrong classroom Id" });
    }
    if (classroom.Id != req.body.Id) {
      return res.json({ status: 401, message: "You are not authorized" });
    }

    const existingNotes = await Notes.findOne({
      ClassroomId: req.body.ClassroomId,
      Date: req.body.Date,
    });

    if (existingNotes) {
      existingNotes.Data = req.body.Data;
      await existingNotes.save();
      return res.json({ status: 200, message: "Notes updated successfully." });
    } else {
      const notes = new Notes(req.body);
      await notes.save();
      return res.json({ status: 200, message: "Notes saved successfully." });
    }
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getNotes = async (req, res) => {
  try {
    const { Date, ClassroomId } = req.body;
    const notes = await Notes.findOne({ Date, ClassroomId });
    if (!notes) {
      return res.json({ status: 404, message: "Notes not found" });
    }
    return res.json({ status: 200, data: notes });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const addAssignment = async (req, res) => {
  try {
    const { AssignmentData, Id, ClassroomId } = req.body;
    const classroom = await Classroom.findById(ClassroomId);
    if (!classroom) {
      return res.json({ status: 404, message: "Wrong classroom Id" });
    }
    if (classroom.Id != Id) {
      return res.json({ status: 403, message: "You are not authorized" });
    }
    const assignment = new Assignment(AssignmentData);
    assignment.ClassroomId = ClassroomId;
    assignment.Id = Id;
    await assignment.save();
    classroom.Assignments.push(assignment._id);
    await classroom.save();
    return res.json({ status: 201, message: "assignment uploaded" });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const { AssignmentData, Id, AssignmentId } = req.body;

    const assignment = await Assignment.findById(AssignmentId);

    if (assignment.Id != Id) {
      return res.json({ status: 403, message: "You are not authorized" });
    }
    for (let key in AssignmentData) {
      if (key != "ClassroomId" && key != "_id") {
        assignment[key] = AssignmentData[key];
      }
    }
    await assignment.save();
    return res.json({ status: 200, message: "Assignment Updated." });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const { AssignmentId, Id } = req.query;
    const assignment = await Assignment.findById(AssignmentId);

    if (!assignment || assignment.Id != Id)
      return res.json({ status: 403, message: "You are not authorized" });

    await Assignment.findByIdAndDelete(AssignmentId);
    res.json({ status: 200, message: "Assignment deleted successfully" });
  } catch (error) {
    res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const { ClassroomId } = req.query;
    const classroom = await Classroom.findById(ClassroomId);
    if (!classroom) {
      return res.json({ status: 404, message: "Wrong classroom ID" });
    }
    const assignments = await Assignment.find({
      _id: { $in: classroom.Assignments },
    });
    return res.json({ status: 200, data: assignments });
  } catch (error) {
    console.error(error);
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getAssignmentScore = async (req, res) => {
  try {
    const { Id, AssignmentId } = req.query;
    const assignment = await Assignment.findById(AssignmentId);
    if (!assignment || assignment.Id != Id)
      return res.json({ status: 403, message: "You are not authorized" });

    const scores = await AssignmentAttendie.find({ Assignment: AssignmentId })
      .select("Name Email Questions")
      .lean();

    const totalQuestions = assignment.Questions.length;

    const result = scores.map(({ Name, Email, Questions }) => ({
      name: Name,
      email: Email,
      totalscore: totalQuestions
        ? Object.values(Questions).reduce((sum, score) => sum + score, 0) /
          totalQuestions
        : 0,
    }));

    res.json({ status: 200, data: result });
  } catch (error) {
    res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getNotesCalendar = async (req, res) => {
  try {
    const { Id, ClassroomId } = req.query;
    const classroom = await Classroom.findById(ClassroomId).exec();
    if (!classroom) {
      return res.json({ status: 400, message: "Invalid Classroom ID" });
    }
    let calendar = await NotesCalendar.findOne({ ClassroomId }).exec();

    if (!calendar) {
      if (classroom.Id === Id) {
        calendar = new NotesCalendar({ Id, ClassroomId, Data: new Map() });
        await calendar.save();
      } else {
        return res.json({ status: 404, message: "Calendar not found." });
      }
    }
    return res.json({ status: 200, data: calendar });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const addNotesInCalendar = async (req, res) => {
  try {
    const { Id, Date, Name, CalendarId } = req.body;
    const calendar = await NotesCalendar.findById(CalendarId);
    if (!calendar) {
      return res.json({ status: 400, message: "Invalid Calendar ID." });
    }
    if (calendar.Id.toString() !== Id) {
      return res.json({ status: 403, message: "You are not authorized." });
    }
    if (!calendar.Data) {
      calendar.Data = new Map();
    }
    if (calendar.Data.has(Date)) {
      return res.json({
        status: 400,
        message: "Notes already exist for this date.",
      });
    }
    calendar.Data.set(Date, Name);
    await calendar.save();
    return res.json({ status: 200, message: "Notes added successfully." });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const updateCalanderNote = async (req, res) => {
  try {
    const { Id, Date, Name, CalendarId } = req.body;
    if (!Id || !Date || !Name || !CalendarId) {
      return res.json({ status: 400, message: "Missing required fields." });
    }

    const calendar = await NotesCalendar.findOne({
      _id: CalendarId,
      Id: Id,
    });

    if (!calendar) {
      return res.json({ status: 404, message: "Calendar not found." });
    }

    if (!calendar.Data.has(Date)) {
      return res.json({
        status: 400,
        message: "Note not found for the given date.",
      });
    }
    calendar.Data.set(Date, Name);
    await calendar.save();

    return res.json({
      status: 200,
      message: "Notes updated successfully.",
      data: calendar,
    });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};
