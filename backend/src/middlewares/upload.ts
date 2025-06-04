import multer from 'multer';

const storage = multer.memoryStorage(); // Files are stored in memory as Buffer
export const upload = multer({ storage });