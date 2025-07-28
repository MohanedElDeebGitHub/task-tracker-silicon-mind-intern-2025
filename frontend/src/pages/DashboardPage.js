import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import SideBar from '../components/dashboard/SideBar';
import StatsBar from '../components/dashboard/StatsBar';
import TaskList from '../components/dashboard/TaskList';
import '../styles/dashboard.css'; // We will create this CSS file

export function DashboardPage() {
  // State for holding all the data for the page
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState({ name: 'User' }); // Default user
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect hook runs after the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');

        if (!token) {
          throw new Error("Authentication token not found.");
        }

        // --- Fetch Tasks ---
        const tasksResponse = await fetch('http://localhost:3001/api/tasks', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!tasksResponse.ok) throw new Error('Failed to fetch tasks');
        const tasksData = await tasksResponse.json();

        <ul>
  {tasks.map(task => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
        // --- Mock Stats Data (replace with API call later) ---
        setStats([
          { title: "Stat #1", value: "5,423", trend: "+16%" },
          { title: "Stat #2", value: "1,893", trend: "-7%" },
          { title: "Stat #3", value: "189", trend: "" }
        ]);

        // --- TODO: Fetch User and Stats Data from backend ---
        // For now, we use mock data.

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // The empty array [] means this effect runs only once

  // if (loading) return <div>Loading...</div>;
  // if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard-layout">


      <div className='SideBar'>
        <SideBar user={user} />
      </div>

      <div className="main-content">

        <header>
          <h2>Hello {user.name} 👋</h2>
        </header>


        <TaskList tasks={tasks} />

      </div>


    </div>
  );
}

export default DashboardPage;