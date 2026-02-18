import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";

interface Props {
  photo?: string;
  onPhotoChange: (dataUrl: string) => void;
  onPhotoRemove: () => void;
}

const PhotoUpload = ({ photo, onPhotoChange, onPhotoRemove }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Photo must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onPhotoChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-3">
      {photo ? (
        <div className="relative">
          <img src={photo} alt="Profile" className="w-14 h-14 rounded-full object-cover border border-border" />
          <button onClick={onPhotoRemove} className="absolute -top-1 -right-1 rounded-full bg-destructive text-destructive-foreground w-4 h-4 flex items-center justify-center">
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      ) : (
        <div className="w-14 h-14 rounded-full border-2 border-dashed border-border flex items-center justify-center">
          <Camera className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div>
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          {photo ? "Change Photo" : "Upload Photo"}
        </Button>
        <p className="text-[10px] text-muted-foreground mt-1">Max 2 MB · JPG/PNG</p>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
    </div>
  );
};

export default PhotoUpload;
