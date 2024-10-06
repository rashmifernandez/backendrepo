const crypto = require("crypto");
const ENC_KEY = Buffer.from(
  "bf3c199c2470cb477d907b1e0917c17bbf3c199c2470cb477d907b1e0917c17b",
  "hex"
); // set random encryption key
const IV = Buffer.from("5183666c72eec9e45183666c72eec9e4", "hex"); // set random initialisation vector

const encrypt = (val) => {
  let cipher = crypto.createCipheriv("aes-256-cbc", ENC_KEY, IV);
  let encrypted = cipher.update(val, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
};

const decrypt = (encrypted) => {
  let decipher = crypto.createDecipheriv("aes-256-cbc", ENC_KEY, IV);
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  return decrypted + decipher.final("utf8");
};

// encrypted_key = encrypt(phrase);
// original_phrase = decrypt(encrypted_key);

module.exports = {
  encrypt,
  decrypt,
};
