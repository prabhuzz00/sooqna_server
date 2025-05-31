const vendorStatusEmail = (ownerName, storeName, isActive) => {
  const statusText = isActive ? "Activated" : "Deactivated";
  const statusColor = isActive ? "#28a745" : "#dc3545";
  const actionMessage = isActive
    ? "You now have full access to your vendor dashboard. Start listing your products and managing your store."
    : "Your vendor account has been temporarily disabled. You will not be able to access your dashboard until it's reactivated.";
  const button = isActive
    ? `<a href="https://yourdomain.com/login" style="display:inline-block;padding:12px 20px;background-color:#28a745;color:#fff;text-decoration:none;border-radius:5px;">Access Dashboard</a>`
    : "";

  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Vendor Account ${statusText}</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 600px; background-color: #ffffff; margin: auto; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
        <h2 style="color: ${statusColor};">Vendor Account ${statusText}</h2>
        <p style="font-size: 16px; color: #333;">
          Hello <strong>${ownerName}</strong>,
        </p>
        <p style="font-size: 16px; color: #555;">
          We would like to inform you that your vendor account for <strong>${storeName}</strong> has been <strong>${statusText.toLowerCase()}</strong>.
        </p>
        <p style="font-size: 16px; color: #555;">${actionMessage}</p>
        <br />
        ${button}
        <br /><br />
        <p style="font-size: 16px; color: #555;">
          If you have any questions or need support, please feel free to contact us.
        </p>
        <p style="font-size: 16px; color: #555;">Best regards,</p>
        <p style="font-size: 16px; color: #333;"><strong>The Vendor Management Team</strong></p>
      </div>
    </body>
  </html>`;
};

export default vendorStatusEmail;