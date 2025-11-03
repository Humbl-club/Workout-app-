import React from 'react';
import { WorkoutLog } from '../types';
import VictoryScreen from '../components/VictoryScreen';

interface SessionSummaryPageProps {
  sessionLog: WorkoutLog;
  onDone: () => void;
}

export default function SessionSummaryPage({ sessionLog, onDone }: SessionSummaryPageProps) {
  return <VictoryScreen sessionLog={sessionLog} onDone={onDone} />;
}
