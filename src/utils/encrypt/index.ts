import JSEncrypt from "jsencrypt";

/**
 * Encrypt
 * 使用 RSA 公钥对文本进行加密。
 *
 * @param text - 待加密文本，支持 string 或 number（内部会转为字符串）
 * @param publicKey - RSA 公钥字符串
 * @returns string | false - 加密成功返回密文字符串，失败时由 jsencrypt 返回 false
 */
export const Encrypt = (text: string | number, publicKey: string) => {
  const crypto = new JSEncrypt();
  crypto.setPublicKey(publicKey);
  return crypto.encrypt(text.toString());
};

/**
 * Decrypt
 * 使用 RSA 私钥对密文进行解密。
 *
 * @param text - 待解密的密文字符串
 * @param privateKey - RSA 私钥字符串
 * @returns string | false - 解密成功返回明文，失败时由 jsencrypt 返回 false
 */
export const Decrypt = (text: string, privateKey: string) => {
  const crypto = new JSEncrypt();
  crypto.setPrivateKey(privateKey);
  return crypto.decrypt(text);
};
