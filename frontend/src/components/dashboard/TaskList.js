import React, { useState, useMemo } from 'react';
import { Card, Table, Form, Badge } from 'react-bootstrap';

function TaskList({ tasks }) {
  const [statusFilter, setStatusFilter] = useState('');

  // useMemo will re-calculate the filtered tasks only when the
  // tasks prop or the statusFilter state changes.
  const filteredTasks = useMemo(() => {
    if (!statusFilter || statusFilter === 'all') {
      return tasks;
    }
    return tasks.filter(task => task.status === statusFilter);
  }, [tasks, statusFilter]);

  const getStatusBadge = (status) => {
    const variants = {
      'done': 'success',
      'in-progress': 'warning',
      'to-do': 'secondary'
    };
    return <Badge bg={variants[status] || 'primary'}>{status}</Badge>;
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">All Tasks</h5>
        <Form.Select 
          style={{ width: '200px' }} 
          onChange={(e) => setStatusFilter(e.target.value)}
          value={statusFilter}
        >
          <option value="all">Sort by: All</option>
          <option value="to-do">To-do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </Form.Select>
      </Card.Header>
      <Card.Body>
        <Table hover responsive>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Total Duration</th>
              <th>Created At</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.description}</td>
                  <td>{task.total_duration}</td>
                  <td>{new Date(task.created_at).toLocaleDateString()}</td>
                  <td>{getStatusBadge(task.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">No tasks found.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export default TaskList;
