import React from 'react';
import { User } from 'lucide-react';
import { CandidateProfile } from '../../../../../lib/tailor/types';

export interface CandidateProfileSectionProps {
  candidate: CandidateProfile;
  updateCandidateName: (name: string) => void;
  updateCandidateContact: (contact: Record<string, string>) => void;
}

export function CandidateProfileSection({
  candidate,
  updateCandidateName,
  updateCandidateContact,
}: CandidateProfileSectionProps) {
  return (
    <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-5 space-y-4 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            CANDIDATE PROFILE &amp; CONTACT
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Full Name</label>
          <input
            type="text"
            value={candidate.fullName}
            onChange={(e) => updateCandidateName(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Email</label>
          <input
            type="email"
            value={candidate.contact.email || ''}
            onChange={(e) => updateCandidateContact({ email: e.target.value })}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Phone</label>
          <input
            type="text"
            value={candidate.contact.phone || ''}
            onChange={(e) => updateCandidateContact({ phone: e.target.value })}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Location</label>
          <input
            type="text"
            value={candidate.contact.location || ''}
            onChange={(e) => updateCandidateContact({ location: e.target.value })}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">LinkedIn</label>
          <input
            type="text"
            value={candidate.contact.linkedin || ''}
            onChange={(e) => updateCandidateContact({ linkedin: e.target.value })}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">GitHub / Portfolio</label>
          <input
            type="text"
            value={candidate.contact.github || candidate.contact.portfolio || ''}
            onChange={(e) => updateCandidateContact({ github: e.target.value })}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>
    </div>
  );
}
