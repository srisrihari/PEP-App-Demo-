import React, { useState, useEffect } from 'react';
import { Card, Table, Row, Col, Badge } from 'react-bootstrap';
import axios from 'axios';

const StudentDashboard = ({ user }) => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await axios.get(`/api/students/${user.id}`);
        setStudentData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load student data');
        setLoading(false);
        console.error('Error fetching student data:', err);
      }
    };

    fetchStudentData();
  }, [user.id]);

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger mt-5">{error}</div>;
  }

  if (!studentData) {
    return <div className="alert alert-warning mt-5">No student data found</div>;
  }

  const { current_term, previous_terms, attendance } = studentData;

  return (
    <div className="dashboard-container">
      <h2 className="mb-4 text-center">Student Dashboard</h2>
      
      {/* Current Term Overview */}
      <Card className="mb-4">
        <Card.Header as="h5">Current Term Overview</Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <div className="metric-item">
                <h6>Total Classes</h6>
                <h3>{current_term.total_classes}</h3>
              </div>
            </Col>
            <Col md={4}>
              <div className="metric-item">
                <h6>Classes Attended</h6>
                <h3>{current_term.attended_classes}</h3>
              </div>
            </Col>
            <Col md={4}>
              <div className="metric-item">
                <h6>Remaining Classes</h6>
                <h3>{current_term.remaining_classes}</h3>
              </div>
            </Col>
          </Row>
          
          <div className="mt-4">
            <h5>Attendance Rate</h5>
            <div className="progress">
              <div 
                className="progress-bar" 
                role="progressbar" 
                style={{ 
                  width: `${current_term.total_classes > 0 ? 
                    (current_term.attended_classes / current_term.total_classes) * 100 : 0}%` 
                }}
                aria-valuenow={current_term.total_classes > 0 ? 
                  (current_term.attended_classes / current_term.total_classes) * 100 : 0}
                aria-valuemin="0" 
                aria-valuemax="100"
              >
                {current_term.total_classes > 0 ? 
                  `${Math.round((current_term.attended_classes / current_term.total_classes) * 100)}%` : '0%'}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Performance Metrics */}
      <Card className="mb-4">
        <Card.Header as="h5">Performance Metrics</Card.Header>
        <Card.Body>
          <div className="metrics-container">
            {current_term.performance_metrics && Object.entries(current_term.performance_metrics).map(([key, value]) => (
              <div key={key} className="metric-item">
                <h6>{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h6>
                <h3>{value}</h3>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Professor Feedback */}
      <Card className="mb-4">
        <Card.Header as="h5">Professor Feedback</Card.Header>
        <Card.Body>
          <div className="feedback-container">
            <p>{current_term.feedback || 'No feedback provided yet.'}</p>
          </div>
        </Card.Body>
      </Card>

      {/* Attendance Records */}
      <Card className="mb-4">
        <Card.Header as="h5">Attendance Records</Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance && attendance.length > 0 ? (
                attendance.map((record, index) => (
                  <tr key={index}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>
                      <Badge 
                        bg={record.status === 'present' ? 'success' : 'danger'}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
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

      {/* Previous Terms */}
      {previous_terms && previous_terms.length > 0 && (
        <Card>
          <Card.Header as="h5">Previous Terms</Card.Header>
          <Card.Body>
            {previous_terms.map((term, index) => (
              <div key={index} className="mb-4">
                <h5>{term.term} - Grade: {term.grade}</h5>
                <div className="metrics-container mt-3">
                  {term.performance_metrics && Object.entries(term.performance_metrics).map(([key, value]) => (
                    <div key={key} className="metric-item">
                      <h6>{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h6>
                      <h3>{value}</h3>
                    </div>
                  ))}
                </div>
                <div className="feedback-container mt-3">
                  <h6>Feedback:</h6>
                  <p>{term.feedback || 'No feedback provided.'}</p>
                </div>
              </div>
            ))}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default StudentDashboard;