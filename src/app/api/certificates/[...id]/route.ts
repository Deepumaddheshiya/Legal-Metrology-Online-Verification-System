import { NextResponse } from "next/server";
import { MOCK_CERTIFICATES } from "@/lib/mockData";
import { Certificate } from "@/types";

const globalStore = global as unknown as { __CERT_STORE__?: Map<string, Certificate> };
if (!globalStore.__CERT_STORE__) {
  globalStore.__CERT_STORE__ = new Map<string, Certificate>();
  for (const c of MOCK_CERTIFICATES) {
    globalStore.__CERT_STORE__.set(c.certificateNumber.toLowerCase(), c);
    globalStore.__CERT_STORE__.set(c.certificateNumber.replace(/\//g, "-").toLowerCase(), c);
    if (c.verificationToken) {
      globalStore.__CERT_STORE__.set(c.verificationToken.toLowerCase(), c);
    }
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string[] } }
) {
  const raw = Array.isArray(params.id) ? params.id.join("/") : params.id;
  const clean = decodeURIComponent(raw || "").toLowerCase();
  const withSlashes = clean.replace(/-/g, "/");

  const cert =
    globalStore.__CERT_STORE__?.get(clean) ||
    globalStore.__CERT_STORE__?.get(withSlashes) ||
    MOCK_CERTIFICATES.find(
      (c) =>
        c.certificateNumber.toLowerCase() === clean ||
        c.certificateNumber.toLowerCase() === withSlashes ||
        c.certificateNumber.replace(/\//g, "-").toLowerCase() === clean ||
        (c.verificationToken && c.verificationToken.toLowerCase() === clean)
    );

  if (cert) {
    return NextResponse.json(cert);
  }

  return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
}

export async function POST(request: Request) {
  try {
    const cert: Certificate = await request.json();
    if (cert && cert.certificateNumber) {
      globalStore.__CERT_STORE__?.set(cert.certificateNumber.toLowerCase(), cert);
      globalStore.__CERT_STORE__?.set(cert.certificateNumber.replace(/\//g, "-").toLowerCase(), cert);
      if (cert.verificationToken) {
        globalStore.__CERT_STORE__?.set(cert.verificationToken.toLowerCase(), cert);
      }
      return NextResponse.json({ success: true });
    }
  } catch {}
  return NextResponse.json({ error: "Invalid data" }, { status: 400 });
}
