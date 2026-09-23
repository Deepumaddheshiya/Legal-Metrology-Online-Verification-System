import { NextResponse } from "next/server";
import os from "os";

export async function GET() {
  const nets = os.networkInterfaces();
  let localIp = "localhost";

  // Find active non-internal IPv4 address (Wi-Fi or LAN)
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (
        net.family === "IPv4" &&
        !net.internal &&
        !net.address.startsWith("169.254")
      ) {
        localIp = net.address;
        break;
      }
    }
    if (localIp !== "localhost") break;
  }

  return NextResponse.json({ ip: localIp });
}
