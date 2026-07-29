const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Subject = require("./models/Subject");
const Experiment = require("./models/Experiment");

const seedData = {
  subjects: [
    // Semester 6
    { name: "Full Stack Development Lab", code: "22IS62", semester: "6" },
    { name: "Software Engineering and Software Testing", code: "22IS63", semester: "6" },
    // Semester 4
    { name: "Operating Systems", code: "22IS34", semester: "4" },
    { name: "Database Management System", code: "22IS32", semester: "4" },
  ],
  experiments: {
    "22IS62": [
      { expNo: 1, title: "Create a simple personal portfolio webpage" },
      { expNo: 2, title: "Design a responsive login form with validation UI" },
      { expNo: 3, title: "Build a static landing page for a product or service" },
      { expNo: 4, title: "Create a multi-page website with navigation bar and footer" },
      { expNo: 5, title: "Develop a basic calculator for arithmetic operations" },
      { expNo: 6, title: "Build a to-do list application with add and delete features" },
      { expNo: 7, title: "Create an image slider or carousel with controls" },
      { expNo: 8, title: "Implement a simple REST API for managing notes" },
      { expNo: 9, title: "Build a backend server for handling user data (CRUD operations)" },
      { expNo: 10, title: "Develop a full stack task management application with user authentication" },
    ],
    "22IS63": [
      { expNo: 1, title: "Prepare a problem statement and feasibility study for a software system" },
      { expNo: 2, title: "Identify and document functional and non-functional requirements" },
      { expNo: 3, title: "Develop a Software Requirement Specification (SRS) document" },
      { expNo: 4, title: "Draw UML diagrams (use case, class, sequence) for the system" },
      { expNo: 5, title: "Perform black box testing techniques (equivalence partitioning, boundary value analysis)" },
      { expNo: 6, title: "Perform white box testing techniques (control flow testing)" },
      { expNo: 7, title: "Write and execute unit test cases for program modules" },
      { expNo: 8, title: "Perform integration testing on combined modules" },
      { expNo: 9, title: "Conduct system and regression testing for an application" },
      { expNo: 10, title: "Develop a mini project and apply complete testing lifecycle on it" },
    ],
    "22IS34": [
      { expNo: 1, title: "Study of Linux Operating System commands and basic shell scripting" },
      { expNo: 2, title: "Implementation of CPU Scheduling algorithms (FCFS, SJF, Round Robin)" },
      { expNo: 3, title: "Simulation of Process Creation using fork() system call in Unix" },
      { expNo: 4, title: "Implementation of Inter-Process Communication using pipes" },
      { expNo: 5, title: "Implementation of Producer-Consumer problem using semaphores" },
      { expNo: 6, title: "Simulation of Deadlock Avoidance using Banker's Algorithm" },
      { expNo: 7, title: "Implementation of Memory Management using Paging technique" },
      { expNo: 8, title: "Simulation of Page Replacement algorithms (FIFO, LRU, Optimal)" },
      { expNo: 9, title: "Implementation of File Allocation methods (Sequential, Indexed, Linked)" },
      { expNo: 10, title: "Study and implementation of Disk Scheduling algorithms (SCAN, C-SCAN, SSTF)" },
    ],
    "22IS32": [
      { expNo: 1, title: "Study of MySQL and execution of basic SQL commands (DDL, DML, DCL)" },
      { expNo: 2, title: "Creation of database schema and tables using constraints (PRIMARY KEY, FOREIGN KEY, NOT NULL)" },
      { expNo: 3, title: "Implementation of SQL queries using SELECT, WHERE, ORDER BY, GROUP BY clauses" },
      { expNo: 4, title: "Use of aggregate functions (COUNT, SUM, AVG, MAX, MIN) in SQL queries" },
      { expNo: 5, title: "Implementation of joins (INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN)" },
      { expNo: 6, title: "Writing subqueries and nested queries in SQL" },
      { expNo: 7, title: "Implementation of views and indexes in a database" },
      { expNo: 8, title: "Study and implementation of normalization (1NF, 2NF, 3NF)" },
      { expNo: 9, title: "Implementation of stored procedures and triggers in Oracle Database or MySQL" },
      { expNo: 10, title: "Design and implementation of a mini database project using DBMS concepts" },
    ],
  },
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/labtracker");
    console.log("✓ Connected to MongoDB");

    // Clear existing data
    await Subject.deleteMany({});
    await Experiment.deleteMany({});
    console.log("✓ Cleared existing subjects and experiments");

    // Seed subjects
    const createdSubjects = await Subject.insertMany(seedData.subjects);
    console.log(`✓ Created ${createdSubjects.length} subjects`);

    // Seed experiments
    let totalExperiments = 0;
    for (const [code, experiments] of Object.entries(seedData.experiments)) {
      const expsWithCode = experiments.map((exp) => ({ ...exp, subjectCode: code }));
      await Experiment.insertMany(expsWithCode);
      totalExperiments += experiments.length;
      console.log(`  ✓ Added ${experiments.length} experiments for ${code}`);
    }
    console.log(`✓ Created ${totalExperiments} experiments total`);

    console.log("\n✅ Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

seed();
