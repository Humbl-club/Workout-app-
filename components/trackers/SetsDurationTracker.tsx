import React, { useState, useEffect, useRef } from 'react';
import { LoggedSetDuration } from '../../types';
import { PlayIcon, PauseIcon, StopIcon } from '../icons';

interface SetsDurationTrackerProps {
  setIndex: number;
  targetDuration: number;
  onLogSet: (data: LoggedSetDuration) => void;
}

const SetsDurationTracker: React.FC<SetsDurationTrackerProps> = ({ setIndex, targetDuration, onLogSet }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      const startTime = Date.now() - elapsedTime;
      intervalRef.current = window.setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, elapsedTime]);

  const handleLog = () => {
    setIsRunning(false);
    onLogSet({ set: setIndex, duration_s: (elapsedTime / 1000).toFixed(2) });
  };
  
  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
  }

  const formatTime = (time: number) => {
    const seconds = Math.floor(time / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    return `${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-stone-900/50 p-4 rounded-lg flex flex-col items-center">
        <h4 className="text-lg font-bold text-white mb-2">Set {setIndex}</h4>
        <p className="text-sm text-stone-400 mb-4">(Target: {targetDuration}s)</p>
        
        <div className="font-mono text-6xl font-extrabold text-white my-4">
            {formatTime(elapsedTime)}
        </div>

        <div className="flex items-center gap-4">
            <button onClick={() => setIsRunning(!isRunning)} className="w-16 h-16 flex items-center justify-center bg-stone-800/80 text-stone-200 rounded-full hover:bg-stone-700/80 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">
                {isRunning ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8 ml-1"/>}
            </button>
             <button onClick={handleReset} className="w-16 h-16 flex items-center justify-center bg-stone-800/80 text-stone-200 rounded-full hover:bg-stone-700/80 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">
                <StopIcon className="w-8 h-8"/>
            </button>
        </div>

        <div className="mt-6 w-full">
            <button
                onClick={handleLog}
                disabled={elapsedTime === 0}
                className="w-full inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-full shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-900 focus:ring-red-500 disabled:bg-stone-500 disabled:text-stone-300 disabled:cursor-not-allowed transition-colors"
            >
                Log Set
            </button>
        </div>
    </div>
  );
}
export default SetsDurationTracker;