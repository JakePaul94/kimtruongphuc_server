import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const getMulterUploader = (folderName: string) => {
  const fullPath = path.join(__dirname, '..', 'uploads', folderName);

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, file, cb) => {
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    },
  });

  return multer({ storage });
};
