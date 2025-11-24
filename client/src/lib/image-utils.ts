/**
 * Image compression and utilities for Appwrite Storage
 */

/**
 * Compress an image file to reduce size
 */
export async function compressImage(file: File, maxSizeMB: number = 2, maxWidthOrHeight: number = 1920): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                // Calculate new dimensions while maintaining aspect ratio
                if (width > height) {
                    if (width > maxWidthOrHeight) {
                        height = (height * maxWidthOrHeight) / width;
                        width = maxWidthOrHeight;
                    }
                } else if (height > maxWidthOrHeight) {
                    width = (width * maxWidthOrHeight) / height;
                    height = maxWidthOrHeight;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Convert to blob with quality adjustment
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Canvas is empty'));
                            return;
                        }

                        // If still too large, reduce quality further
                        const targetSizeBytes = maxSizeMB * 1024 * 1024;
                        if (blob.size > targetSizeBytes) {
                            const quality = Math.max(0.1, (targetSizeBytes / blob.size) * 0.9);
                            canvas.toBlob(
                                (reducedBlob) => {
                                    if (!reducedBlob) {
                                        reject(new Error('Failed to compress image'));
                                        return;
                                    }
                                    const compressedFile = new File([reducedBlob], file.name, {
                                        type: 'image/jpeg',
                                        lastModified: Date.now(),
                                    });
                                    resolve(compressedFile);
                                },
                                'image/jpeg',
                                quality
                            );
                        } else {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        }
                    },
                    'image/jpeg',
                    0.9
                );
            };

            img.onerror = () => reject(new Error('Failed to load image'));
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
    });
}

/**
 * Validate image file type and size
 */
export function validateImageFile(file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (!validTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.',
        };
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        return {
            valid: false,
            error: `File size exceeds ${maxSizeMB}MB. Please upload a smaller image.`,
        };
    }

    return { valid: true };
}

/**
 * Create a preview URL for a File object
 */
export function createFilePreview(file: File): string {
    return URL.createObjectURL(file);
}

/**
 * Revoke a preview URL to free memory
 */
export function revokeFilePreview(url: string): void {
    URL.revokeObjectURL(url);
}

/**
 * Convert data URL to File object
 */
export function dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Generate a unique filename
 */
export function generateUniqueFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = getFileExtension(originalFilename);
    return `${timestamp}_${randomString}.${extension}`;
}
