import React from "react";

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  progress,
  className = "",
  showLabel = true,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm font-medium">
            {clampedProgress.toFixed(0)}%
          </span>
        </div>
      )}
      <div className="w-full h-3 bg-gray-200 border-2 border-black">
        <div
          className="h-full bg-red-600 transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
