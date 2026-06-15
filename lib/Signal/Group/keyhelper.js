import { randomInt, randomBytes } from crypto;
import { generateKeyPair } from libsignal/src/curve;
function generateSenderKey() {
    return randomBytes(32);
}
function generateSenderKeyId() {
    return randomInt(2147483647);
}
function generateSenderSigningKey(key) {
    if (!key) {
        key = generateKeyPair();
    }
    return { public: Buffer.from(key.pubKey), private: Buffer.from(key.privKey) };
}
export default {
    generateSenderKey: generateSenderKey,
    generateSenderKeyId: generateSenderKeyId,
    generateSenderSigningKey: generateSenderSigningKey,
};
