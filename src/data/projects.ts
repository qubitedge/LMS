export interface ProjectData {
  id: number;
  title: string;
  features: string[];
  pythonConcepts?: string[];
  sqlConcepts: string[];
  tables: string[];
  bonus?: string;
  relevance?: string;
}

export const PROJECTS: ProjectData[] = [
  {
    id: 1,
    title: "Student Attendance System",
    features: ["Add students", "Mark attendance", "View attendance percentage", "Generate absent report"],
    pythonConcepts: ["Functions", "Menu-driven program", "CRUD operations"],
    sqlConcepts: ["Tables", "INSERT, UPDATE, SELECT", "JOINs", "Aggregate functions"],
    tables: ["students", "attendance"]
  },
  {
    id: 2,
    title: "Expense Tracker",
    features: ["Add daily expenses", "Categorize spending", "Monthly expense summary", "Search expenses by date/category"],
    sqlConcepts: ["SUM()", "GROUP BY", "Date filtering"],
    tables: ["expenses", "categories"],
    bonus: "Add charts using Python libraries like matplotlib."
  },
  {
    id: 3,
    title: "Library Management System",
    features: ["Add books", "Issue/return books", "Track overdue books", "Search by author/title"],
    sqlConcepts: ["Foreign keys", "Relationships", "JOIN queries"],
    tables: ["books", "members", "transactions"]
  },
  {
    id: 4,
    title: "Employee Payroll System",
    features: ["Store employee details", "Calculate salaries", "Generate payslips", "Track attendance/leaves"],
    pythonConcepts: ["Calculations", "File export"],
    sqlConcepts: ["Views", "Filtering", "Aggregations"],
    tables: ["employees", "attendance", "payroll"]
  },
  {
    id: 5,
    title: "Quiz Application",
    features: ["Store questions in database", "Random quiz generation", "Score tracking", "Leaderboard"],
    sqlConcepts: ["ORDER BY RAND()", "COUNT()", "Ranking"],
    tables: ["questions", "scores", "users"],
    bonus: "Build a GUI using Tkinter."
  },
  {
    id: 6,
    title: "Online Course Enrollment System",
    features: ["Add students/courses", "Enroll students", "View enrolled courses", "Generate reports"],
    sqlConcepts: ["Many-to-many relationships", "JOIN tables"],
    tables: ["students", "courses", "enrollments"]
  },
  {
    id: 7,
    title: "Inventory Management System",
    features: ["Add products", "Update stock", "Low-stock alerts", "Sales tracking"],
    sqlConcepts: ["Transactions", "Triggers (optional)", "Stock calculations"],
    tables: ["products", "sales"],
    relevance: "Very useful for small business automation."
  },
  {
    id: 8,
    title: "Hospital Appointment System",
    features: ["Doctor scheduling", "Patient registration", "Appointment booking", "Search appointments"],
    sqlConcepts: ["Constraints", "Date/time queries"],
    tables: ["doctors", "patients", "appointments"]
  },
  {
    id: 9,
    title: "Movie Recommendation / Rating System",
    features: ["Add movies", "User ratings", "Top-rated movies", "Genre filtering"],
    sqlConcepts: ["AVG()", "GROUP BY", "Sorting"],
    tables: ["movies", "ratings"],
    bonus: "Use APIs later for movie posters."
  },
  {
    id: 10,
    title: "Mini E-commerce Backend",
    features: ["Product catalog", "Shopping cart", "Orders", "Customer accounts"],
    sqlConcepts: ["Complex JOINs", "Order management", "Normalization"],
    tables: ["users", "products", "cart", "orders"]
  }
];
