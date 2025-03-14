import {
  HexBase64BinaryEncoding,
  Utf8AsciiBinaryEncoding,
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'crypto';
import buildDebug from 'debug';

import { TOKEN_VALID_LENGTH } from '@verdaccio/config';

const debug = buildDebug('verdaccio:auth:token:legacy');

export const defaultAlgorithm = process.env.VERDACCIO_LEGACY_ALGORITHM || 'aes-256-ctr';
const inputEncoding: Utf8AsciiBinaryEncoding = 'utf8';
const outputEncoding: HexBase64BinaryEncoding = 'hex';
// For AES, this is always 16
const IV_LENGTH = 16;
// Must be 256 bits (32 characters)
// https://stackoverflow.com/questions/50963160/invalid-key-length-in-crypto-createcipheriv#50963356
const VERDACCIO_LEGACY_ENCRYPTION_KEY = process.env.VERDACCIO_LEGACY_ENCRYPTION_KEY;

export function aesEncrypt(value: string, key: string): string | void {
  // https://nodejs.org/api/crypto.html#crypto_crypto_createcipher_algorithm_password_options
  // https://www.grainger.xyz/changing-from-cipher-to-cipheriv/
  debug('encrypt %o', value);
  debug('algorithm %o', defaultAlgorithm);
  const iv = Buffer.from(randomBytes(IV_LENGTH));
  const secretKey = VERDACCIO_LEGACY_ENCRYPTION_KEY || key;
  const isKeyValid = secretKey?.length === TOKEN_VALID_LENGTH;
  debug('length secret key %o', secretKey?.length);
  debug('is valid secret %o', isKeyValid);
  if (!value || !secretKey || !isKeyValid) {
    return;
  }

  const cipher = createCipheriv(defaultAlgorithm, secretKey, iv);
  let encrypted = cipher.update(value, inputEncoding, outputEncoding);
  // @ts-ignore
  encrypted += cipher.final(outputEncoding);
  const token = `${iv.toString('hex')}:${encrypted.toString()}`;
  debug('token generated successfully');
  return Buffer.from(token).toString('base64');
}

export function aesDecrypt(value: string, key: string): string | void {
  try {
    const buff = Buffer.from(value, 'base64');
    const textParts = buff.toString().split(':');

    // extract the IV from the first half of the value
    // @ts-ignore
    const IV = Buffer.from(textParts.shift(), outputEncoding);
    // extract the encrypted text without the IV
    const encryptedText = Buffer.from(textParts.join(':'), outputEncoding);
    const secretKey = VERDACCIO_LEGACY_ENCRYPTION_KEY || key;
    // decipher the string
    const decipher = createDecipheriv(defaultAlgorithm, secretKey, IV);
    let decrypted = decipher.update(encryptedText, outputEncoding, inputEncoding);
    decrypted += decipher.final(inputEncoding);
    debug('token decrypted successfully');
    return decrypted.toString();
  } catch (_: any) {
    return;
  }
}
