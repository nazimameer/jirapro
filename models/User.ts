import mongoose from "mongoose";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "v-7x!A%C*F-JaNdRgUkXp2s5v8y/B?E("; // Must be 32 chars
const IV_LENGTH = 16;

function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text: string) {
  try {
    // Better migration check: hex:hex format
    if (!text.includes(":") || text.split(":").length !== 2) return text;
    
    const [ivHex, encryptedHex] = text.split(":");
    if (ivHex.length !== 32) return text; // IV for AES-256-CBC must be 16 bytes (32 hex chars)

    const iv = Buffer.from(ivHex, "hex");
    const encryptedText = Buffer.from(encryptedHex, "hex");
    
    const key = Buffer.from(ENCRYPTION_KEY).slice(0, 32); // Ensure exactly 32 bytes
    const decipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    const result = decrypted.toString("utf8").trim();
    
    // Final safety: remove ANY non-printable or control characters
    // Only allow standard ASCII printable characters (32-126)
    return result.replace(/[^\x20-\x7E]/g, "");
  } catch (e) {
    console.error("Decryption failed:", e);
    return text;
  }
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  accountId: { type: String, required: true, unique: true },
  accessToken: { 
    type: String, 
    required: true,
    set: (v: string) => encrypt(v),
    get: (v: string) => decrypt(v)
  },
  refreshToken: { 
    type: String, 
    required: true,
    set: (v: string) => encrypt(v),
    get: (v: string) => decrypt(v)
  },
  cloudId: { type: String, default: null },
  lastBoardId: { type: String, default: null },
  refresh_token: { type: String, default: null }, // alias or alternative form requested by user
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

userSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.User || mongoose.model("User", userSchema);
