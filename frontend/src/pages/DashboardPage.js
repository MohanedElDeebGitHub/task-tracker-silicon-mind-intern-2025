import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import SideBar from '../components/dashboard/SideBar';
import StatsBar from '../components/dashboard/StatsBar';
import TaskList from '../components/dashboard/TaskList';
import '../styles/dashboard.css';

export function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState({ name: 'User' });
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const tasksResponse = await fetch('http://localhost:3001/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!tasksResponse.ok) throw new Error('Failed to fetch tasks');
      
      const tasksData = await tasksResponse.json();
      
      if (Array.isArray(tasksData)) {
        setTasks(tasksData);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setTasks([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchTasks();
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleTaskAdded = async (newTask) => {
    // Option 1: Add the new task to existing list
    setTasks(prevTasks => [newTask, ...prevTasks]);
    
    // Option 2: Or refresh the entire list
    // await fetchTasks();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
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
          onTaskAdded={handleTaskAdded}
        />
      </div>
    </div>
  );
}

export default DashboardPage;