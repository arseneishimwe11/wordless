/** A fresh id for a person or medicine (Web Crypto, in every browser and in Node). */
export const newId = (): string => globalThis.crypto.randomUUID();
