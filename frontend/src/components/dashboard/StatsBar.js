import React from "react";
import { Row, Col } from "react-bootstrap";
import StatCard from "./StatCard";

function StatsBar({ stats }) {
  return (
    <Row className="mb-4">
      {stats.map((stat, index) => (
        <Col md={4} key={index}>
          <StatCard title={stat.title} value={stat.value} trend={stat.trend} />
        </Col>
      ))}
    </Row>
  );
}

export default StatsBar;
