import QRCode from "qrcode";
import type { Certificate } from "../types";

export async function generateQRCodeDataUrl(text: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 250,
      color: {
        dark: "#1E3A8A", // LMOVS Primary Navy Blue
        light: "#FFFFFF",
      },
    });
    return dataUrl;
  } catch (err) {
    console.error("Failed to generate QR code", err);
    return "";
  }
}

export async function generateCertificateQrDataUrl(
  certificateOrNumber: Certificate | string,
  token?: string
): Promise<string> {
  let certNumber = "";
  let verificationToken = "";

  if (typeof certificateOrNumber === "string") {
    certNumber = certificateOrNumber;
    verificationToken = token || "";
  } else {
    certNumber = certificateOrNumber.certificateNumber;
    verificationToken = certificateOrNumber.verificationToken;
  }

  const baseUrl = process.env.NEXT_PUBLIC_QR_VERIFICATION_URL || "https://lmovs.gov.in/verify";
  const verifyUrl = `${baseUrl}/${certNumber}?token=${verificationToken}`;
  return generateQRCodeDataUrl(verifyUrl);
}

