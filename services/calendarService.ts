import { WorkoutPlan } from '../types';

// Helper to format date/time for iCalendar spec (YYYYMMDDTHHMMSSZ)
const formatIcsDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

// Helper to escape text for iCalendar spec
const escapeIcsText = (text: string): string => {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
};

export const generateIcsContent = (plan: WorkoutPlan): string => {
  const events: string[] = [];
  const now = new Date();
  
  // Find the date of the next Monday
  const today = new Date();
  const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, ...
  const daysUntilMonday = (dayOfWeek === 0) ? 1 : (8 - dayOfWeek);
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  nextMonday.setHours(9, 0, 0, 0); // Default workout time to 9 AM

  (plan?.weeklyPlan || []).forEach((day) => {
    // FIX: Updated logic to check for exercises within the new 'blocks' structure.
    // Skip rest days
    if (!day || (day?.blocks || []).flatMap(b => b.exercises).length === 0 || day.focus.toLowerCase().includes('rest')) {
      return;
    }

    const eventDate = new Date(nextMonday);
    // day.day_of_week is 1 for Monday, 7 for Sunday
    eventDate.setDate(nextMonday.getDate() + (day.day_of_week - 1));

    const startDate = new Date(eventDate);
    const endDate = new Date(eventDate);
    endDate.setHours(startDate.getHours() + 1); // Assume 1-hour workouts

    const eventTitle = `REBLD: ${day.focus}`;
    
    // FIX: Updated logic to extract exercises from the new 'blocks' structure.
    const exerciseList = (day?.blocks || [])
        .flatMap(block => block.exercises)
        .map(ex => `- ${ex.exercise_name}`)
        .join('\\n');

    const eventDescription = `Today's focus: ${day.focus}.\\n\\nExercises:\\n${exerciseList}`;

    const event = [
      'BEGIN:VEVENT',
      `UID:${Date.now()}${Math.random()}@rebld.app`,
      `DTSTAMP:${formatIcsDate(now)}`,
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      `SUMMARY:${escapeIcsText(eventTitle)}`,
      `DESCRIPTION:${escapeIcsText(eventDescription)}`,
      // Recur weekly
      'RRULE:FREQ=WEEKLY',
      'END:VEVENT'
    ].join('\r\n');

    events.push(event);
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//REBLD//Workout Plan//EN',
    ...events,
    'END:VCALENDAR'
  ].join('\r\n');
};