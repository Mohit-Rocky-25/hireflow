import React from 'react';
import { ResumeMatrixPage } from '@/features/resumes/ResumeMatrixPage';

export const ResumesSection: React.FC = () => {
  return (
    <div className="max-w-[1100px]">
      <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#6d6d61] uppercase mb-2">
        Resume Matrix
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-[#f1f1e8] mb-6">
        Resumes
      </h2>
      <ResumeMatrixPage />
    </div>
  );
};

