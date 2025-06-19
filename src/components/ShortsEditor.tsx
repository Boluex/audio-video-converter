// src/components/ShortsEditor.tsx
import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, Music, Video, Download, Loader2, ImagePlus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

import { uploadFile, createVideoFromImages, downloadResultFile } from "../api/apiService"; 
import { CreateVideoRequest, TextOverlayData } from "../types/apiTypes";

const MAX_IMAGES_ALLOWED = 5; 
const MAX_IMAGE_SIZE_MB = 10; 
const MAX_AUDIO_SIZE_MB = 20;

interface UploadedImage {
  clientId: string; 
  file: File; 
  previewUrl: string;
  name: string;
  backendFileId?: string; 
  uploadProgress?: number; 
  isUploading?: boolean; 
}

export const ShortsEditor = () => {
  const [selectedImages, setSelectedImages] = useState<UploadedImage[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [uploadedAudioFileId, setUploadedAudioFileId] = useState<string | null>(null);
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);

  const [memeText, setMemeText] = useState("");
  const [imageDisplayDuration, setImageDisplayDuration] = useState(3.0);
  const [transitionDuration, setTransitionDuration] = useState(0.5);
  const [videoStyle, setVideoStyle] = useState<'Minimal' | 'Meme Style' | 'Dynamic' | 'Retro'>("Meme Style");
  const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>("center"); // <-- ADDED STATE
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>("16:9");
  const [enableAnimations, setEnableAnimations] = useState(false);

  const [isUploadingBatchImages, setIsUploadingBatchImages] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isCreatingVideo, setIsCreatingVideo] = useState(false);
  const [createdVideoUuid, setCreatedVideoUuid] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      selectedImages.forEach(img => {
        if (img.previewUrl && img.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [selectedImages]);


  const handleImageFilesSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFileList = event.target.files; 
    const filesArray: File[] = selectedFileList ? Array.from(selectedFileList) : [];

    if (imageInputRef.current) imageInputRef.current.value = "";

    if (filesArray && filesArray.length > 0) {
      if (selectedImages.length + filesArray.length > MAX_IMAGES_ALLOWED) {
        toast({ title: "Too many images", description: `Max ${MAX_IMAGES_ALLOWED} images allowed.`, variant: "destructive"});
        return;
      }
      
      setIsUploadingBatchImages(true);
      let successfulUploadsThisBatch = 0;
      
      const newImageEntries: UploadedImage[] = [];
      for (const file of filesArray) {
        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
          toast({ title: "Image too large", description: `${file.name} is over ${MAX_IMAGE_SIZE_MB}MB.`, variant: "destructive" });
          continue; 
        }
        const clientId = uuidv4();
        const previewUrl = URL.createObjectURL(file);
        newImageEntries.push({ clientId, file, previewUrl, name: file.name, uploadProgress: 0, isUploading: true });
      }
      
      if (newImageEntries.length === 0) {
          setIsUploadingBatchImages(false);
          return;
      }
      setSelectedImages(prev => [...prev, ...newImageEntries]);

      for (const newImageEntry of newImageEntries) {
        try {
          const response = await uploadFile(newImageEntry.file, (progressEvent) => {
             if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setSelectedImages(prev => prev.map(img => 
                    img.clientId === newImageEntry.clientId ? { ...img, uploadProgress: percentCompleted } : img
                ));
             }
          });
          setSelectedImages(prev => prev.map(img => 
            img.clientId === newImageEntry.clientId 
            ? { ...img, backendFileId: response.file_id, isUploading: false, uploadProgress: 100 } 
            : img
          ));
          successfulUploadsThisBatch++;
        } catch (err: any) {
          toast({ title: "Image Upload Failed", description: err.message || `Could not upload ${newImageEntry.name}.`, variant: "destructive"});
          setSelectedImages(prev => prev.map(img => 
            img.clientId === newImageEntry.clientId ? { ...img, isUploading: false, uploadProgress: -1 } : img
          )); 
        }
      }
      setIsUploadingBatchImages(false); 
      if (successfulUploadsThisBatch > 0) {
        toast({title: `${successfulUploadsThisBatch} Image${successfulUploadsThisBatch > 1 ? 's' : ''} processed`});
      }
    }
  };

  const removeImage = (clientIdToRemove: string) => {
    const imageToRemove = selectedImages.find(img => img.clientId === clientIdToRemove);
    if (imageToRemove?.previewUrl && imageToRemove.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
    }
    setSelectedImages(prev => prev.filter(img => img.clientId !== clientIdToRemove));
  };

  const handleAudioFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (audioInputRef.current) audioInputRef.current.value = "";

    if (file) {
      if (file.size > MAX_AUDIO_SIZE_MB * 1024 * 1024) {
        toast({ title: "Audio file too large", description: `Max ${MAX_AUDIO_SIZE_MB}MB for audio.`, variant: "destructive" });
        return;
      }
      setSelectedAudio(file); 
      setUploadedAudioFileId(null); 
      setIsUploadingAudio(true);
      setAudioUploadProgress(0);
      try {
        toast({title: "Uploading audio...", description: file.name});
        const response = await uploadFile(file, (progressEvent) => {
            if (progressEvent.total && progressEvent.total > 0) { 
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setAudioUploadProgress(percentCompleted);
            }
        });
        setUploadedAudioFileId(response.file_id); 
        toast({ title: "Audio Uploaded", description: `Successfully uploaded: ${file.name}` });
      } catch (err: any) {
        console.error("Audio upload failed:", err);
        toast({ title: "Audio Upload Failed", description: err.message || `Could not upload ${file.name}.`, variant: "destructive"});
        setSelectedAudio(null); 
        setUploadedAudioFileId(null);
      } finally {
        setIsUploadingAudio(false);
      }
    }
  };

  const handleCreateShortVideo = async () => {
    const validUploadedImages = selectedImages.filter(img => img.backendFileId && img.uploadProgress !== -1); // Ensure not failed
    if (validUploadedImages.length === 0) {
      toast({ title: "No successfully uploaded images", description: "Please upload images first.", variant: "destructive" });
      return;
    }
    if (!uploadedAudioFileId) {
      toast({ title: "No audio uploaded", description: "Please upload background audio first.", variant: "destructive" });
      return;
    }

    setIsCreatingVideo(true);
    setCreatedVideoUuid(null);

    const textsPayload: TextOverlayData[] = [];
    if (memeText.trim() !== "") {
      textsPayload.push({
        text: memeText,
        style: videoStyle,
        image_index: null, 
        position: textPosition, // <-- USE THE NEW STATE HERE
      });
    }

    const payload: CreateVideoRequest = {
      image_file_ids: validUploadedImages.map(img => img.backendFileId!),
      audio_file_id: uploadedAudioFileId,
      output_filename: `short_video_${Date.now()}.mp4`,
      image_display_duration: parseFloat(imageDisplayDuration.toFixed(1)),
      transition_duration: parseFloat(transitionDuration.toFixed(1)),
      fps: 24,
      texts: textsPayload.length > 0 ? textsPayload : null,
      video_aspect_ratio: aspectRatio,
      enable_image_animations: enableAnimations,
    };
    console.log("Creating video with payload:", payload);

    try {
      const response = await createVideoFromImages(payload);
      setCreatedVideoUuid(response.video_file_uuid);
      toast({ title: "Video Created Successfully!", description: "Your short video is ready for download." });
    } catch (error: any) {
      console.error("Video creation failed:", error);
      const errorMessage = error.detail || error.message || "An unknown error occurred.";
      toast({ title: "Video Creation Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsCreatingVideo(false);
    }
  };

  const handleDownloadCreatedVideo = () => {
    if (createdVideoUuid) {
        downloadResultFile(createdVideoUuid, `created_short_${createdVideoUuid.substring(0,8)}.mp4`);
    }
  };
  
  const isCurrentlyProcessingAnyFile = selectedImages.some(img => img.isUploading) || isUploadingAudio;
  const isOverallProcessing = isCurrentlyProcessingAnyFile || isCreatingVideo;

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-purple-600" />
            Shorts Editor - Create Stunning Videos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Upload Section */}
          <div>
            <Label>Upload Images (Up to {MAX_IMAGES_ALLOWED})</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-2">
                {selectedImages.map(img => (
                    <div key={img.clientId} className="relative group aspect-square border rounded-md overflow-hidden shadow">
                        <img 
                            src={img.previewUrl} 
                            alt={img.name} 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                                variant="destructive" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => !isOverallProcessing && removeImage(img.clientId)}
                                disabled={isOverallProcessing}
                            >
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                        {img.isUploading && img.uploadProgress !== undefined && img.uploadProgress >= 0 && img.uploadProgress < 100 && (
                             <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                                <div className="bg-purple-600 h-1" style={{ width: `${img.uploadProgress}%` }}></div>
                             </div>
                        )}
                         {img.uploadProgress === -1 && (
                            <div className="absolute inset-0 bg-red-700 bg-opacity-75 flex items-center justify-center text-white text-xs p-1 text-center">Upload Failed</div>
                        )}
                        <p className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 py-0.5 rounded whitespace-nowrap overflow-hidden text-ellipsis max-w-[calc(100%-0.5rem)]">
                            {img.name}
                        </p>
                    </div>
                ))}
                {selectedImages.length < MAX_IMAGES_ALLOWED && (
                    <div
                        className={`border-2 border-dashed rounded-lg aspect-square flex flex-col items-center justify-center text-center transition-colors bg-white/50 
                                    ${isOverallProcessing || selectedImages.length >= MAX_IMAGES_ALLOWED ? 'border-gray-300 cursor-not-allowed' : 'border-purple-300 hover:border-purple-400 cursor-pointer'}`}
                        onClick={() => !(isOverallProcessing || selectedImages.length >= MAX_IMAGES_ALLOWED) && imageInputRef.current?.click()}
                    >
                        <ImagePlus className={`h-8 w-8 mx-auto mb-2 ${isOverallProcessing || selectedImages.length >= MAX_IMAGES_ALLOWED ? 'text-gray-400' : 'text-purple-400'}`} />
                        <p className="text-xs font-medium text-gray-700">Add Image</p>
                        {isUploadingBatchImages && <Loader2 className="h-4 w-4 animate-spin mt-1 text-purple-500" />}
                    </div>
                )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              multiple
              onChange={handleImageFilesSelect}
              className="hidden"
              disabled={isOverallProcessing || selectedImages.length >= MAX_IMAGES_ALLOWED}
            />
          </div>
          
          {/* Audio Upload Section */}
          <div>
            <Label>Background Music</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer bg-white/50 mt-2 ${isOverallProcessing ? 'border-gray-300 cursor-not-allowed' : 'border-blue-300 hover:border-blue-400'}`}
              onClick={() => !isOverallProcessing && audioInputRef.current?.click()}
            >
              <Music className={`h-8 w-8 mx-auto mb-2 ${isOverallProcessing ? 'text-gray-400' : 'text-blue-400'}`} />
              <p className="text-sm font-medium text-gray-700">
                {selectedAudio ? selectedAudio.name : "Click to upload audio"}
              </p>
              <p className="text-xs text-gray-500">MP3, WAV up to {MAX_AUDIO_SIZE_MB}MB</p>
            </div>
            {isUploadingAudio && <div className="mt-1"><Progress value={audioUploadProgress} className="w-full h-1" /><p className="text-xs text-center">{audioUploadProgress}%</p></div>}
            {selectedAudio && !isUploadingAudio && uploadedAudioFileId && (
                <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200 text-xs text-blue-700">
                    Uploaded: {selectedAudio.name} ({(selectedAudio.size / (1024*1024)).toFixed(2)} MB)
                </div>
            )}
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/mpeg, audio/wav"
              onChange={handleAudioFileSelect}
              className="hidden"
              disabled={isOverallProcessing}
            />
          </div>

          {/* Meme Text Section */}
          <div>
            <Label htmlFor="meme-text">Overlay Text (Optional)</Label>
            <Textarea
              id="meme-text"
              placeholder="Enter text to display on the video..."
              value={memeText}
              onChange={(e) => setMemeText(e.target.value)}
              className="mt-2"
              rows={2}
              disabled={isOverallProcessing}
            />
          </div>

          {/* Settings Section */}
          <div className="grid md:grid-cols-2 gap-6 items-end">
            <div>
              <Label>Text Style</Label>
              <Select value={videoStyle} onValueChange={(v) => setVideoStyle(v as any)} disabled={isOverallProcessing}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Meme Style">Meme Style</SelectItem>
                  <SelectItem value="Minimal">Minimal</SelectItem>
                  <SelectItem value="Dynamic">Dynamic</SelectItem>
                  <SelectItem value="Retro">Retro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* --- TEXT POSITION DROPDOWN ADDED HERE --- */}
            <div>
              <Label>Text Position</Label>
              <Select value={textPosition} onValueChange={(v) => setTextPosition(v as 'top' | 'center' | 'bottom')} disabled={isOverallProcessing}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Select text position" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* --- END TEXT POSITION DROPDOWN --- */}
             <div>
                <Label>Aspect Ratio</Label>
                <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as any)} disabled={isOverallProcessing}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                        <SelectItem value="9:16">9:16 (Portrait/Shorts)</SelectItem>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
              <Label>Image Display Duration (sec)</Label>
              <Input 
                type="number" 
                value={imageDisplayDuration} 
                onChange={(e) => setImageDisplayDuration(parseFloat(e.target.value) || 3.0)} 
                min="1" max="10" step="0.1" 
                className="mt-2"
                disabled={isOverallProcessing}
              />
            </div>
             <div>
                <Label>Transition Duration (sec)</Label>
                <Input 
                    type="number" 
                    value={transitionDuration} 
                    onChange={(e) => setTransitionDuration(parseFloat(e.target.value) || 0.5)} 
                    min="0" max="3" step="0.1" 
                    className="mt-2"
                    disabled={isOverallProcessing}
                />
            </div>
             <div className="flex items-center space-x-2 mt-2 md:col-span-2">
                <Checkbox 
                    id="enableAnimations" 
                    checked={enableAnimations} 
                    onCheckedChange={(checked) => setEnableAnimations(checked as boolean)}
                    disabled={isOverallProcessing}
                />
                <Label htmlFor="enableAnimations" className="text-sm font-normal">Enable Image Animations</Label>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={handleCreateShortVideo}
            disabled={selectedImages.filter(img => img.backendFileId).length === 0 || !uploadedAudioFileId || isOverallProcessing}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-3"
          >
            {isCreatingVideo ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Creating Video...</>
            ) : (
              <><Video className="h-5 w-5 mr-2" />Create Short Video</>
            )}
          </Button>

           {createdVideoUuid && !isOverallProcessing && (
             <Button 
                onClick={handleDownloadCreatedVideo}
                className="w-full mt-2"
                variant="outline"
            >
                <Download className="h-4 w-4 mr-2" />
                Download Created Video
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};