import multer from 'multer';
import AppError from '../utils/AppError.js';

export const handleUpload = uploadMiddleware => {
    return (req, res, next) => {
        uploadMiddleware.single('image')(req, res, error => {
            if (error) {
                // Drain any unconsumed request body so the
                // connection can be cleanly released
                req.resume();

                if (error instanceof multer.MulterError) {
                    if (error.code === 'LIMIT_FILE_SIZE') {
                        return next(
                            new AppError(
                                'Image must be smaller than 5 MB',
                                400,
                                'FILE_TOO_LARGE'
                            )
                        );
                    }

                    return next(
                        new AppError(
                            error.message,
                            400,
                            'UPLOAD_ERROR'
                        )
                    );
                }

                return next(
                    new AppError(
                        error.message,
                        400,
                        'INVALID_FILE'
                    )
                );
            }

            next();
        });
    };
};