import React from "react";

function BrandingPanel() {
  return (
    <div className="branding-panel text-white d-flex flex-column justify-content-center p-5">
      <h1 className="branding-panel-content">TrackR</h1>
      <p className="lead branding-panel-content">Lightweight Task Tracking</p>

      {/* Decorative circle elements */}
      <div className="circle circle-1"></div>
      <div className="circle circle-2"></div>
    </div>
  );
}

export default BrandingPanel;
