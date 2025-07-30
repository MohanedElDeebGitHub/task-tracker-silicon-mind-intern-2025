import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import SideBar from '../components/dashboard/SideBar';
import TaskList from '../components/dashboard/TaskList';
import AddTaskForm from '../components/dashboard/AddTaskForm';
import UpdateTaskModal from '../components/dashboard/UpdateTaskModal';
import '../styles/dashboard.css';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  // const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/');
        return;
      }

      setUser(localStorage.getItem('username'));
      console.log(user);

      const response = await fetch('http://localhost:3001/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        console.log('Unauthorized - redirecting to login');
        localStorage.removeItem('authToken');
        navigate('/');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setTasks([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchTasks();
      setLoading(false);
    };
    init();
  }, []);

  const handleTaskAdded = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
    setShowAddModal(false);
  };

  const handleTaskEdit = (task) => {
    console.log('Editing task:', task);
    setSelectedTask(task);
    setShowUpdateModal(true);
  };

  const handleTaskUpdated = (updatedTask) => {
    console.log('Task updated:', updatedTask);
    
    // Update the task in the tasks array
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    
    // Close the modal and clear selected task
    setShowUpdateModal(false);
    setSelectedTask(null);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedTask(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="dashboard-layout">
        <div className='SideBar'>
          <SideBar user={user} />
        </div>
        <div className="main-content">
          <header>
            <h2>Hello, {user} 👋</h2>
          </header>
          <TaskList 
            tasks={tasks} 
            onNewTaskClick={() => setShowAddModal(true)}
            onEditClick={handleTaskEdit}
            onTaskAdded={handleTaskAdded}
          />
        </div>
      </div>


      {/* Update Task Modal */}
      <UpdateTaskModal
        show={showUpdateModal}
        onHide={handleCloseUpdateModal}
        task={selectedTask}
        onTaskUpdated={handleTaskUpdated}
      />
    </>
  );
}

export default DashboardPage;