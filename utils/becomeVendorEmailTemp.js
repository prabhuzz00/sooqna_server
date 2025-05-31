const becomeVendorEmail = (ownerName, storeName, email) => {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Vendor Application Submitted</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Thank You for Your Application!</h2>
        <p style="font-size: 16px; color: #555;">
          Hello <strong>${ownerName}</strong>,
        </p>
        <p style="font-size: 16px; color: #555;">
          We’ve received your vendor application for your store <strong>${storeName}</strong>. Our team will review your details and get back to you shortly.
        </p>
        <p style="font-size: 16px; color: #555;">
          If any additional information is required, we will contact you at <strong>${email}</strong>.
        </p>
        <p style="font-size: 16px; color: #555;">
          Thank you for joining us!
        </p>
        <br />
        <p style="font-size: 16px; color: #555;">Best regards,</p>
        <p style="font-size: 16px; color: #333;"><strong>The Vendor Management Team</strong></p>
      </div>
    </body>
  </html>`;
};

export default becomeVendorEmail;