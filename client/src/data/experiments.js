// Semester 6 subjects
export const SUBJECTS_SEM6 = [
  {
    name: "Full Stack Development Lab",
    code: "22IS62",
  },
  {
    name: "Software Engineering and Software Testing",
    code: "22IS63",
  },
];

// Semester 4 subjects
export const SUBJECTS_SEM4 = [
  {
    name: "Operating Systems",
    code: "22IS34",
  },
  {
    name: "Database Management System",
    code: "22IS32",
  },
];

// Combine all subjects with semester info
export const SUBJECTS = [
  ...SUBJECTS_SEM6.map(s => ({ ...s, sem: "6" })),
  ...SUBJECTS_SEM4.map(s => ({ ...s, sem: "4" })),
];

export const EXPERIMENTS = {
  "22IS62": [
    { expNo: 1,  title: "Create a simple personal portfolio webpage" },
    { expNo: 2,  title: "Design a responsive login form with validation UI" },
    { expNo: 3,  title: "Build a static landing page for a product or service" },
    { expNo: 4,  title: "Create a multi-page website with navigation bar and footer" },
    { expNo: 5,  title: "Develop a basic calculator for arithmetic operations" },
    { expNo: 6,  title: "Build a to-do list application with add and delete features" },
    { expNo: 7,  title: "Create an image slider or carousel with controls" },
    { expNo: 8,  title: "Implement a simple REST API for managing notes" },
    { expNo: 9,  title: "Build a backend server for handling user data (CRUD operations)" },
    { expNo: 10, title: "Develop a full stack task management application with user authentication" },
  ],
  "22IS63": [
    { expNo: 1,  title: "Prepare a problem statement and feasibility study for a software system" },
    { expNo: 2,  title: "Identify and document functional and non-functional requirements" },
    { expNo: 3,  title: "Develop a Software Requirement Specification (SRS) document" },
    { expNo: 4,  title: "Draw UML diagrams (use case, class, sequence) for the system" },
    { expNo: 5,  title: "Perform black box testing techniques (equivalence partitioning, boundary value analysis)" },
    { expNo: 6,  title: "Perform white box testing techniques (control flow testing)" },
    { expNo: 7,  title: "Write and execute unit test cases for program modules" },
    { expNo: 8,  title: "Perform integration testing on combined modules" },
    { expNo: 9,  title: "Conduct system and regression testing for an application" },
    { expNo: 10, title: "Develop a mini project and apply complete testing lifecycle on it" },
  ],
  // Placeholder for sem 4 subjects - will be filled with experiments
  "22IS34": [
    { expNo: 1,  title: "Study of Linux Operating System commands and basic shell scripting" },
    { expNo: 2,  title: "Implementation of CPU Scheduling algorithms (FCFS, SJF, Round Robin)" },
    { expNo: 3,  title: "Simulation of Process Creation using fork() system call in Unix" },
    { expNo: 4,  title: "Implementation of Inter-Process Communication using pipes" },
    { expNo: 5,  title: "Implementation of Producer-Consumer problem using semaphores" },
    { expNo: 6,  title: "Simulation of Deadlock Avoidance using Banker's Algorithm" },
    { expNo: 7,  title: "Implementation of Memory Management using Paging technique" },
    { expNo: 8,  title: "Simulation of Page Replacement algorithms (FIFO, LRU, Optimal)" },
    { expNo: 9,  title: "Implementation of File Allocation methods (Sequential, Indexed, Linked)" },
    { expNo: 10, title: "Study and implementation of Disk Scheduling algorithms (SCAN, C-SCAN, SSTF)" },
  ],
  "22IS32": [
    { expNo: 1,  title: "Study of MySQL and execution of basic SQL commands (DDL, DML, DCL)" },
    { expNo: 2,  title: "Creation of database schema and tables using constraints (PRIMARY KEY, FOREIGN KEY, NOT NULL)" },
    { expNo: 3,  title: "Implementation of SQL queries using SELECT, WHERE, ORDER BY, GROUP BY clauses" },
    { expNo: 4,  title: "Use of aggregate functions (COUNT, SUM, AVG, MAX, MIN) in SQL queries" },
    { expNo: 5,  title: "Implementation of joins (INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN)" },
    { expNo: 6,  title: "Writing subqueries and nested queries in SQL" },
    { expNo: 7,  title: "Implementation of views and indexes in a database" },
    { expNo: 8,  title: "Study and implementation of normalization (1NF, 2NF, 3NF)" },
    { expNo: 9,  title: "Implementation of stored procedures and triggers in Oracle Database or MySQL" },
    { expNo: 10, title: "Design and implementation of a mini database project using DBMS concepts" },
  ],
};

export const SECTIONS = ["A", "B", "C"];
export const BATCHES = {
  A: ["A1", "A2", "A3"],
  B: ["B1", "B2", "B3"],
  C: ["C1", "C2", "C3"],
};
