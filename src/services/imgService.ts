import { PNG } from 'pngjs';
import jsQR from 'jsqr';
import { ApiError } from '../utils/ApiError';
import fs from 'fs/promises';
export const imgService = {
    scanQR: async (filePath: string): Promise<string> => {
        try {
           console.log(filePath)
            const buffer = await fs.readFile(filePath);

            // Decode PNG
            const png = PNG.sync.read(buffer);
            const pixelData = new Uint8ClampedArray(png.data);

            // Quét QR code
            const qrCode = jsQR(pixelData, png.width, png.height);

            if (!qrCode) {
                throw new ApiError(404, 'No QR code found');
            }

            return qrCode.data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(500, `Failed to scan QR code`);
        }
    }
};
export default imgService