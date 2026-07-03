import JSEncrypt from "jsencrypt";

/**
 * 加密
 * @param text 待加密文本
 * @param publicKey 公钥
 */
export const Encrypt = (text: string | number, publicKey: string) => {
  const crypto = new JSEncrypt();
  crypto.setPublicKey(publicKey);
  return crypto.encrypt(text.toString());
};

/**
 * 解密
 * @param text 待解密文本
 * @param privateKey 私钥
 */
export const Decrypt = (text: string, privateKey: string) => {
  const crypto = new JSEncrypt();
  crypto.setPrivateKey(privateKey);
  return crypto.decrypt(text);
};
