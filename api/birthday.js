// api/birthday.js
// Endpoint to queue birthday emails for students whose birthday is today

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Get today's month and day
  const today = new Date();
  const month = today.getMonth() + 1; // JS months are 0-based
  const day = today.getDate();

  // Find students with birthday today
  const { data: students, error } = await supabase
    .from('students')
    .select('*')
    .filter('birthday', 'neq', null);

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch students' });
  }

  // Filter students whose birthday matches today (assuming birthday is YYYY-MM-DD)
  const birthdayStudents = students.filter(s => {
    if (!s.birthday) return false;
    const [y, m, d] = s.birthday.split('-').map(Number);
    return m === month && d === day;
  });

  // Queue birthday emails for each student
  let queued = 0;
  for (const student of birthdayStudents) {
    // Check if already queued today
    const { data: existing } = await supabase
      .from('email_queue')
      .select('id')
      .eq('matric_number', student.matric_number)
      .eq('email_type', 'birthday')
      .gte('created_at', today.toISOString().split('T')[0] + 'T00:00:00');
    if (existing && existing.length > 0) continue;

    await supabase.from('email_queue').insert({
      matric_number: student.matric_number,
      recipient_email: student.parent_email,
      email_type: 'birthday',
      status: 'pending',
      created_at: new Date().toISOString(),
      students: student.id
    });
    queued++;
  }

  res.status(200).json({ message: `Queued ${queued} birthday emails.` });
}
