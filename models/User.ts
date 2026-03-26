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
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift()!, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    return text; // Fallback for unencrypted tokens (migration)
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
