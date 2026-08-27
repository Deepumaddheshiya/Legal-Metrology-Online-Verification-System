/**
 * Utility for Offline Storage & Image Compression for Field Mode
 */

import { useMockStore } from "@/lib/mockStore";

export interface QueuedInspection {
  id: string;
  applicationId: string;
  applicationNumber: string;
  businessName: string;
  result: "pass" | "fail" | "conditional_pass";
  testObservations: any;
  remarks?: string;
  defectsFound?: string;
  verifierSealNumber?: string;
  photos: string[];
  gpsCoordinates?: string;
  timestamp: string;
}

const OFFLINE_KEY = "lmovs_offline_inspections";

/**
 * Compresses an image file client-side using HTML5 Canvas
 */
export function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Stores an inspection into local offline queue
 */
export function queueOfflineInspection(inspection: QueuedInspection): void {
  if (typeof window === "undefined") return;
  const current = getOfflineInspections();
  current.push(inspection);
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(current));
}

/**
 * Retrieves all pending offline inspections
 */
export function getOfflineInspections(): QueuedInspection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(OFFLINE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to read offline queue:", err);
    return [];
  }
}

/**
 * Clears offline queue
 */
export function clearOfflineInspections(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(OFFLINE_KEY);
}

/**
 * Synchronizes pending offline inspections directly to mockStore
 */
export async function syncOfflineInspections(): Promise<{
  synced: number;
  failed: number;
  results: Array<{ id: string; success: boolean; error?: string }>;
}> {
  const queue = getOfflineInspections();
  if (queue.length === 0) {
    return { synced: 0, failed: 0, results: [] };
  }

  let synced = 0;
  const results: Array<{ id: string; success: boolean; error?: string }> = [];

  const store = useMockStore.getState();

  for (const item of queue) {
    try {
      store.conductVerification({
        applicationId: item.applicationId,
        result: item.result,
        testObservations: item.testObservations,
        remarks: item.remarks || "",
        defectsFound: item.defectsFound || "",
        verifierSealNumber: item.verifierSealNumber || `SEAL-${Date.now().toString().slice(-4)}`,
        photos: item.photos,
        inspectorName: "Inspector S. K. Kulkarni (LMO Pune)",
        inspectorDesignation: "Legal Metrology Officer",
      });
      synced++;
      results.push({ id: item.id, success: true });
    } catch (err: any) {
      results.push({ id: item.id, success: false, error: err.message });
    }
  }

  clearOfflineInspections();
  return { synced, failed: 0, results };
}
