import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  expiryTimestamp: number;
  onExpire: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiryTimestamp, onExpire }) => {
  const [hasExpired, setHasExpired] = useState(false);

  const calculateTimeLeft = () => {
    const difference = expiryTimestamp - new Date().getTime();
    
    if (difference <= 0 && !hasExpired) {
        setHasExpired(true);
        onExpire();
    }
    
    return {
      minutes: Math.max(0, Math.floor((difference / 1000 / 60) % 60)),
      seconds: Math.max(0, Math.floor((difference / 1000) % 60)),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    if(hasExpired) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [expiryTimestamp, onExpire, hasExpired]);

  return (
    <div className="font-mono text-center">
      <span className="text-lg font-bold text-red-600">
        {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
      <p className="text-xs text-gray-500">Tiempo restante para responder</p>
    </div>
  );
};

export default CountdownTimer;
