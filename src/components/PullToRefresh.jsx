import { useState, useRef } from 'react';

export default function PullToRefresh({ children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);

  const onTouchStart = (e) => {
    // Only trigger if user is at the very top of the page
    if (window.scrollY === 0 && !refreshing) {
      startY.current = e.touches[0].clientY;
    } else {
      startY.current = 0;
    }
  };

  const onTouchMove = (e) => {
    if (startY.current > 0 && !refreshing) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;
      // Apply resistance so it doesn't pull forever
      if (distance > 0) {
        setPull(Math.min(distance * 0.5, 100));
      }
    }
  };

  const onTouchEnd = () => {
    if (pull > 60 && !refreshing) {
      setRefreshing(true);
      // Reload the page after a slight delay so the user sees the spinner
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      setPull(0);
      startY.current = 0;
    }
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        transform: `translateY(${pull}px)`,
        transition: pull === 0 ? 'transform 0.3s ease-out' : 'none',
        minHeight: '100vh'
      }}
    >
      {pull > 10 && (
        <div style={{ textAlign: 'center', padding: '10px', fontSize: '24px', opacity: pull / 60 }}>
          {refreshing ? '🔄 Refreshing...' : '⬇️ Pull down to refresh'}
        </div>
      )}
      {children}
    </div>
  );
}