import React from 'react';
import { ResumeMatrixPage } from '@/features/resumes/ResumeMatrixPage';

export const ResumesSection: React.FC = () => {
  return (
    <div className="max-w-[1160px] space-y-4">
      <div>
        <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#9b9b8c] uppercase mb-1">
          Resume Matrix
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-[#f1f1e8]">
          Resumes
        </h2>
      </div>
      <ResumeMatrixPage embedded />
    </div>
  );
};

