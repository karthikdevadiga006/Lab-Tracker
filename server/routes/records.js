const router = require("express").Router();
const LabRecord = require("../models/LabRecord");
const Experiment = require("../models/Experiment");
const authMiddleware = require("../middleware/auth");

// Get or create a lab record
router.post("/load", authMiddleware, async (req, res) => {
  try {
    const { sem, section, batch, subject, subjectCode } = req.body;

    let record = await LabRecord.findOne({ sem, section, batch, subjectCode });

    if (!record) {
      const experiments = await Experiment.find({ subjectCode }).sort({ expNo: 1 });
      if (!experiments.length) {
        return res.status(404).json({ message: "No experiments found for this subject. Contact admin." });
      }

      record = await LabRecord.create({
        sem, section, batch, subject, subjectCode,
        experiments: experiments.map((e) => ({
          expNo: e.expNo,
          title: e.title,
          date: "",
          time: "",
          remark: "",
          completed: false,
        })),
      });
    }

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save updated experiments
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { experiments } = req.body;
    const record = await LabRecord.findByIdAndUpdate(
      req.params.id,
      { experiments },
      { new: true }
    );
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all records (dashboard overview)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const records = await LabRecord.find({}, "sem section batch subject subjectCode experiments updatedAt");
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
