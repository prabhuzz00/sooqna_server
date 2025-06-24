import http from "http";
import nodemailer from "nodemailer";

// Configure the SMTP transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // e.g., 'smtp.gmail.com' for Gmail
  port: 587, // or 465 for secure
  auth: {
    user: process.env.EMAIL, // your SMTP username
    pass: process.env.EMAIL_PASS, // your SMTP password
  },
});

// Function to send email
async function sendEmail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
}

export { sendEmail };

// import nodemailer from "nodemailer";

// const useOAuth2 = !!process.env.EMAIL_REFRESH_TOKEN;

// const transporter = nodemailer.createTransport({
//   host: "smtp.office365.com",
//   port: 587,
//   secure: false, // STARTTLS on :587
//   tls: { requireTLS: true },
//   auth: useOAuth2
//     ? {
//         type: "OAuth2",
//         user: process.env.EMAIL,
//         clientId: process.env.EMAIL_CLIENT_ID,
//         clientSecret: process.env.EMAIL_CLIENT_SECRET,
//         refreshToken: process.env.EMAIL_REFRESH_TOKEN,
//         tenantId: process.env.EMAIL_TENANT_ID, // optional
//       }
//     : {
//         user: process.env.EMAIL,
//         pass: process.env.EMAIL_PASS,
//       },
// });

// await transporter.verify();
// console.log(
//   `✉️  SMTP ready (${useOAuth2 ? "OAuth2" : "password/App-password"} mode)`
// );

// export async function sendEmail({ to, subject, text = "", html = "" }) {
//   try {
//     const info = await transporter.sendMail({
//       from: `"Soouqna" <${process.env.EMAIL}>`,
//       to,
//       subject,
//       text,
//       html,
//     });
//     return { success: true, messageId: info.messageId };
//   } catch (err) {
//     console.error("Email send error:", err);
//     return { success: false, error: err.message };
//   }
// }
