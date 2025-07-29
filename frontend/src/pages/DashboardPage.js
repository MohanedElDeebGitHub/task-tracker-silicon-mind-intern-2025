import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import SideBar from '../components/dashboard/SideBar';
import TaskList from '../components/dashboard/TaskList';
import AddTaskForm from '../components/dashboard/AddTaskForm';
import '../styles/dashboard.css';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState({ name: 'User' });
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false); // was true
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) navigate('/');

      const response = await fetch('http://localhost:3001/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        console.log('Unauthorized - redirecting to login');
        localStorage.removeItem('authToken'); // Clear invalid token
        navigate('/');
        return;
    }

      if (!response.ok){
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
            <h2>Hello, {user.name} 👋</h2>
          </header>
          <TaskList 
            tasks={tasks} 
            onNewTaskClick={() => setShowAddModal(true)}
          />
        </div>
      </div>

      <AddTaskForm 
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onTaskAdded={handleTaskAdded}
      />
    </>
  );
}

export default DashboardPage;
