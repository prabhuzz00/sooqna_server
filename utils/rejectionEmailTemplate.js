export default function RejectionEmail(name, reason) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #e53935">Hi ${name},</h2>
      <p style="font-size: 16px; color: #555;">
        We regret to inform you that your recently submitted product has been <strong style="color: #e53935;">rejected</strong> during our verification process.
      </p>
      <p style="font-size: 16px; color: #555;">
        <strong>Reason for rejection:</strong><br />
        <em style="color: #e53935;">"${reason}"</em>
      </p>
      <p style="font-size: 16px; color: #555;">
        Please review the reason above and make necessary changes before resubmitting the product for approval.
      </p>
      <div style="margin-top: 30px; text-align: center;">
        <a href="https://www.soouqna.com" target="_blank" style="
          padding: 12px 25px;
          background-color: #f97316;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          font-size: 16px;
          display: inline-block;
        ">Go to Dashboard</a>
      </div>
      <p style="font-size: 14px; color: #888; margin-top: 40px;">
        If you believe this was a mistake or have any questions, please contact our support team.
      </p>
      <p style="font-size: 14px; color: #aaa;">- The Soouqna Team</p>
    </div>
  `;
}
