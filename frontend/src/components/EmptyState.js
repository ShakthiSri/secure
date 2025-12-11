import React from 'react';
import './EmptyState.css';

const EmptyState = ({ message = "No data available." }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">📋</div>
      <h2>No Recipes Found</h2>
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;

