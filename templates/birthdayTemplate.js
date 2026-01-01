// birthdayTemplate.js
// Export a function that returns the HTML for the birthday email (simple, personal, minimal formatting)

export function getBirthdayHtml({ studentName }) {
  const name = studentName || "your child";
  return `
    <div style="font-family: 'Georgia', 'Times New Roman', serif; color: #222; font-size: 16px; padding: 0; margin: 0;">
      <p>Dear Parent,</p>
      <p>Happy Birthday to ${name}!</p>
      <p>
        Everyone at Sure Foundation Group of School wishes your child a wonderful day filled with joy and happiness.<br>
        May this new year bring growth, learning, and many cherished moments.
      </p>
      <p style="margin-top: 32px;">Warm regards,<br>SURE FOUNDATION GROUP OF SCHOOL</p>
    </div>
  `;
}
