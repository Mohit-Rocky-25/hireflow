/**
 * HireFlow v4: Client-Side iCalendar (.ics) Generator (D18)
 * Generates RFC 5545 compliant calendar event files with exam dates,
 * registration deadlines, and milestone study reminders.
 */

import { safeSlug } from '../../../lib/safeUtils';

export interface CalendarEventMilestone {
  title: string;
  date: string; // YYYY-MM-DD
  description?: string;
}

export interface ExamCalendarConfig {
  examName: string;
  examDate: string; // YYYY-MM-DD
  registrationDeadline?: string; // YYYY-MM-DD
  admitCardDate?: string; // YYYY-MM-DD
  description?: string;
  location?: string;
}

function formatDateToICS(dateStr: string): string {
  // Converts YYYY-MM-DD to YYYYMMDD
  return dateStr.replace(/-/g, '');
}

export function generateExamCalendarIcs(config: ExamCalendarConfig): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const cleanSlug = safeSlug(config.examName);

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HireFlow//Career Toolkit//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  // Helper to add a VEVENT
  const addEvent = (summary: string, dateStr: string, desc: string, uidSuffix: string) => {
    const icsDate = formatDateToICS(dateStr);
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${cleanSlug}-${uidSuffix}-${icsDate}@hireflow.dev`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART;VALUE=DATE:${icsDate}`);
    lines.push(`SUMMARY:${summary}`);
    lines.push(`DESCRIPTION:${desc.replace(/\n/g, '\\n')}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('TRANSP:TRANSPARENT');
    lines.push('END:VEVENT');
  };

  // 1. Primary Exam Event
  addEvent(
    `🎯 ${config.examName} Examination`,
    config.examDate,
    `${config.description || 'Target examination date.'}\\nOrganized via HireFlow Career Engine.`,
    'exam'
  );

  // 2. Registration Deadline (if provided)
  if (config.registrationDeadline) {
    addEvent(
      `⚠️ Registration Deadline: ${config.examName}`,
      config.registrationDeadline,
      `Last date to complete registration and fee payment for ${config.examName}.`,
      'reg'
    );
  }

  // 3. Admit Card Release (if provided)
  if (config.admitCardDate) {
    addEvent(
      `📋 Admit Card Release: ${config.examName}`,
      config.admitCardDate,
      `Download and verify exam center details for ${config.examName}.`,
      'admit'
    );
  }

  // 4. Milestone: 30-Day Preparation Sprint Reminder
  try {
    const examD = new Date(config.examDate);
    const thirtyDaysBefore = new Date(examD.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thirtyStr = thirtyDaysBefore.toISOString().split('T')[0];
    addEvent(
      `🚀 30-Day Sprint: ${config.examName}`,
      thirtyStr,
      `Begin full-length mock tests and formula revisions for ${config.examName}.`,
      'm30'
    );

    // Milestone: 7-Day Final Revision
    const sevenDaysBefore = new Date(examD.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenStr = sevenDaysBefore.toISOString().split('T')[0];
    addEvent(
      `🔥 7-Day Final Review: ${config.examName}`,
      sevenStr,
      `Final weak-area review and previous year questions (PYQs) for ${config.examName}.`,
      'm7'
    );
  } catch {
    // Ignore date math error
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadCalendarIcs(config: ExamCalendarConfig): void {
  const icsText = generateExamCalendarIcs(config);
  const blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8' });
  const filename = `${safeSlug(config.examName)}-schedule.ics`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
