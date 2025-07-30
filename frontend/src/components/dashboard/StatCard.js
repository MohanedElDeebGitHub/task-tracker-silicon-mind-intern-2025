import React from 'react';
import { Card } from 'react-bootstrap';

function StatCard({ title, value, trend }) {
  const trendColor = trend.startsWith('+') ? 'text-success' : 'text-danger';

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <div className="d-flex align-items-center">
          <div className="stat-icon me-3">
             {/* Placeholder for icon */}
          </div>
          <div>
            <h5 className="mb-0 fw-bold">{value}</h5>
            <small className="text-muted">{title}</small>
            {trend && <small className={`ms-2 ${trendColor}`}>{trend}</small>}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default StatCard;