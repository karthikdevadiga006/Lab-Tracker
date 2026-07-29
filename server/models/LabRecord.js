const mongoose = require("mongoose");

const experimentSchema = new mongoose.Schema({
  expNo:     { type: Number, required: true },
  title:     { type: String, required: true },
  date:      { type: String, default: "" },
  time:      { type: String, default: "" },
  remark:    { type: String, default: "" },
  completed: { type: Boolean, default: false },
});

const labRecordSchema = new mongoose.Schema(
  {
    sem:         { type: String, required: true },
    section:     { type: String, required: true },
    batch:       { type: String, required: true },
    subject:     { type: String, required: true },
    subjectCode: { type: String, required: true },
    experiments: [experimentSchema],
  },
  { timestamps: true }
);

// Unique record per sem+section+batch+subjectCode
labRecordSchema.index(
  { sem: 1, section: 1, batch: 1, subjectCode: 1 },
  { unique: true }
);

module.exports = mongoose.model("LabRecord", labRecordSchema);
