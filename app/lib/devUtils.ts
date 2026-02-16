// JSON formatting and validation
export function formatJSON(jsonString: string, indent: number = 2): string {
  const parsed = JSON.parse(jsonString);
  return JSON.stringify(parsed, null, indent);
}

export function minifyJSON(jsonString: string): string {
  const parsed = JSON.parse(jsonString);
  return JSON.stringify(parsed);
}

export function validateJSON(jsonString: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(jsonString);
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : "Invalid JSON" 
    };
  }
}

// Base64 encoding/decoding
export function encodeBase64(text: string): string {
  try {
    return btoa(text);
  } catch (error) {
    // Handle Unicode characters
    return btoa(encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
  }
}

export function decodeBase64(base64String: string): string {
  try {
    return atob(base64String);
  } catch (error) {
    // Handle Unicode characters
    return decodeURIComponent(
      atob(base64String)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  }
}

// UUID generation (v4)
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Generate multiple UUIDs
export function generateUUIDs(count: number): string[] {
  return Array.from({ length: count }, () => generateUUID());
}

// Validate UUID format
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
