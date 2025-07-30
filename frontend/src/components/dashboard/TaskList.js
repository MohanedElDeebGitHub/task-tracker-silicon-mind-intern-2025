import React, { useState, useMemo } from 'react';
import { Card, Table, Form, Badge, Button, Pagination } from 'react-bootstrap';
import AddTaskForm from './AddTaskForm';
import '../../styles/TaskList.css';

function TaskList({ tasks = [], onEditClick, onTaskAdded }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(3); 

  const getRowClassName = (status) => {
    if(status === 'in progress') return 'task-row status-in-progress'; // until (in progrss) naming is changed to NOT include space, we need this hotfix
    return `task-row status-${status}`;
};

  const getBadgeClassName = (badge) => {
    if(badge === 'in progress') return 'task-status-badge task-status-badge-in-progress'; // until (in progrss) naming is changed to NOT include space, we need this hotfix
    return `task-status-badge task-status-badge-${badge}`;
};


  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) {
      return [];
    }
    
    if (!statusFilter || statusFilter === 'all') {
      return tasks;
    }
    return tasks.filter(task => task.status === statusFilter);
  }, [tasks, statusFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;
  const currentTasks = filteredTasks.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useMemo(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const getStatusBadge = (status) => {
    const variants = {
      'done': 'success',
      'in progress': 'warning',
      'to-do': 'secondary'
    };
    return (
      <Badge 
        bg={variants[status] || 'primary'} 
        className={getBadgeClassName(status)}
      >
        {status || 'Unknown'}
      </Badge>
    );
  };

  const formatDuration = (duration, status) => {
    if(status !== 'done'){
      return 'Task unfinished';
    }else{
if (!duration || typeof duration !== 'object' || Object.keys(duration).length === 0) {
      return 'Immediate finish';
    }else{
const hours = duration.hours || 0;
      const minutes = duration.minutes || 0;
      const seconds = duration.seconds || 0;
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Task unfinished';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleNewTaskClick = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    
    // Previous button
    if(currentPage > 1)
    items.push(
      <Pagination.Prev
        key="prev"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      />
    );

    // Page numbers
    for (let page = 1; page <= totalPages; page++) {
      if (
        page === 1 || // Always show first page
        page === totalPages || // Always show last page
        (page >= currentPage - 1 && page <= currentPage + 1) // Show current page ± 1
      ) {
        items.push(
          <Pagination.Item
            key={page}
            active={page === currentPage}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Pagination.Item>
        );
      } else if (
        page === currentPage + 2
      ) {
        items.push(<Pagination.Ellipsis key={`ellipsis-${page}`} onClick={() => handlePageChange(currentPage+2)} />);
      }
    }

    // Next button
    if(currentPage < totalPages){
    items.push(
      <Pagination.Next
        key="next"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      />
    );}

    return items;
  };

  return (
    <>
      <Card className="task-list-card shadow-sm border-0">
        <Card.Header className="task-list-header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <h5 className="task-list-title mb-0">
              All Tasks ({filteredTasks.length})
              {totalPages > 1 && (
                <small className="text-muted ms-2">
                  Page {currentPage} of {totalPages}
                </small>
              )}
            </h5>
            <Button 
              variant="primary" 
              size="sm"
              onClick={handleNewTaskClick}
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
            <option value="in progress">In Progress</option>
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
              {currentTasks.length > 0 ? (
                currentTasks.map(task => (
                  <tr 
                    key={task.id} 
                    className={getRowClassName(task.status)}  // ← Use the function here
                    onClick={() => onEditClick && onEditClick(task)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="task-title">
                      {task.title || 'Untitled Task'}
                    </td>
                    <td className="task-description">
                      {task.description || 'No description'}
                    </td>
                    <td className="task-duration">
                      {formatDuration(task.total_duration, task.status)}
                    </td>
                    <td className="task-date">
                      {formatDate(task.created_at)}
                    </td>
                    <td className="task-status">
                      {getStatusBadge(task.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="task-empty-state text-center text-muted py-4">
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <Card.Footer className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredTasks.length)} of {filteredTasks.length} tasks
            </small>
            <Pagination className="mb-0">
              {renderPaginationItems()}
            </Pagination>
          </Card.Footer>
        )}
      </Card>

      {/* Add Task Modal */}
      <AddTaskForm 
        show={showAddModal}
        onHide={handleCloseModal}
        onTaskAdded={onTaskAdded}
      />
    </>
  );
}

export default TaskList;