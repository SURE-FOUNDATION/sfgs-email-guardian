// birthdayTemplate.js
// Export a function that returns the HTML for the birthday email

export default function birthdayTemplate({ studentName }) {
  return `
    <div style="font-family: Arial, sans-serif; font-size: 16px; color: #222;">
      <p>Dear Parent/Guardian,</p>
      <p>
        We are delighted to celebrate your child's special day!<br>
        <strong>Wishing ${
          studentName || "your child"
        } a wonderful birthday and a fantastic year ahead.</strong>
      </p>
      <p>Best wishes,<br>SFGS Team</p>
    </div>
  `;
}
