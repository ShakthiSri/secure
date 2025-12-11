import React from 'react';
import './StarRating.css';

const StarRating = ({ rating }) => {
  if (rating === null || rating === undefined || isNaN(rating)) {
    return <span className="no-rating">N/A</span>;
  }

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="star-rating">
      {Array.from({ length: fullStars }).map((_, i) => (
        <span key={`full-${i}`} className="star star-full">★</span>
      ))}
      {hasHalfStar && <span className="star star-half">★</span>}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <span key={`empty-${i}`} className="star star-empty">★</span>
      ))}
      <span className="rating-value">({rating.toFixed(1)})</span>
    </div>
  );
};

export default StarRating;

