import path from "path"

import multer from "multer"

const upload=multer({
    dest:"uploads/",
    limits:{ fileSize: 50*1024*1024 },  // max size 50mb
    storage:multer.diskStorage({
        destination:"uploads/",
        filename:(_req,file,cb)=>{
            cb(null,file.originalname)
        }
    }),
    fileFilter: (_req, file, cb) => {
        let ext = path.extname(file.originalname).toLowerCase()
        
        // Allow common video formats
        const allowedVideoFormats = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.mkv', '.webm']
        const allowedImageFormats = ['.jpg', '.jpeg', '.webp', '.png']
        
        if (allowedVideoFormats.includes(ext) || allowedImageFormats.includes(ext)) {
            cb(null, true)
        } else {
            cb(new Error(`Unsupported file type! ${ext}`), false)
        }
    }
})

export default upload