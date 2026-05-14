import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import twilio from "twilio";
import dotenv from "dotenv";
import admin from "firebase-admin";
import crypto from "crypto";

dotenv.config();

// Initialize Firebase Admin
try {
  admin.initializeApp();
} catch (e) {
  console.error("Firebase Admin Init Error:", e);
}

// Helper: Normalize Phone to E.164 (Strict)
const normalizePhone = (phone: string) => {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, "");
  
  // Handle 00 prefix (common alternate for +)
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.substring(2);
  }

  // If it's a standard Nepal 10-digit number starting with 9
  if (cleaned.length === 10 && cleaned.startsWith("9")) {
    return `+977${cleaned}`;
  }
  
  // If it already has 977 but no plus (common in Nepal)
  if (cleaned.length === 13 && cleaned.startsWith("977")) {
    return `+${cleaned}`;
  }

  // Otherwise, ensure it has a plus and no leading zeros
  return `+${cleaned.replace(/^0+/, "")}`;
};

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Twilio Client
  const getTwilioClient = () => {
    const sid = process.env.TWILIO_ACCOUNT_SID?.trim().replace(/^["']|["']$/g, "");
    const token = process.env.TWILIO_AUTH_TOKEN?.trim().replace(/^["']|["']$/g, "");
    if (!sid || !token) {
      throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required. Set these in the Settings menu.");
    }
    return twilio(sid, token);
  };

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Route: Send OTP
  app.post("/api/send-otp", async (req, res) => {
    const { phone: rawPhone } = req.body;
    if (!rawPhone) return res.status(400).json({ error: "Phone number required" });
    const phone = normalizePhone(rawPhone);

    try {
      const sid = process.env.TWILIO_ACCOUNT_SID?.trim().replace(/^["']|["']$/g, "");
      const token = process.env.TWILIO_AUTH_TOKEN?.trim().replace(/^["']|["']$/g, "");
      const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim().replace(/^["']|["']$/g, "");

      if (!sid || !token || !verifySid) {
        console.log("[Twilio Config] Missing values:", { 
          hasSid: !!sid, 
          hasToken: !!token, 
          hasVerifySid: !!verifySid,
          verifySidPrefix: verifySid ? verifySid.slice(0, 2) : 'none'
        });
        return res.status(400).json({ 
          error: "Twilio SMS Verification is incomplete. Please ensure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID are correctly set in the Secrets menu.",
          details: "Production OTP mode is enabled. Ensure your Verify Service SID is correct."
        });
      }

      console.log(`[Twilio] Attempting to send Verify OTP to: "${phone}" using Service SID: "${verifySid}"`);
      const client = twilio(sid, token);
      
      const verification = await client.verify.v2.services(verifySid)
        .verifications
        .create({ to: phone, channel: 'sms' });

      console.log(`[Twilio] Verify OTP request successful. SID: ${verification.sid}`);
      res.json({ success: true, message: "OTP sent successfully" });
    } catch (error: any) {
      console.error("Twilio Verify Send Error:", {
        message: error.message,
        code: error.code,
        status: error.status,
        moreInfo: error.moreInfo,
        phone: phone,
        serviceSid: process.env.TWILIO_VERIFY_SERVICE_SID?.trim().slice(0, 5) + "..."
      });

      let errorMessage = error.message;
      let details = error.code ? `Twilio Error Code: ${error.code}` : undefined;

      // Handle Trial Account restriction
      if (error.code === 21608) {
        errorMessage = "Twilio Trial Account Restriction: The destination number is not verified.";
        details = "In Twilio Trial mode, you can only send SMS to numbers you have verified in the Twilio Console under 'Verified Caller IDs'. To send to any number, upgrade your Twilio account.";
      }

      res.status(error.status || 500).json({ 
        error: errorMessage,
        details: details
      });
    }
  });

  // API Route: Verify OTP and Login
  app.post("/api/verify-otp", async (req, res) => {
    const { phone: rawPhone, code } = req.body;
    if (!rawPhone || !code) return res.status(400).json({ error: "Phone and code required" });
    const phone = normalizePhone(rawPhone);
    
    try {
      const sid = process.env.TWILIO_ACCOUNT_SID?.trim().replace(/^["']|["']$/g, "");
      const token = process.env.TWILIO_AUTH_TOKEN?.trim().replace(/^["']|["']$/g, "");
      const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim().replace(/^["']|["']$/g, "");

      if (!sid || !token || !verifySid) {
        return res.status(400).json({ error: "Twilio Verification Service is not fully configured." });
      }

      // Real Twilio Verify
      console.log(`[Twilio] Verifying code for ${phone} using Service: ${verifySid}`);
      const client = twilio(sid, token);
      const verification = await client.verify.v2.services(verifySid)
        .verificationChecks
        .create({ to: phone, code: code });
      
      console.log(`[Twilio] Verification status: ${verification.status}`);
      if (verification.status !== 'approved') {
        return res.status(400).json({ error: "Invalid OTP code or expired session" });
      }
      
      // If we got here, verification passed
      const uid = `phone-${phone.replace(/\D/g, "")}`;
      try {
        const customToken = await admin.auth().createCustomToken(uid);
        res.json({ success: true, token: customToken });
      } catch (e: any) {
        console.log("[VERIFY] Custom Token Fallback:", e.message);
        res.json({ success: true, mockLogin: true, uid: `phone-${phone}` });
      }
    } catch (error: any) {
      console.error("Twilio Verify Check Error:", error.message);
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
