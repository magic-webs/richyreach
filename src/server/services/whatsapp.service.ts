export class WhatsAppService {
  static async sendOtp(env: Record<string, any>, phone: string, code: string) {
    const accountSid = env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID;
    const authToken = env.TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = env.TWILIO_WHATSAPP_FROM || process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

    // Format phone to ensure it has whatsapp: prefix
    const formattedPhone = phone.startsWith("whatsapp:") ? phone : `whatsapp:${phone}`;
    const formattedFrom = fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`;

    // Always log OTP to console in development
    console.log(`\n==================================================`);
    console.log(`[WHATSAPP OTP] Sending code [ ${code} ] to [ ${phone} ]`);
    console.log(`==================================================\n`);

    if (!accountSid || !authToken) {
      console.log("[WHATSAPP SERVICE] Twilio credentials missing in environment variables. Falling back to local console mock.");
      return { success: true, mocked: true, code };
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const credentials = btoa(`${accountSid}:${authToken}`);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: formattedFrom,
          To: formattedPhone,
          Body: `Your Reelio verification code is: ${code}. It expires in 10 minutes.`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Twilio error (${response.status}): ${errorText}`);
      }

      const resData = await response.json();
      return { success: true, messageSid: (resData as any).sid };
    } catch (error: any) {
      console.error("[WHATSAPP SERVICE] Failed to send WhatsApp message via Twilio:", error);
      return { success: false, error: error.message || error };
    }
  }
}
