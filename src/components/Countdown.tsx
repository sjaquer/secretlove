
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

    const labels: Record<keyof TimeLeft, string> = {
      days: 'Días',
      hours: 'Horas',
      minutes: 'Min',
      seconds: 'Seg'
    };

    timerComponents.push(
      <div key={key} className="flex flex-col items-center px-1 sm:px-2">
        <span className="font-bold text-xl sm:text-2xl md:text-3xl text-red-600 tabular-nums">{String(time[key]).padStart(2, '0')}</span>
        <span className="text-[10px] sm:text-xs font-medium text-pink-700 uppercase tracking-wider">{labels[key]}</span>
      </div>
    );
  });

  return (
    <div className="mb-3 md:mb-4">
      {timerComponents.length ? (
        <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 bg-gradient-to-r from-pink-50 to-red-50 rounded-xl border-2 border-pink-200 shadow-sm">
            {timerComponents}
        </div>
      ) : null}
    </div>
  );
}
