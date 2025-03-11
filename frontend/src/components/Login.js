import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // In a real app, this would be an actual authentication API call
      // For this prototype, we'll simulate by fetching the user from our JSON data
      const endpoint = role === 'student' ? '/api/students' : '/api/professors';
      const response = await axios.get(endpoint);
      
      const user = response.data.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (user) {
        onLogin({ ...user, role });
      } else {
        setError('User not found. Please check your email and role.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card>
        <Card.Header className="text-center">
          <h4>Physical Education Program Login</h4>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="Enter your university email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                Use your university email address
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="professor">Professor</option>
              </Form.Select>
            </Form.Group>

            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </Form>
        </Card.Body>
        <Card.Footer className="text-center text-muted">
          <small>For demo purposes: Use emails from the JSON data files</small>
          <div>
            <small>Student: john.doe@university.edu</small>
          </div>
          <div>
            <small>Professor: robert.johnson@university.edu</small>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default Login;