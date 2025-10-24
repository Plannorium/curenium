import { Resend } from "resend";

// Read key from env so it's not hardcoded. If missing, we log and skip sending in dev.
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

const isPlaceholderKey = (key: string) => {
  return key === "" || key === "REPLACE_WITH_YOUR_RESEND_API_KEY";
}

console.log("RESEND_API_KEY loaded:", RESEND_API_KEY);

const resend = RESEND_API_KEY && !isPlaceholderKey(RESEND_API_KEY) ? new Resend(RESEND_API_KEY) : null;

export const sendConfirmationEmail = async (email: string, name: string, confirmationLink: string) => {
  if (!resend || isPlaceholderKey(RESEND_API_KEY)) {
    // Running locally or key not configured — don't throw, just log and continue.
    console.warn("RESEND_API_KEY is not set or is a placeholder. Skipping welcome email.");
    return { ok: false, message: "email_skipped" };
  }
  try {
    await resend.emails.send({
      from: "Plannorium <noreply@plannorium.com>",
      to: email,
      subject: "Confirm your email address",
      html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Email Confirmation</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style type="text/css">
        @media screen {
            @font-face {
                font-family: 'Source Sans Pro';
                font-style: normal;
                font-weight: 400;
                src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
            }
            @font-face {
                font-family: 'Source Sans Pro';
                font-style: normal;
                font-weight: 700;
                src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
            }
        }
        body, table, td, a { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
        table, td { mso-table-rspace: 0pt; mso-table-lspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }
        a[x-apple-data-detectors] { font-family: inherit !important; font-size: inherit !important; font-weight: inherit !important; line-height: inherit !important; color: inherit !important; text-decoration: none !important; }
        div[style*="margin: 16px 0;"] { margin: 0 !important; }
        body { width: 100% !important; height: 100% !important; padding: 0 !important; margin: 0 !important; }
        table { border-collapse: collapse !important; }
        a { color: #1a82e2; }
        img { height: auto; line-height: 100%; text-decoration: none; border: 0; outline: none; }
    </style>
</head>
<body style="background-color: #e9ecef;">
    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; max-height: 0; max-width: 0; opacity: 0; overflow: hidden;">
        Confirm your email to get started with Curenium.
    </div>
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr><td align="center" bgcolor="#e9ecef" style="padding: 24px;"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
            <tr><td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;"><h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Confirm Your Email Address</h1></td></tr>
            <tr><td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;"><p style="margin: 0;">Hi ${name},<br><br>Thanks for signing up for Curenium. Please click the link below to confirm your email address. This link will expire in 1 hour.</p></td></tr>
            <tr><td align="center" bgcolor="#ffffff" style="padding: 12px 24px;"><a href="${confirmationLink}" style="font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: bold; color: #ffffff; background-color: #1a82e2; text-decoration: none; padding: 15px 25px; border-radius: 5px; display: inline-block;">Confirm Email</a></td></tr>
            <tr><td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf"><p style="margin: 0;">Cheers,<br> The Curenium Team</p></td></tr>
        </table></td></tr>
        <tr><td align="center" bgcolor="#e9ecef" style="padding: 24px;"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
            <tr><td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;"><p style="margin: 0;">You received this email because we received a registration request for your email address. If you didn't request this, you can safely delete this email.</p></td></tr>
        </table></td></tr>
    </table>
</body>
</html>`,
    });
    return { ok: true };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { ok: false, message: "send_failed", error };
  }
};

export const sendWelcomeEmail = async (email: string, fullName: string, organization: string) => {
  if (!resend || isPlaceholderKey(RESEND_API_KEY)) {
    // Running locally or key not configured — don't throw, just log and continue.
    console.warn("RESEND_API_KEY is not set or is a placeholder. Skipping welcome email.");
    return { ok: false, message: "email_skipped" };
  }
  try {
    await resend.emails.send({
      from: "Plannorium <noreply@plannorium.com>",
      to: email,
      subject: "Welcome to Curenium",
      html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Welcome, ${fullName}!</h2>
        <p>Your organization <b>${organization.toUpperCase()}</b> has been successfully created.</p>
        <p>Start managing your team and workflows inside <b>Curenium</b>.</p>
        </div>
      `,
    });
    return { ok: true };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { ok: false, message: "send_failed", error };
  }
};

export const sendAddedToOrgEmail = async (email: string, fullName: string, organization: string) => {
  if (!resend || isPlaceholderKey(RESEND_API_KEY)) {
    console.warn("RESEND_API_KEY is not set or is a placeholder. Skipping added to org email.");
    return { ok: false, message: "email_skipped" };
  }
  try {
    await resend.emails.send({
      from: "Plannorium <noreply@plannorium.com>",
      to: email,
      subject: `You've been added to a new organization on Curenium`,
      html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Hi ${fullName},</h2>
        <p>You have been added to the organization <b>${organization.toUpperCase()}</b> on Curenium.</p>
        <p>You can now access the new organization's dashboard.</p>
        </div>
      `,
    });
    return { ok: true };
  } catch (error) {
    console.error("Error sending added to org email:", error);
    return { ok: false, message: "send_failed", error };
  }
};

export const sendTeamInvitationEmail = async (email: string, inviter: string, org: string, invitationCode: string) => {
  if (!resend || isPlaceholderKey(RESEND_API_KEY)) {
    console.warn("RESEND_API_KEY is not set or is a placeholder. Skipping invite email.");
    return { ok: false, message: "email_skipped" };
  }

  const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup?inviteCode=${invitationCode}`;

  try {
    await resend.emails.send({
      from: "Plannorium <noreply@plannorium.com>",
      to: email,
      subject: `You're invited to join ${org.toUpperCase()} on Curenium`,
      html: `
      <div style="font-family: Arial, sans-serif; color: #333; text-align: center;">
        <h2>You're Invited!</h2>
        <p>${inviter} has invited you to join the organization <b>${org.toUpperCase()}</b> on Curenium.</p>
        <p>Click the button below to accept the invitation and get started:</p>
        <a href="${invitationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Accept Invitation</a>
        <p style="margin-top: 20px;">If you prefer, you can also use the code below on the signup page:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${invitationCode}</p>
        </div>
      `,
    });
    return { ok: true };
  } catch (error) {
    console.error("Error sending invite email:", error);
    return { ok: false, message: "send_failed", error };
  }
};