import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Button, Row, Col, Alert, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';

const ProfessorDashboard = ({ user }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStatus, setAttendanceStatus] = useState('present');
  const [feedback, setFeedback] = useState('');
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fitness_test_score: '',
    participation: '',
    discipline: ''
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('/api/students');
        setStudents(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load students data');
        setLoading(false);
        console.error('Error fetching students:', err);
      }
    };

    fetchStudents();
  }, []);

  const handleStudentSelect = (e) => {
    const studentId = e.target.value;
    if (studentId) {
      const student = students.find(s => s.id === studentId);
      setSelectedStudent(student);
      
      // Pre-fill feedback if it exists
      if (student.current_term && student.current_term.feedback) {
        setFeedback(student.current_term.feedback);
      } else {
        setFeedback('');
      }
      
      // Pre-fill performance metrics if they exist
      if (student.current_term && student.current_term.performance_metrics) {
        setPerformanceMetrics({
          fitness_test_score: student.current_term.performance_metrics.fitness_test_score || '',
          participation: student.current_term.performance_metrics.participation || '',
          discipline: student.current_term.performance_metrics.discipline || ''
        });
      } else {
        setPerformanceMetrics({
          fitness_test_score: '',
          participation: '',
          discipline: ''
        });
      }
    } else {
      setSelectedStudent(null);
      setFeedback('');
      setPerformanceMetrics({
        fitness_test_score: '',
        participation: '',
        discipline: ''
      });
    }
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await axios.post(`/api/attendance/${selectedStudent.id}`, {
        date: attendanceDate,
        status: attendanceStatus,
        professorId: user.id
      });

      // Refresh student data
      const response = await axios.get('/api/students');
      setStudents(response.data);
      
      // Update selected student
      const updatedStudent = response.data.find(s => s.id === selectedStudent.id);
      setSelectedStudent(updatedStudent);
      
      setSuccess('Attendance updated successfully');
    } catch (err) {
      setError('Failed to update attendance');
      console.error('Error updating attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePerformanceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await axios.post(`/api/performance/${selectedStudent.id}`, {
        metrics: performanceMetrics,
        professorId: user.id
      });

      // Refresh student data
      const response = await axios.get('/api/students');
      setStudents(response.data);
      
      // Update selected student
      const updatedStudent = response.data.find(s => s.id === selectedStudent.id);
      setSelectedStudent(updatedStudent);
      
      setSuccess('Performance metrics updated successfully');
    } catch (err) {
      setError('Failed to update performance metrics');
      console.error('Error updating performance metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await axios.post(`/api/feedback/${selectedStudent.id}`, {
        feedback,
        professorId: user.id
      });

      // Refresh student data
      const response = await axios.get('/api/students');
      setStudents(response.data);
      
      // Update selected student
      const updatedStudent = response.data.find(s => s.id === selectedStudent.id);
      setSelectedStudent(updatedStudent);
      
      setSuccess('Feedback updated successfully');
    } catch (err) {
      setError('Failed to update feedback');
      console.error('Error updating feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePerformanceChange = (e) => {
    const { name, value } = e.target;
    setPerformanceMetrics(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading && !selectedStudent) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <h2 className="mb-4 text-center">Professor Dashboard</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Card className="mb-4">
        <Card.Header as="h5">Student Management</Card.Header>
        <Card.Body>
          <Form.Group className="mb-4">
            <Form.Label>Select Student</Form.Label>
            <Form.Select 
              onChange={handleStudentSelect}
              value={selectedStudent ? selectedStudent.id : ''}
            >
              <option value="">Choose a student...</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.roll_number})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          
          {selectedStudent && (
            <Tabs defaultActiveKey="attendance" className="mb-3">
              <Tab eventKey="attendance" title="Attendance">
                <Card>
                  <Card.Body>
                    <h5>Mark Attendance for {selectedStudent.name}</h5>
                    <Form onSubmit={handleAttendanceSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Date</Form.Label>
                            <Form.Control 
                              type="date" 
                              value={attendanceDate}
                              onChange={(e) => setAttendanceDate(e.target.value)}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                              value={attendanceStatus}
                              onChange={(e) => setAttendanceStatus(e.target.value)}
                              required
                            >
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Attendance'}
                      </Button>
                    </Form>
                    
                    <h5 className="mt-4">Attendance History</h5>
                    <Table striped bordered hover responsive className="attendance-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStudent.attendance && selectedStudent.attendance.length > 0 ? (
                          selectedStudent.attendance.map((record, index) => (
                            <tr key={index}>
                              <td>{new Date(record.date).toLocaleDateString()}</td>
                              <td className={record.status === 'present' ? 'status-present' : 'status-absent'}>
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="text-center">No attendance records found</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Tab>
              
              <Tab eventKey="performance" title="Performance Metrics">
                <Card>
                  <Card.Body>
                    <h5>Update Performance Metrics for {selectedStudent.name}</h5>
                    <Form onSubmit={handlePerformanceSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Fitness Test Score (0-100)</Form.Label>
                        <Form.Control 
                          type="number" 
                          name="fitness_test_score"
                          min="0"
                          max="100"
                          value={performanceMetrics.fitness_test_score}
                          onChange={handlePerformanceChange}
                          required
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Participation</Form.Label>
                        <Form.Select
                          name="participation"
                          value={performanceMetrics.participation}
                          onChange={handlePerformanceChange}
                          required
                        >
                          <option value="">Select rating...</option>
                          <option value="Excellent">Excellent</option>
                          <option value="Good">Good</option>
                          <option value="Average">Average</option>
                          <option value="Poor">Poor</option>
                        </Form.Select>
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Discipline</Form.Label>
                        <Form.Select
                          name="discipline"
                          value={performanceMetrics.discipline}
                          onChange={handlePerformanceChange}
                          required
                        >
                          <option value="">Select rating...</option>
                          <option value="Excellent">Excellent</option>
                          <option value="Good">Good</option>
                          <option value="Average">Average</option>
                          <option value="Poor">Poor</option>
                        </Form.Select>
                      </Form.Group>
                      
                      <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Performance Metrics'}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab>
              
              <Tab eventKey="feedback" title="Feedback">
                <Card>
                  <Card.Body>
                    <h5>Provide Feedback for {selectedStudent.name}</h5>
                    <Form onSubmit={handleFeedbackSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Feedback</Form.Label>
                        <Form.Control 
                          as="textarea" 
                          rows={4}
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          required
                        />
                      </Form.Group>
                      
                      <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Feedback'}
                      </Button>
                    </Form>
                    
                    <div className="mt-4">
                      <h5>Current Feedback</h5>
                      <div className="feedback-container">
                        <p>{selectedStudent.current_term && selectedStudent.current_term.feedback ? 
                          selectedStudent.current_term.feedback : 'No feedback provided yet.'}</p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Tab>
            </Tabs>
          )}
        </Card.Body>
      </Card>
      
      <Card>
        <Card.Header as="h5">Class Overview</Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Attendance Rate</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const attendanceRate = student.current_term && student.current_term.total_classes > 0 ?
                  Math.round((student.current_term.attended_classes / student.current_term.total_classes) * 100) : 0;
                
                return (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.roll_number}</td>
                    <td>
                      <div className="progress">
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ width: `${attendanceRate}%` }}
                          aria-valuenow={attendanceRate}
                          aria-valuemin="0" 
                          aria-valuemax="100"
                        >
                          {attendanceRate}%
                        </div>
                      </div>
                    </td>
                    <td>
                      {student.current_term && student.current_term.performance_metrics && 
                       student.current_term.performance_metrics.fitness_test_score ? 
                        `Score: ${student.current_term.performance_metrics.fitness_test_score}, 
                         Participation: ${student.current_term.performance_metrics.participation || 'N/A'}, 
                         Discipline: ${student.current_term.performance_metrics.discipline || 'N/A'}` : 
                        'No performance data'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProfessorDashboard;