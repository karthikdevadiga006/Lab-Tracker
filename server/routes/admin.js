const router = require("express").Router();
const Subject = require("../models/Subject");
const Experiment = require("../models/Experiment");
const LabRecord = require("../models/LabRecord");
const adminAuth = require("../middleware/adminAuth");

router.use(adminAuth);

router.get("/subjects", async (_req, res) => {
  try {
    const subjects = await Subject.find({}).sort({ semester: 1, name: 1 });
    const grouped = { 3: [], 4: [], 5: [], 6: [], 7: [], 8: [] };
    subjects.forEach((subject) => {
      if (!grouped[subject.semester]) grouped[subject.semester] = [];
      grouped[subject.semester].push(subject);
    });
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/subjects", async (req, res) => {
  try {
    const { name, code, semester } = req.body;
    const subject = await Subject.create({ name, code: code?.toUpperCase(), semester });
    res.status(201).json(subject);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Subject code already exists" });
    res.status(500).json({ message: err.message });
  }
});

router.put("/subjects/:code", async (req, res) => {
  try {
    const oldCode = req.params.code.toUpperCase();
    const { name, code, semester } = req.body;
    const newCode = code?.toUpperCase();
    const subject = await Subject.findOneAndUpdate(
      { code: oldCode },
      { name, code: newCode, semester },
      { new: true, runValidators: true }
    );
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    if (newCode && newCode !== oldCode) {
      await Experiment.updateMany({ subjectCode: oldCode }, { subjectCode: newCode });
      await LabRecord.updateMany({ subjectCode: oldCode }, { subjectCode: newCode, subject: name });
    } else {
      await LabRecord.updateMany({ subjectCode: oldCode }, { subject: name });
    }

    res.json(subject);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Subject code already exists" });
    res.status(500).json({ message: err.message });
  }
});

router.delete("/subjects/:code", async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const deleted = await Subject.findOneAndDelete({ code });
    if (!deleted) return res.status(404).json({ message: "Subject not found" });
    await Experiment.deleteMany({ subjectCode: code });
    res.json({ message: "Subject deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/experiments/:code", async (req, res) => {
  try {
    const experiments = await Experiment.find({ subjectCode: req.params.code.toUpperCase() }).sort({ expNo: 1 });
    res.json(experiments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/experiments/:code", async (req, res) => {
  try {
    const subjectCode = req.params.code.toUpperCase();
    const { expNo, title } = req.body;
    const experiment = await Experiment.create({ subjectCode, expNo, title });
    res.status(201).json(experiment);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Experiment number already exists for this subject" });
    res.status(500).json({ message: err.message });
  }
});

router.put("/experiments/:code/:id", async (req, res) => {
  try {
    const subjectCode = req.params.code.toUpperCase();
    const { expNo, title } = req.body;
    const experiment = await Experiment.findOneAndUpdate(
      { _id: req.params.id, subjectCode },
      { expNo, title },
      { new: true, runValidators: true }
    );
    if (!experiment) return res.status(404).json({ message: "Experiment not found" });
    res.json(experiment);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Experiment number already exists for this subject" });
    res.status(500).json({ message: err.message });
  }
});

router.delete("/experiments/:code/:id", async (req, res) => {
  try {
    const subjectCode = req.params.code.toUpperCase();
    const experiment = await Experiment.findOneAndDelete({ _id: req.params.id, subjectCode });
    if (!experiment) return res.status(404).json({ message: "Experiment not found" });
    res.json({ message: "Experiment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;