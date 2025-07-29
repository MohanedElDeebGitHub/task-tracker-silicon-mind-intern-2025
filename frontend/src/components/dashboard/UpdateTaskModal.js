import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner, Alert } from 'react-bootstrap';

function UpdateTaskModal({ show, onHide, task, onTaskUpdated }) {
  // State for the form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('to-do');
  
  // State for loading and errors within the modal
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // useEffect hook to populate the form when a task is selected
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'to-do');
    }
  }, [task]); // This effect runs whenever the 'task' prop changes

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const updatedData = { title, description, status };
    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update task');
      }

      onTaskUpdated(result); // Pass the updated task back to the dashboard
      onHide(); // Close the modal

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onHide();
  };
  
  // Don't render the modal if no task is selected
  if (!task) return null;

  // Check if task is done
  const isTaskDone = task.status === 'done';

  return (
    <Modal show={show} onHide={handleClose} centered fade={false}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        {/* Show warning message if task is done */}
        {isTaskDone && (
          <Alert variant="info" style={{ opacity: 1, display: 'block' }}>
            <strong>Note:</strong> This task is completed. Status cannot be changed.
          </Alert>
        )}
        
        <Form onSubmit={handleUpdate}>
          <Form.Group className="mb-3" controlId="updateTaskTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="updateTaskDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="updateTaskStatus">
            <Form.Label>Status</Form.Label>
            <Form.Select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              disabled={isTaskDone} // Disable if task is done
            >
              <option value="to-do">To-do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </Form.Select>
            {isTaskDone && (
              <Form.Text className="text-muted">
                Status is locked because this task is completed.
              </Form.Text>
            )}
          </Form.Group>
          
          <div className="d-grid">
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? <Spinner as="span" animation="border" size="sm" /> : "Save Changes"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default UpdateTaskModal;