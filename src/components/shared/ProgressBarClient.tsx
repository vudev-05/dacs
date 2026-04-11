"use client";

import { Next13ProgressBar } from 'next13-progressbar';

export default function ProgressBarClient() {
  return (
    <Next13ProgressBar 
        height="4px" 
        color="#de1b32" 
        options={{ showSpinner: false }} 
        showOnShallow 
    />
  );
}
