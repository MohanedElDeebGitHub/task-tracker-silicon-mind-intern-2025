import React from 'react';
import { Nav } from 'react-bootstrap';

function SideBar({ user }) {
  return (
    <aside className="SideBar vh-100 p-3 d-flex flex-column">
      <h1 className="h4 text-white mb-4">TrackR</h1>
      <Nav defaultActiveKey="/dashboard" className="flex-column">
        <Nav.Link href="/dashboard" className="active text-white">Tasks</Nav.Link>
      </Nav>
      <div className="mt-auto">
        <div className="text-white user-profile">
          <div className="user-icon"></div>
          <div>
            <div>{user.name}</div>
            <small className="text-white-50">User</small>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default SideBar;