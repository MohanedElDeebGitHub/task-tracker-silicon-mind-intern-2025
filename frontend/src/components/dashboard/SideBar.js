import React from 'react';
import { Nav, Card } from 'react-bootstrap';

function SideBar({ user }) {
  return (
    <aside className="SideBar">
      <div className="sidebar-top-content">
        <h1 className="SideBar-brand">TrackR</h1>
        
        <Card className="SideBar-active-card border-0 rounded-3 shadow-sm">
          <Card.Body className="p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <div className="bg-white bg-opacity-15 rounded-2 p-2 me-3">
                  <i className="fas fa-tasks text-white"></i> {/* Font Awesome icon */}
                </div>
                <h6 className="mb-0 fw-semibold text-white">Tasks</h6>
              </div>
              <i className="fas fa-chevron-right text-white-50"></i>
            </div>
          </Card.Body>
        </Card>
      </div>
      
      <div className="user-profile">
        <div className="user-icon"></div>
        <div>
          <div className="user-profile-name">{user}</div>
          <small className="user-profile-permission">free plan user</small>
        </div>
      </div>
    </aside>
  );
}

export default SideBar;