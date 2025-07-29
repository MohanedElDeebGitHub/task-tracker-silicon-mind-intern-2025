import React, { useState, useMemo } from 'react';
import { Card, Table, Form, Badge, Button } from 'react-bootstrap';
import '../../styles/TaskList.css';

function TaskList({ tasks = [], onNewTaskClick }) {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) {
      return [];
    }
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
    return (
      <Badge bg={variants[status] || 'primary'} className="task-status-badge">
        {status || 'Unknown'}
      </Badge>
    );
  };

  const formatDuration = (duration) => {
    if (!duration || typeof duration !== 'object' || Object.keys(duration).length === 0) {
      return 'N/A';
    }
    const { hours = 0, minutes = 0, seconds = 0 } = duration;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <Card className="task-list-card shadow-sm border-0">
      <Card.Header className="task-list-header d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <h5 className="task-list-title mb-0">All Tasks ({filteredTasks.length})</h5>
          <Button 
            variant="primary" 
            size="sm"
            onClick={onNewTaskClick}
            className="d-flex align-items-center gap-1"
          >
            <span>+</span> New Task
          </Button>
        </div>
        
        <Form.Select 
          className="task-filter-select"
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
      
      <Card.Body className="task-list-body p-0">
        <Table hover responsive className="task-table mb-0">
          <thead className="task-table-header">
            <tr>
              <th className="task-th">Title</th>
              <th className="task-th">Description</th>
              <th className="task-th">Duration</th>
              <th className="task-th">Created</th>
              <th className="task-th">Status</th>
            </tr>
          </thead>
          <tbody className="task-table-body">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <tr key={task.id} className="task-row">
                  <td className="task-title">{task.title || 'Untitled Task'}</td>
                  <td className="task-description">{task.description || 'No description'}</td>
                  <td className="task-duration">{formatDuration(task.total_duration)}</td>
                  <td className="task-date">{formatDate(task.created_at)}</td>
                  <td className="task-status">{getStatusBadge(task.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="task-empty-state text-center text-muted py-4">
                  No tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export default TaskList;