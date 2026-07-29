const router = require("express").Router();
const Subject = require("../models/Subject");
const Experiment = require("../models/Experiment");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const semester = req.query.semester;
    const query = semester ? { semester } : {};
    const subjects = await Subject.find(query).sort({ semester: 1, name: 1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:code/experiments", authMiddleware, async (req, res) => {
  try {
    const experiments = await Experiment.find({ subjectCode: req.params.code }).sort({ expNo: 1 });
    res.json(experiments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;