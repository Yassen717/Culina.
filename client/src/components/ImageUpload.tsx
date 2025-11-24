import { useState, useCallback, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { validateImageFile, compressImage, createFilePreview, revokeFilePreview } from '@/lib/image-utils';
import { storageService } from '@/lib/appwrite-services';
import { toast } from 'sonner';

interface ImageUploadProps {
    onUploadComplete: (fileId: string, fileUrl: string) => void;
    onRemove?: () => void;
    currentImageUrl?: string;
    maxSizeMB?: number;
    compress?: boolean;
    className?: string;
    aspectRatio?: 'square' | 'video' | 'free';
}

export function ImageUpload({
    onUploadComplete,
    onRemove,
    currentImageUrl,
    maxSizeMB = 10,
    compress = true,
    className,
    aspectRatio = 'square',
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(
        async (file: File) => {
            // Validate file
            const validation = validateImageFile(file, maxSizeMB);
            if (!validation.valid) {
                toast.error(validation.error);
                return;
            }

            setIsUploading(true);

            try {
                // Compress if needed
                let fileToUpload = file;
                if (compress) {
                    fileToUpload = await compressImage(file);
                }

                // Create preview
                const previewUrl = createFilePreview(fileToUpload);
                setPreview(previewUrl);

                // Upload to Appwrite
                const fileId = await storageService.uploadImage(fileToUpload);
                const fileUrl = storageService.getImageUrl(fileId);

                onUploadComplete(fileId, fileUrl);
                toast.success('Image uploaded successfully');
            } catch (error) {
                console.error('Error uploading image:', error);
                toast.error('Failed to upload image. Please try again.');
                setPreview(null);
            } finally {
                setIsUploading(false);
            }
        },
        [compress, maxSizeMB, onUploadComplete]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        },
        [handleFile]
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                handleFile(files[0]);
            }
        },
        [handleFile]
    );

    const handleRemove = useCallback(() => {
        if (preview && preview.startsWith('blob:')) {
            revokeFilePreview(preview);
        }
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onRemove?.();
    }, [preview, onRemove]);

    const getAspectRatioClass = () => {
        switch (aspectRatio) {
            case 'square':
                return 'aspect-square';
            case 'video':
                return 'aspect-video';
            case 'free':
            default:
                return '';
        }
    };

    return (
        <div className={cn('w-full', className)}>
            {preview ? (
                <div className={cn('relative w-full rounded-lg overflow-hidden bg-muted', getAspectRatioClass())}>
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    {!isUploading && (
                        <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2"
                            onClick={handleRemove}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                    {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                    )}
                </div>
            ) : (
                <div
                    className={cn(
                        'relative w-full border-2 border-dashed rounded-lg transition-colors',
                        isDragging
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                        getAspectRatioClass(),
                        !getAspectRatioClass() && 'min-h-[200px]'
                    )}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleFileInput}
                        disabled={isUploading}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                        {isUploading ? (
                            <>
                                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <Upload className="h-10 w-10 text-muted-foreground" />
                                <div className="text-center">
                                    <p className="text-sm font-medium">Drop your image here</p>
                                    <p className="text-xs text-muted-foreground mt-1">or</p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Browse Files
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Supports: JPEG, PNG, WebP, GIF (max {maxSizeMB}MB)
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
