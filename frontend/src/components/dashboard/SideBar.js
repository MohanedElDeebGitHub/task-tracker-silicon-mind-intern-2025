import React from 'react';
import { Nav } from 'react-bootstrap';

function SideBar({ user }) {
  return (
    <aside className="SideBar">
      <div className="sidebar-top-content">
        <h1 className="h4 text-white mb-4">TrackR</h1>
        <Nav defaultActiveKey="/dashboard" className="flex-column">
          <Nav.Link href="/dashboard" className="active text-white">Tasks</Nav.Link>
        </Nav>
      </div>
      
      <div className="user-profile">
        <div className="user-icon"></div>
        <div>
          <div>{user.name}</div>
          <small className="text-white-50">free plan user</small>
        </div>
      </div>
    </aside>
  );
}

export default SideBar;