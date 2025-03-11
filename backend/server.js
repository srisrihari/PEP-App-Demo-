const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Initialize data files if they don't exist
const studentsFilePath = path.join(dataDir, 'students.json');
const professorsFilePath = path.join(dataDir, 'professors.json');

if (!fs.existsSync(studentsFilePath)) {
  fs.writeFileSync(studentsFilePath, JSON.stringify([], null, 2));
}

if (!fs.existsSync(professorsFilePath)) {
  fs.writeFileSync(professorsFilePath, JSON.stringify([], null, 2));
}

// Helper function to read data from JSON file
const readDataFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
};

// Helper function to write data to JSON file
const writeDataFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing to file ${filePath}:`, error);
    return false;
  }
};

// Routes

// Get all students
app.get('/api/students', (req, res) => {
  const students = readDataFile(studentsFilePath);
  res.json(students);
});

// Get student by ID
app.get('/api/students/:id', (req, res) => {
  const students = readDataFile(studentsFilePath);
  const student = students.find(s => s.id === req.params.id);
  
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }
  
  res.json(student);
});

// Add a new student
app.post('/api/students', (req, res) => {
  const students = readDataFile(studentsFilePath);
  const newStudent = {
    id: Date.now().toString(),
    ...req.body
  };
  
  students.push(newStudent);
  
  if (writeDataFile(studentsFilePath, students)) {
    res.status(201).json(newStudent);
  } else {
    res.status(500).json({ message: 'Failed to add student' });
  }
});

// Update student data (attendance, performance, feedback)
app.put('/api/students/:id', (req, res) => {
  const students = readDataFile(studentsFilePath);
  const index = students.findIndex(s => s.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }
  
  students[index] = {
    ...students[index],
    ...req.body
  };
  
  if (writeDataFile(studentsFilePath, students)) {
    res.json(students[index]);
  } else {
    res.status(500).json({ message: 'Failed to update student data' });
  }
});

// Get all professors
app.get('/api/professors', (req, res) => {
  const professors = readDataFile(professorsFilePath);
  res.json(professors);
});

// Get professor by ID
app.get('/api/professors/:id', (req, res) => {
  const professors = readDataFile(professorsFilePath);
  const professor = professors.find(p => p.id === req.params.id);
  
  if (!professor) {
    return res.status(404).json({ message: 'Professor not found' });
  }
  
  res.json(professor);
});

// Add a new professor
app.post('/api/professors', (req, res) => {
  const professors = readDataFile(professorsFilePath);
  const newProfessor = {
    id: Date.now().toString(),
    ...req.body
  };
  
  professors.push(newProfessor);
  
  if (writeDataFile(professorsFilePath, professors)) {
    res.status(201).json(newProfessor);
  } else {
    res.status(500).json({ message: 'Failed to add professor' });
  }
});

// Update attendance for a student
app.post('/api/attendance/:studentId', (req, res) => {
  const { studentId } = req.params;
  const { date, status, professorId } = req.body;
  
  if (!date || !status || !professorId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  const students = readDataFile(studentsFilePath);
  const studentIndex = students.findIndex(s => s.id === studentId);
  
  if (studentIndex === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }
  
  // Initialize current_term if it doesn't exist
  if (!students[studentIndex].current_term) {
    students[studentIndex].current_term = {
      total_classes: 0,
      attended_classes: 0,
      remaining_classes: 0,
      performance_metrics: {},
      feedback: ''
    };
  }
  
  // Update attendance
  if (!students[studentIndex].attendance) {
    students[studentIndex].attendance = [];
  }
  
  // Check if attendance for this date already exists
  const attendanceIndex = students[studentIndex].attendance.findIndex(a => a.date === date);
  
  if (attendanceIndex !== -1) {
    // Update existing attendance
    students[studentIndex].attendance[attendanceIndex] = {
      date,
      status,
      professorId
    };
  } else {
    // Add new attendance record
    students[studentIndex].attendance.push({
      date,
      status,
      professorId
    });
  }
  
  // Update current term attendance counts
  const attendedCount = students[studentIndex].attendance.filter(a => a.status === 'present').length;
  students[studentIndex].current_term.total_classes = students[studentIndex].attendance.length;
  students[studentIndex].current_term.attended_classes = attendedCount;
  students[studentIndex].current_term.remaining_classes = students[studentIndex].current_term.total_classes - attendedCount;
  
  if (writeDataFile(studentsFilePath, students)) {
    res.json(students[studentIndex]);
  } else {
    res.status(500).json({ message: 'Failed to update attendance' });
  }
});

// Update performance metrics for a student
app.post('/api/performance/:studentId', (req, res) => {
  const { studentId } = req.params;
  const { metrics, professorId } = req.body;
  
  if (!metrics || !professorId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  const students = readDataFile(studentsFilePath);
  const studentIndex = students.findIndex(s => s.id === studentId);
  
  if (studentIndex === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }
  
  // Initialize current_term if it doesn't exist
  if (!students[studentIndex].current_term) {
    students[studentIndex].current_term = {
      total_classes: 0,
      attended_classes: 0,
      remaining_classes: 0,
      performance_metrics: {},
      feedback: ''
    };
  }
  
  // Update performance metrics
  students[studentIndex].current_term.performance_metrics = {
    ...students[studentIndex].current_term.performance_metrics,
    ...metrics
  };
  
  if (writeDataFile(studentsFilePath, students)) {
    res.json(students[studentIndex]);
  } else {
    res.status(500).json({ message: 'Failed to update performance metrics' });
  }
});

// Add feedback for a student
app.post('/api/feedback/:studentId', (req, res) => {
  const { studentId } = req.params;
  const { feedback, professorId } = req.body;
  
  if (!feedback || !professorId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  const students = readDataFile(studentsFilePath);
  const studentIndex = students.findIndex(s => s.id === studentId);
  
  if (studentIndex === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }
  
  // Initialize current_term if it doesn't exist
  if (!students[studentIndex].current_term) {
    students[studentIndex].current_term = {
      total_classes: 0,
      attended_classes: 0,
      remaining_classes: 0,
      performance_metrics: {},
      feedback: ''
    };
  }
  
  // Update feedback
  students[studentIndex].current_term.feedback = feedback;
  
  if (writeDataFile(studentsFilePath, students)) {
    res.json(students[studentIndex]);
  } else {
    res.status(500).json({ message: 'Failed to update feedback' });
  }
});

// Complete a term and move current term data to previous terms
app.post('/api/complete-term/:studentId', (req, res) => {
  const { studentId } = req.params;
  const { termName, grade } = req.body;
  
  if (!termName || !grade) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  const students = readDataFile(studentsFilePath);
  const studentIndex = students.findIndex(s => s.id === studentId);
  
  if (studentIndex === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }
  
  // Check if current term exists
  if (!students[studentIndex].current_term) {
    return res.status(400).json({ message: 'No current term data found' });
  }
  
  // Initialize previous_terms if it doesn't exist
  if (!students[studentIndex].previous_terms) {
    students[studentIndex].previous_terms = [];
  }
  
  // Move current term to previous terms
  students[studentIndex].previous_terms.push({
    term: termName,
    grade,
    performance_metrics: students[studentIndex].current_term.performance_metrics,
    feedback: students[studentIndex].current_term.feedback
  });
  
  // Reset current term
  students[studentIndex].current_term = {
    total_classes: 0,
    attended_classes: 0,
    remaining_classes: 0,
    performance_metrics: {},
    feedback: ''
  };
  
  // Clear attendance records
  students[studentIndex].attendance = [];
  
  if (writeDataFile(studentsFilePath, students)) {
    res.json(students[studentIndex]);
  } else {
    res.status(500).json({ message: 'Failed to complete term' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});