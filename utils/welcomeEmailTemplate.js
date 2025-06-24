export default function WelcomeEmail(name) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #333">Hi ${name},</h2>
      <p style="font-size: 16px; color: #555;">
        Thank you for registering with <strong>Soouqna App</strong>. <br />
        Welcome to <strong>Soouqna Shopping</strong>! 🎉<br />
        Checkout all our latest products.
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
        ">Visit Soouqna</a>
      </div>
      <p style="font-size: 14px; color: #888; margin-top: 40px;">
        If you did not sign up for this account, you can safely ignore this email.
      </p>
      <p style="font-size: 14px; color: #aaa;">- The Soouqna Team</p>
    </div>
  `;
}
