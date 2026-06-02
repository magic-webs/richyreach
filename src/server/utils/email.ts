import { Resend } from "resend";

export interface SendOtpEmailParams {
  to: string;
  code: string;
  apiKey: string;
  fromEmail: string;
}

export async function sendOtpEmail({ to, code, apiKey, fromEmail }: SendOtpEmailParams) {
  const resend = new Resend(apiKey);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verification Code</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 0; margin: 0; color: #334155;">
  <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #3F030B 0%, #7E1523 100%); padding: 32px 24px; text-align: center;">
      <div style="display: inline-block; background-color: rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 18px; margin-bottom: 12px; font-weight: bold; font-size: 24px; color: #ffffff; letter-spacing: 1px;">
        RR
      </div>
      <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">Richy Reach</h1>
    </div>

    <!-- Body -->
    <div style="padding: 40px 32px;">
      <h2 style="margin-top: 0; color: #0f172a; font-size: 20px; font-weight: 700;">Account Verification</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 28px;">
        Hello,<br><br>
        To complete your login or registration process, please use the 6-digit verification code below. 
      </p>
      
      <!-- OTP Box -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
        <span style="font-size: 42px; font-weight: 800; letter-spacing: 8px; color: #7E1523; font-family: monospace;">${code}</span>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 0;">
        This code will expire in <strong>10 minutes</strong>. If you didn't request this code, you can safely ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #f1f5f9; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} Richy Reach. All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>
  `;

  return await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: "Verify your Richy Reach Account",
    html,
  });
}
