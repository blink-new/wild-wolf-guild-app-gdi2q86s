import { useEffect, useState } from 'react';

interface BossTimerProps {
  bossName: string;
  spawnTime: Date;
}

export const BossTimer = ({ bossName, spawnTime }: BossTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilSpawn(spawnTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilSpawn(spawnTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [spawnTime]);

  function getTimeUntilSpawn(spawnTime: Date) {
    const now = new Date();
    const diff = spawnTime.getTime() - now.getTime();
    if (diff <= 0) return 'Now!';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  return (
    <span className="text-amber-400 font-semibold text-lg animate-pulse">
      {timeLeft}
    </span>
  );
};
