const mongoose = require("mongoose");

const experimentSchema = new mongoose.Schema(
  {
    subjectCode: { type: String, required: true },
    expNo: { type: Number, required: true },
    title: { type: String, required: true },
  },
  { timestamps: true }
);

experimentSchema.index({ subjectCode: 1, expNo: 1 }, { unique: true });

module.exports = mongoose.model("Experiment", experimentSchema);