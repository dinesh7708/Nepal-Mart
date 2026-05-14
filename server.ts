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

// In-memory OTP storage
const otpStore = new Map<string, { code: string; expires: number }>();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Twilio Client
  const getTwilioClient = () => {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) {
      throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required. Set these in the Settings menu.");
    }
    return twilio(sid, token);
  };

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // eSewa: Generate Signature (v2)
  app.post("/api/esewa/generate-signature", (req, res) => {
    const { amount, transaction_uuid, product_code } = req.body;
    const secretKey = process.env.ESEWA_SECRET_KEY || "8g8t8h8m6qnd9p"; // Default to test key if missing

    try {
      // eSewa v2 signature string format: total_amount,transaction_uuid,product_code
      const signatureString = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
      const hmac = crypto.createHmac("sha256", secretKey);
      hmac.update(signatureString);
      const signature = hmac.digest("base64");

      res.json({ signature });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Send OTP
  app.post("/api/send-otp", async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number required" });

    try {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const expires = Date.now() + 5 * 60 * 1000; // 5 mins
      otpStore.set(phone, { code, expires });

      const sid = process.env.TWILIO_ACCOUNT_SID;
      const token = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_PHONE_NUMBER;

      if (!sid || !token || !from) {
        console.log(`[DEMO MODE] Skip Twilio: Missing keys. Manual OTP: ${code}`);
        return res.json({ 
          success: true, 
          isDemo: true, 
          message: `[DEMO MODE] Use code: ${code}`,
          demoCode: code 
        });
      }

      const client = twilio(sid, token);
      await client.messages.create({
        body: `Your Nepal Mart verification code is: ${code}. It expires in 5 minutes.`,
        from: from,
        to: phone,
      });

      console.log(`OTP sent to ${phone}: ${code}`);
      res.json({ success: true, message: "OTP sent successfully" });
    } catch (error: any) {
      console.error("SMS Request Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Verify OTP and Login
  app.post("/api/verify-otp", async (req, res) => {
    const { phone, code } = req.body;
    const stored = otpStore.get(phone);

    if (!stored) return res.status(400).json({ error: "OTP not requested or expired" });
    if (Date.now() > stored.expires) {
      otpStore.delete(phone);
      return res.status(400).json({ error: "OTP expired" });
    }

    if (stored.code === code) {
      otpStore.delete(phone);
      
      try {
        const uid = `phone-${phone.replace(/\D/g, "")}`;
        // Only try to sign if we likely have permissions (not in a restricted dev env)
        // Custom token generation requires iam.serviceAccounts.signBlob permission
        const customToken = await admin.auth().createCustomToken(uid);
        res.json({ success: true, token: customToken });
      } catch (e: any) {
        if (e.code === 'auth/insufficient-permission' || e.message?.includes('perm')) {
          console.log("[DEMO MODE] Skip Custom Token: IAM permission missing. Use mock login.");
          return res.json({ success: true, mockLogin: true, uid: `phone-${phone}` });
        }
        console.log("[DEMO MODE] Custom Token Error (skipping):", e.message);
        res.json({ success: true, mockLogin: true, uid: `phone-${phone}` });
      }
    } else {
      res.status(400).json({ error: "Invalid OTP code" });
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
