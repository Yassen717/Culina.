import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, ChefHat, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { APPWRITE_CONFIG, storage, databases, account } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export default function Create() {
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [type, setType] = useState<'post' | 'recipe' | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [, setLocationRoute] = useLocation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No image selected",
        description: "Please upload an image for your post.",
      });
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload Image to Appwrite Storage
      const fileUpload = await storage.createFile(
        APPWRITE_CONFIG.BUCKET_ID_IMAGES,
        ID.unique(),
        file
      );

      // 2. Get User ID (in a real app, you'd get this from context, but let's fetch it to be safe)
      const user = await account.get();

      // 3. Create Post Document in Database
      await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTION_ID_POSTS,
        ID.unique(),
        {
          userId: user.$id,
          image: fileUpload.$id, // Store the file ID
          caption: caption,
          location: location,
          likes: 0,
          comments: 0,
          isRecipe: type === 'recipe',
          createdAt: new Date().toISOString(),
        }
      );

      toast({
        title: "Post created!",
        description: "Your culinary creation is now live.",
      });
      
      setLocationRoute("/");

    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Something went wrong. Check your Appwrite config.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (step === 'type') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 animate-in fade-in zoom-in duration-500">
        <h1 className="text-3xl font-serif font-bold mb-8 text-center">What are you cooking today?</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <button 
            onClick={() => { setType('post'); setStep('details'); }}
            className="group relative aspect-[4/3] bg-card border-2 border-border hover:border-primary rounded-2xl p-8 flex flex-col items-center justify-center transition-all hover:shadow-xl"
          >
            <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ImageIcon size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Quick Snap</h2>
            <p className="text-muted-foreground text-center">Share a photo of your meal with a caption.</p>
          </button>

          <button 
            onClick={() => { setType('recipe'); setStep('details'); }}
            className="group relative aspect-[4/3] bg-card border-2 border-border hover:border-primary rounded-2xl p-8 flex flex-col items-center justify-center transition-all hover:shadow-xl"
          >
            <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ChefHat size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Full Recipe</h2>
            <p className="text-muted-foreground text-center">Create a detailed recipe card with steps & ingredients.</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pb-24 animate-in slide-in-from-right">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => setStep('type')} className="-ml-4">Cancel</Button>
        <h1 className="font-serif font-bold text-xl">New {type === 'recipe' ? 'Recipe' : 'Post'}</h1>
        <Button 
          className="text-white" 
          onClick={handleSubmit}
          disabled={isUploading}
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Share"}
        </Button>
      </div>

      <div className="space-y-8">
        {/* Image Upload */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="aspect-[16/9] bg-muted border-2 border-dashed border-muted-foreground/25 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors overflow-hidden relative"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileSelect}
          />
          
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <>
              <Upload className="text-muted-foreground mb-4" size={40} />
              <p className="font-medium text-muted-foreground">Tap to upload photos</p>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Caption</Label>
            <Textarea 
              placeholder="Write a caption..." 
              className="resize-none h-32" 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Input 
              placeholder="Add location" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          
          {type === 'recipe' && (
            <div className="space-y-6 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label>Recipe Title</Label>
                <Input placeholder="e.g. Grandma's Lasagna" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label>Prep Time (min)</Label>
                  <Input type="number" />
                </div>
                 <div className="space-y-2">
                  <Label>Cook Time (min)</Label>
                  <Input type="number" />
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-center text-sm text-primary">
                Note: Recipe steps database structure needs to be configured in Appwrite first.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
