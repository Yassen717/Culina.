import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, ChefHat, Image as ImageIcon, X } from 'lucide-react';
import { useState } from 'react';

export default function Create() {
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [type, setType] = useState<'post' | 'recipe' | null>(null);

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
        <Button className="text-white">Share</Button>
      </div>

      <div className="space-y-8">
        {/* Image Upload */}
        <div className="aspect-[16/9] bg-muted border-2 border-dashed border-muted-foreground/25 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
          <Upload className="text-muted-foreground mb-4" size={40} />
          <p className="font-medium text-muted-foreground">Tap to upload photos or videos</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Caption</Label>
            <Textarea placeholder="Write a caption..." className="resize-none h-32" />
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Input placeholder="Add location" />
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
                Ingredients and Steps editor would go here...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
