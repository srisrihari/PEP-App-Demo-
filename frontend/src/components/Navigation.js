import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Navigation = ({ user, onLogout }) => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Physical Education Program
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user.role === 'student' && (
              <Nav.Link as={Link} to="/student">Dashboard</Nav.Link>
            )}
            {user.role === 'professor' && (
              <Nav.Link as={Link} to="/professor">Dashboard</Nav.Link>
            )}
          </Nav>
          <Nav>
            <span className="nav-username text-light d-flex align-items-center">
              Welcome, {user.name}
            </span>
            <Button variant="outline-light" onClick={onLogout}>Logout</Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;