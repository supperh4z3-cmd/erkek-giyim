import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "lib", "data");

/**
 * JSON dosyasını oku. Dosya yoksa defaultValue döndür.
 */
export function readJSON<T>(filename: string, defaultValue: T): T {
    const filePath = path.join(DATA_DIR, filename);
    try {
        const raw = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(raw) as T;
    } catch {
        // Dosya yoksa veya parse hatası varsa default döndür
        return defaultValue;
    }
}

/**
 * JSON dosyasına yaz. Klasör yoksa oluştur.
 */
export function writeJSON<T>(filename: string, data: T): void {
    const filePath = path.join(DATA_DIR, filename);
    // Klasör yoksa oluştur
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * JSON dosyasını oku ve belirli bir alanı güncelle.
 */
export function updateJSON<T>(filename: string, updater: (current: T) => T, defaultValue: T): T {
    const current = readJSON<T>(filename, defaultValue);
    const updated = updater(current);
    writeJSON(filename, updated);
    return updated;
}
