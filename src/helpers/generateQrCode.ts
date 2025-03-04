
import QRCode from "qrcode"

export const generateQRCode = async (data:any) => {
  try {
    const jsonString = JSON.stringify(data); // Convert object to JSON string
    return await QRCode.toDataURL(jsonString); //
   
  } catch (err) {
    console.error(err);
    throw new Error("QR Code generation failed");
  }
};
