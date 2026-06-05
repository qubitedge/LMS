'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Code, BookOpen, Database, FolderGit2 } from 'lucide-react';


export default function ProjectGuideModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left h-auto py-3 bg-white hover:bg-slate-50 text-[#40C4D0] border-[#40C4D0]/20 hover:border-[#40C4D0]/40 mt-2">
          <Code size={16} className="mr-2 shrink-0" />
          <span className="font-semibold text-sm">View Python Project Code Guide</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl w-[95vw] md:w-[90vw] rounded-3xl h-[85vh] p-0 flex flex-col gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl flex items-center gap-2" style={{ fontFamily: 'Playfair Display', color: '#2C2C2C' }}>
            <Database size={24} /> Python Mini Project — Complete Guide
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-10 pb-10 text-[#4a4a4a]">
            
            <section>
              <h3 className="text-lg font-bold text-[#4A5DB5] mb-3">📁 Step 1: Set Up Your Project Folder</h3>
              <p className="mb-2">Create this structure on your computer (rename folders to match your project):</p>
              <pre className="text-sm bg-gray-50 p-4 rounded-xl border font-mono mb-4 text-gray-700">
{`your-project-name/
│
├── main.py
├── database.py
├── requirements.txt
├── schema.sql
├── data/
└── screenshots/`}
              </pre>
              <p className="text-sm"><strong>Example names:</strong> <code>student-id-system</code> / <code>expense-tracker</code> / <code>library-manager</code> / <code>contact-book</code></p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-[#4A5DB5] mb-3">💻 Step 2: Write Your Code</h3>
              <p className="mb-4">Your project must have these 4 files minimum:</p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold flex items-center gap-2 mb-2 text-[#2C2C2C]"><Database size={16} className="text-[#40C4D0]" /> schema.sql — Define your database table</h4>
                  <pre className="text-sm bg-gray-900 text-green-400 p-4 rounded-xl font-mono overflow-x-auto">
{`CREATE TABLE IF NOT EXISTS your_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    field1 TEXT NOT NULL,
    field2 TEXT NOT NULL,
    field3 INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
                  </pre>
                  <p className="text-sm mt-2 text-gray-600">Replace <code>your_table</code>, <code>field1</code>, <code>field2</code> etc. with columns relevant to your project. Example for a contact book: <code>name</code>, <code>phone</code>, <code>email</code>, <code>address</code></p>
                </div>

                <div>
                  <h4 className="font-bold flex items-center gap-2 mb-2 text-[#2C2C2C]"><Code size={16} className="text-[#40C4D0]" /> database.py — All database functions</h4>
                  <pre className="text-sm bg-gray-900 text-blue-300 p-4 rounded-xl font-mono overflow-x-auto h-80 overflow-y-auto custom-scrollbar">
{`import sqlite3
import os

DB_PATH = "data/project.db"

# ─── Connect to Database ───────────────────────────────────────
def get_connection():
    os.makedirs("data", exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ─── Create Tables ─────────────────────────────────────────────
def initialize_db():
    conn = get_connection()
    cursor = conn.cursor()
    with open("schema.sql", "r") as f:
        cursor.executescript(f.read())
    conn.commit()
    conn.close()

# ─── ADD a record ──────────────────────────────────────────────
def add_record(field1, field2, field3):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO your_table (field1, field2, field3)
            VALUES (?, ?, ?)
        """, (field1, field2, field3))
        conn.commit()
        print("\\n✅ Record added successfully!")
    except sqlite3.IntegrityError as e:
        print(f"\\n❌ Error: {e}")
    finally:
        conn.close()

# ─── VIEW all records ──────────────────────────────────────────
def view_all():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM your_table")
    records = cursor.fetchall()
    conn.close()
    return records

# ─── SEARCH records ────────────────────────────────────────────
def search_record(keyword):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM your_table
        WHERE field1 LIKE ? OR field2 LIKE ?
    """, (f"%{keyword}%", f"%{keyword}%"))
    results = cursor.fetchall()
    conn.close()
    return results

# ─── UPDATE a record ───────────────────────────────────────────
def update_record(record_id, field1, field2, field3):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE your_table
        SET field1=?, field2=?, field3=?
        WHERE id=?
    """, (field1, field2, field3, record_id))
    conn.commit()
    updated = cursor.rowcount
    conn.close()
    if updated:
        print(f"\\n✅ Record {record_id} updated successfully!")
    else:
        print(f"\\n❌ Record ID {record_id} not found.")

# ─── DELETE a record ───────────────────────────────────────────
def delete_record(record_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM your_table WHERE id=?", (record_id,))
    conn.commit()
    deleted = cursor.rowcount
    conn.close()
    if deleted:
        print(f"\\n✅ Record {record_id} deleted successfully!")
    else:
        print(f"\\n❌ Record ID {record_id} not found.")`}
                  </pre>
                  <p className="text-sm mt-2 text-gray-600 bg-blue-50 p-3 rounded-lg">🔁 Replace <code>your_table</code>, <code>field1</code>, <code>field2</code>, <code>field3</code> with your actual column names everywhere.</p>
                </div>

                <div>
                  <h4 className="font-bold flex items-center gap-2 mb-2 text-[#2C2C2C]"><Code size={16} className="text-[#40C4D0]" /> main.py — Menu and user interaction</h4>
                  <pre className="text-sm bg-gray-900 text-yellow-300 p-4 rounded-xl font-mono overflow-x-auto h-80 overflow-y-auto custom-scrollbar">
{`from database import (
    initialize_db, add_record, view_all,
    search_record, update_record, delete_record
)

# ─── Display a single record ───────────────────────────────────
def print_record(r):
    print("-" * 45)
    print(f"  ID      : {r['id']}")
    print(f"  Field 1 : {r['field1']}")
    print(f"  Field 2 : {r['field2']}")
    print(f"  Field 3 : {r['field3']}")
    print("-" * 45)

# ─── Main Menu ─────────────────────────────────────────────────
def menu():
    print("\\n========================================")
    print("        🗂️  My Mini Project")
    print("========================================")
    print("  1. Add Record")
    print("  2. View All Records")
    print("  3. Search Record")
    print("  4. Update Record")
    print("  5. Delete Record")
    print("  6. Exit")
    print("========================================")

# ─── Main Program ──────────────────────────────────────────────
def main():
    initialize_db()

    while True:
        menu()
        choice = input("Enter your choice (1-6): ").strip()

        if choice == "1":
            print("\\n--- Add New Record ---")
            f1 = input("Enter Field 1: ").strip()
            f2 = input("Enter Field 2: ").strip()
            f3 = input("Enter Field 3: ").strip()
            add_record(f1, f2, f3)

        elif choice == "2":
            print("\\n--- All Records ---")
            records = view_all()
            if records:
                for r in records:
                    print_record(r)
            else:
                print("No records found.")

        elif choice == "3":
            keyword = input("\\nEnter keyword to search: ").strip()
            results = search_record(keyword)
            if results:
                for r in results:
                    print_record(r)
            else:
                print("No matching records found.")

        elif choice == "4":
            rid = input("\\nEnter Record ID to update: ").strip()
            f1 = input("New Field 1: ").strip()
            f2 = input("New Field 2: ").strip()
            f3 = input("New Field 3: ").strip()
            update_record(int(rid), f1, f2, f3)

        elif choice == "5":
            rid = input("\\nEnter Record ID to delete: ").strip()
            confirm = input(f"Delete record {rid}? (yes/no): ").strip().lower()
            if confirm == "yes":
                delete_record(int(rid))
            else:
                print("Deletion cancelled.")

        elif choice == "6":
            print("\\nGoodbye! 👋")
            break

        else:
            print("\\n❌ Invalid choice. Please enter 1-6.")

if __name__ == "__main__":
    main()`}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-bold flex items-center gap-2 mb-2 text-[#2C2C2C]"><FolderGit2 size={16} className="text-[#40C4D0]" /> requirements.txt</h4>
                  <pre className="text-sm bg-gray-900 text-gray-300 p-4 rounded-xl font-mono overflow-x-auto">
{`# No external packages needed
# sqlite3 is built into Python 3`}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-bold flex items-center gap-2 mb-2 text-[#2C2C2C]"><BookOpen size={16} className="text-[#40C4D0]" /> README.md</h4>
                  <pre className="text-sm bg-gray-900 text-gray-100 p-4 rounded-xl font-mono overflow-x-auto h-80 overflow-y-auto custom-scrollbar">
{`# 🗂️ [Your Project Name Here]

## Problem Statement
Write 2-3 lines about the real-world problem your project solves.
Example: Many small businesses track expenses manually using notebooks,
which is inefficient and error-prone. This system automates the process.

## Features
- Add new records
- View all records
- Search by keyword
- Update existing records
- Delete records

## Technologies Used
- Python 3
- SQLite (built-in)
- SQL
- Git & GitHub

## Project Structure
\`\`\`
your-project/
│
├── main.py          → Main menu and user interaction
├── database.py      → All database operations (CRUD)
├── schema.sql       → Database table definitions
├── requirements.txt → Project dependencies
├── data/            → SQLite database file (auto-created)
└── screenshots/     → Screenshots of running application
\`\`\`

## Database Schema
### Table: your_table
| Column     | Type      | Description         |
|------------|-----------|---------------------|
| id         | INTEGER   | Auto-increment key  |
| field1     | TEXT      | Description here    |
| field2     | TEXT      | Description here    |
| field3     | INTEGER   | Description here    |
| created_at | TIMESTAMP | Record created time |

## How to Run
\`\`\`bash
# Step 1: Clone the repository
git clone https://github.com/yourusername/your-project-name.git

# Step 2: Go into the folder
cd your-project-name

# Step 3: Run the project
python main.py
\`\`\`

## Screenshots
_(Paste screenshots of your running application here)_

## Author
Your Name — [GitHub](https://github.com/yourusername)`}
                  </pre>
                </div>
              </div>
            </section>
            
            <section>
              <h3 className="text-lg font-bold text-[#4A5DB5] mb-3">🧪 Step 3: Test Your Project</h3>
              <pre className="text-sm bg-gray-900 text-pink-300 p-4 rounded-xl font-mono overflow-x-auto mb-3">
{`cd your-project-name
python main.py`}
              </pre>
              <p className="text-sm text-[#4a4a4a] bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                Test every menu option — Add, View, Search, Update, Delete. 
                <strong> Take screenshots of each working feature and save them in the <code>screenshots/</code> folder.</strong>
              </p>
            </section>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
