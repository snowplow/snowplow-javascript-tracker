/**
 * Schema for the Parrable encrypted payload
 */
export interface EncryptedPayload {
  [key: string]: unknown;

  encryptedId: string;
  optout: 'true' | 'false';
}
