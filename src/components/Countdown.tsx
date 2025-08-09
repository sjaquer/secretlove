
"use client";

import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function Countdown({ targetDate }: { targetDate: Date }) {
  const calculateTimeLeft = (): TimeLeft | {} => {
    const difference = +targetDate - +new Date();
    let timeLeft: TimeLeft | {} = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  if (!isClient) {
    return null;
  }

  const timerComponents: JSX.Element[] = [];
  const time = timeLeft as TimeLeft;

  Object.keys(timeLeft).forEach((interval) => {
    const key = interval as keyof TimeLeft;
    if (!time[key] && time[key] !== 0) {
      return;
    }

    timerComponents.push(
      <div key={key} className="flex flex-col items-center">
        <span className="font-bold text-lg md:text-xl text-primary">{String(time[key]).padStart(2, '0')}</span>
        <span className="text-xs text-muted-foreground">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
      </div>
    );
  });

  return (
    <div className="mb-4">
      {timerComponents.length ? (
        <div className="flex justify-center gap-4 p-2 bg-primary/5 rounded-lg border border-primary/10">
            {timerComponents}
        </div>
      ) : (
        <div className="text-center p-2 bg-accent/10 rounded-lg">
          <p className="text-sm text-accent-foreground">Un nuevo secreto te espera:</p>
          <p className="font-bold text-lg text-accent tracking-widest animate-pulse">TAMMV</p>
        </div>
      )}
    </div>
  );
}
