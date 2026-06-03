export interface ProjectData {
  id: number;
  name: string;
  problemStatement?: string;
  features: string[];
  sqlConcepts: string[];
  pythonSkills?: string[];
  technologies?: string[];
  tables?: string[];
  exampleReports?: string[];
  skillsLearned?: string[];
  bonus?: string;
  realWorldRelevance?: string;
}

export const miniProjects: ProjectData[] = [
  {
    id: 1,
    name: "Student Attendance Management System",
    problemStatement: "Schools, colleges, and training institutes need a system to track student attendance, monitor participation, and generate attendance reports.",
    features: [
      "Student registration",
      "Course creation",
      "Daily attendance marking",
      "Attendance history",
      "Attendance percentage calculation",
      "Absent student reports",
      "Monthly attendance summaries"
    ],
    sqlConcepts: [
      "INSERT, UPDATE, DELETE, SELECT",
      "INNER JOIN",
      "LEFT JOIN",
      "COUNT()",
      "GROUP BY",
      "Aggregate Functions"
    ],
    tables: [
      "students",
      "courses",
      "enrollments",
      "attendance"
    ],
    exampleReports: [
      "Students with attendance below 75%",
      "Course-wise attendance report",
      "Daily attendance summary"
    ],
    skillsLearned: [
      "CRUD Operations",
      "Menu-driven programming",
      "Relational database design"
    ],
    technologies: ["Python", "SQLite", "Menu-driven App"]
  },
  {
    id: 2,
    name: "Personal Expense Tracker",
    problemStatement: "Individuals often struggle to understand where their money goes each month.",
    features: [
      "Record expenses",
      "Expense categories (Food, Transport, Utilities, Entertainment)",
      "Monthly spending summary",
      "Budget tracking",
      "Search by date range",
      "Search by category",
      "Export reports"
    ],
    sqlConcepts: [
      "SUM()",
      "AVG()",
      "GROUP BY",
      "ORDER BY",
      "Date Filtering"
    ],
    tables: [
      "users",
      "categories",
      "expenses"
    ],
    exampleReports: [
      "Total monthly expenses",
      "Top spending category",
      "Daily spending trends"
    ],
    skillsLearned: [
      "Data analysis",
      "Reporting",
      "Visualization"
    ],
    technologies: ["Python", "SQLite", "Menu-driven App"],
    bonus: "Generate charts using matplotlib or pandas"
  },
  {
    id: 3,
    name: "Library Management System",
    problemStatement: "Libraries need efficient tracking of books and borrowers.",
    features: [
      "Add books",
      "Search books",
      "Register members",
      "Issue books",
      "Return books",
      "Calculate overdue books",
      "Fine calculation"
    ],
    sqlConcepts: [
      "Foreign Keys",
      "JOIN Queries",
      "Constraints"
    ],
    tables: [
      "books",
      "authors",
      "members",
      "book_issues"
    ],
    exampleReports: [
      "Most borrowed books",
      "Books overdue by more than 30 days",
      "Active members"
    ],
    skillsLearned: [
      "Database relationships",
      "Transaction management"
    ],
    technologies: ["Python", "SQLite", "Menu-driven App"]
  },
  {
    id: 4,
    name: "Employee Payroll Management System",
    problemStatement: "Organizations need to automate salary processing.",
    features: [
      "Employee records",
      "Attendance tracking",
      "Leave management",
      "Salary calculations",
      "Payslip generation",
      "Tax deductions",
      "Bonus calculations"
    ],
    sqlConcepts: [
      "Views",
      "Aggregations",
      "Filtering",
      "Calculated Columns"
    ],
    tables: [
      "employees",
      "attendance",
      "leaves",
      "payroll"
    ],
    exampleReports: [
      "Monthly payroll report",
      "Employee attendance summary",
      "Leave balances"
    ],
    skillsLearned: [
      "Business calculations",
      "Report generation"
    ],
    technologies: ["Python", "SQLite", "Menu-driven App"],
    bonus: "Export payslips to PDF."
  },
  {
    id: 5,
    name: "Quiz Management Application",
    problemStatement: "Online learning platforms require quiz systems to assess learners.",
    features: [
      "Create questions",
      "Categorize questions",
      "Random quiz generation",
      "Time-limited quizzes",
      "Score calculation",
      "Leaderboard"
    ],
    sqlConcepts: [
      "COUNT()",
      "ORDER BY RANDOM()",
      "Ranking Queries"
    ],
    tables: [
      "users",
      "questions",
      "quizzes",
      "quiz_attempts"
    ],
    exampleReports: [
      "Top scorers",
      "Question difficulty analysis"
    ],
    skillsLearned: [
      "Randomization",
      "Game logic",
      "Ranking systems"
    ],
    technologies: ["Python", "SQLite", "Menu-driven App"],
    bonus: "Build GUI using Tkinter"
  },
  {
    id: 6,
    name: "Online Course Enrollment System",
    problemStatement: "Training institutes need to manage student enrollments and course registrations.",
    features: [
      "Student registration",
      "Course management",
      "Enrollment management",
      "Course completion tracking",
      "Certificate eligibility"
    ],
    sqlConcepts: [
      "Junction Tables",
      "Many-to-Many Relationships",
      "JOIN Queries"
    ],
    tables: [
      "students",
      "courses",
      "enrollments"
    ],
    exampleReports: [
      "Most popular courses",
      "Student enrollment history"
    ],
    skillsLearned: [
      "Advanced database relationships"
    ],
    technologies: ["Python", "SQLite", "Menu-driven App"]
  },
  {
    id: 7,
    name: "Inventory Management System",
    problemStatement: "Businesses need to monitor stock levels and sales.",
    features: [
      "Product management",
      "Inventory tracking",
      "Stock updates",
      "Low-stock alerts",
      "Supplier management",
      "Sales tracking"
    ],
    sqlConcepts: [
      "Transactions",
      "Triggers",
      "Aggregate Calculations"
    ],
    tables: [
      "products",
      "suppliers",
      "inventory_transactions",
      "sales"
    ],
    exampleReports: [
      "Current inventory",
      "Fast-moving products",
      "Low-stock report"
    ],
    skillsLearned: [
      "Inventory accounting",
      "Transaction processing"
    ],
    technologies: ["Python", "SQLite", "Menu-driven App"],
    realWorldRelevance: "Useful for: Retail shops, Warehouses, Pharmacies"
  },
  {
    id: 8,
    name: "Hospital Appointment Management System",
    problemStatement: "Hospitals need efficient scheduling and patient management.",
    features: [
      "Patient registration",
      "Doctor profiles",
      "Appointment booking",
      "Rescheduling appointments",
      "Appointment search",
      "Daily schedules"
    ],
    sqlConcepts: [
      "Constraints",
      "Date Functions",
      "Time Queries"
    ],
    tables: [
      "patients",
      "doctors",
      "appointments",
      "departments"
    ],
    exampleReports: [
      "Today's appointments",
      "Doctor workload report"
    ],
    skillsLearned: [
      "Scheduling systems",
      "Time-based queries"
    ],
    technologies: ["Python", "SQLite", "Menu-driven App"]
  },
  {
    id: 9,
    name: "Movie Recommendation & Rating System",
    problemStatement: "Streaming platforms use ratings to recommend content.",
    features: [
      "Add movies",
      "Add genres",
      "User ratings",
      "Review management",
      "Top-rated movies",
      "Genre filtering"
    ],
    sqlConcepts: [
      "AVG()",
      "GROUP BY",
      "Sorting",
      "Ranking"
    ],
    tables: [
      "movies",
      "genres",
      "users",
      "ratings"
    ],
    exampleReports: [
      "Top 10 rated movies",
      "Best movies by genre"
    ],
    skillsLearned: [
      "Recommendation logic",
      "Rating aggregation"
    ],
    technologies: ["Python", "SQLite", "Menu-driven App"],
    bonus: "Integrate with: OMDb API"
  },
  {
    id: 10,
    name: "Mini E-Commerce Backend",
    problemStatement: "An online store requires product management, customer management, and order processing.",
    features: [
      "Customer accounts",
      "Product catalog",
      "Shopping cart",
      "Order placement",
      "Order history",
      "Inventory updates"
    ],
    sqlConcepts: [
      "Complex JOINs",
      "Transactions",
      "Normalization",
      "Aggregate Queries"
    ],
    tables: [
      "users",
      "products",
      "cart",
      "orders",
      "order_items",
      "payments"
    ],
    exampleReports: [
      "Best-selling products",
      "Customer purchase history",
      "Monthly revenue"
    ],
    skillsLearned: [
      "Real-world database design",
      "E-commerce workflows",
      "Order management"
    ],
    technologies: ["Python", "SQLite", "Menu-driven App"]
  }
];
