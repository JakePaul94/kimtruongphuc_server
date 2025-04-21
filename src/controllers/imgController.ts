import { Request, Response, NextFunction } from "express";
import imgService from "../services/imgService";
import { ApiError } from "../utils/ApiError";
import path from "path";

const imgController = {
    scanQR: async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log("req.body", req.body);
            const { imageUrl } = req.body;

            if (!imageUrl) {
                console.log(' kh ông thâ')
                throw new ApiError(400, "Image URL is required.");

            }
            console.log("img", imageUrl)

            const publicPathPrefix = "/static/images/";
            if (!imageUrl.includes(publicPathPrefix)) {
                throw new ApiError(400, "Invalid image URL format.");
            }

            const filename = imageUrl.split(publicPathPrefix)[1];
            const filePath = path.join(__dirname, "..","..", "uploads", "images", filename);

            const qrCode = await imgService.scanQR(filePath);

            if (qrCode) {
                res.json({ data: qrCode });
            } else {
                res.status(404).json({ error: 'No QR code found' });
            }
        } catch (error) {
            console.error('Error reading QR code:', error);
            res.status(500).json({ error: 'Failed to process image' });
        }
    }
}

export default imgController