const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    semester: { type: String, required: true, enum: ["3", "4", "5", "6", "7", "8"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);