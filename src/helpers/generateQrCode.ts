
import QRCode from "qrcode"

export const generateQRCode = async (text:any) => {
  try {
    return await QRCode.toDataURL(text); // Returns base64 image
  } catch (err) {
    console.error(err);
    throw new Error("QR Code generation failed");
  }
};
