// src/components/VideoUploader.tsx
import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, Music } from "lucide-react";

import { uploadFile, extractAudio, downloadResultFile } from "../api/apiService";
import { ExtractAudioRequest } from "../types/apiTypes";// Adjusted path

export const VideoUploader = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioFormat, setAudioFormat] = useState("mp3");
  const [startTime, setStartTime] = useState("0");
  const [endTime, setEndTime] = useState("60");
  
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [uploadedVideoFileId, setUploadedVideoFileId] = useState<string | null>(null);
  const [extractedAudioUuid, setExtractedAudioUuid] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // Check against MAX_FILE_SIZE_MB from backend (e.g., 50MB)
        toast({
          title: "File too large",
          description: "Please select a file smaller than 50MB.", // Update if your backend limit is different
          variant: "destructive",
        });
        setSelectedFile(null);
        setUploadedVideoFileId(null);
        return;
      }
      setSelectedFile(file);
      setUploadedVideoFileId(null); 
      setExtractedAudioUuid(null);
      toast({
        title: "File selected",
        description: `Selected: ${file.name}`,
      });
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // Check against MAX_FILE_SIZE_MB
        toast({
          title: "File too large",
          description: "Please select a file smaller than 50MB.",
          variant: "destructive",
        });
        setSelectedFile(null);
        setUploadedVideoFileId(null);
        return;
      }
      setSelectedFile(file);
      setUploadedVideoFileId(null);
      setExtractedAudioUuid(null);
      toast({
        title: "File dropped",
        description: `Selected: ${file.name}`,
      });
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleExtractAudioProcess = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a video file first.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setIsExtracting(false);
    setUploadProgress(0);
    setExtractedAudioUuid(null);
    let currentUploadedFileId = uploadedVideoFileId;

    try {
      if (!currentUploadedFileId || (selectedFile && selectedFile.name !== localStorage.getItem(`lastUploadedFileName_videoUploader`))) {
        toast({ title: "Uploading video...", description: selectedFile.name });
        
        const uploadResponse = await uploadFile(selectedFile, (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        });

        currentUploadedFileId = uploadResponse.file_id;
        setUploadedVideoFileId(currentUploadedFileId);
        localStorage.setItem('lastUploadedFileName_videoUploader', selectedFile.name);
        setUploadProgress(100); // Ensure it hits 100
        toast({ title: "Video uploaded successfully!", description: `File ID: ${currentUploadedFileId}` });
      } else {
        toast({ title: "Using previously uploaded video.", description: `File ID: ${currentUploadedFileId}` });
        setUploadProgress(100); // Indicate "upload" part is done
      }
      
      if (!currentUploadedFileId) {
        throw new Error("Failed to get a file ID for the video.");
      }

      setIsUploading(false);
      setIsExtracting(true);
      toast({ title: "Extracting audio...", description: "This may take a moment." });
      
      const extractPayload: ExtractAudioRequest = {
        file_id: currentUploadedFileId,
        // TODO: Add trim parameters when backend supports them and UI collects them
        // trim_start_time: parseFloat(startTime) || undefined, // Ensure conversion to number
        // trim_end_time: parseFloat(endTime) || undefined,   // Ensure conversion to number
      };
      const extractResponse = await extractAudio(extractPayload);
      setExtractedAudioUuid(extractResponse.audio_file_uuid);

      toast({
        title: "Audio extracted successfully!",
        description: `Ready to download.`,
      });

    } catch (error: any) {
      console.error("Extraction process failed:", error);
      const errorMessage = error.detail || error.message || "An unknown error occurred.";
      toast({
        title: "Process failed",
        description: errorMessage,
        variant: "destructive",
      });
      setUploadedVideoFileId(null); 
    } finally {
      setIsUploading(false);
      setIsExtracting(false);
      // setUploadProgress(0); // Don't reset progress if download button appears
    }
  };
  
  const handleDownloadExtractedAudio = () => {
    if (extractedAudioUuid && selectedFile) {
        const fileNameParts = selectedFile.name.split('.');
        fileNameParts.pop(); // Remove original extension
        const baseName = fileNameParts.join('.');
        downloadResultFile(extractedAudioUuid, `${baseName}_audio.${audioFormat}`);
    } else {
        toast({ title: "Nothing to download", description: "Please extract audio first.", variant: "destructive" });
    }
  };

  const isProcessing = isUploading || isExtracting;

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer bg-white/50 ${isProcessing ? 'border-gray-300' : 'border-purple-300 hover:border-purple-400'}`}
                onDrop={!isProcessing ? handleDrop : undefined}
                onDragOver={!isProcessing ? handleDragOver : undefined}
                onClick={() => !isProcessing && fileInputRef.current?.click()}
              >
                <Upload className={`h-12 w-12 mx-auto mb-4 ${isProcessing ? 'text-gray-400' : 'text-purple-400'}`} />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drag and drop video or
                </p>
                <Button variant="default" className="bg-purple-600 hover:bg-purple-700" disabled={isProcessing}>
                  Upload video
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Maximum file size: 50MB {/* Match your backend config */}
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,.mkv,.webm,.mov" // Add more common video types
                onChange={handleFileChange}
                className="hidden"
                disabled={isProcessing}
              />

              {selectedFile && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">
                    Selected: {selectedFile.name}
                  </p>
                  <p className="text-xs text-green-600">
                    Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="format" className="text-sm font-medium text-gray-700">
                  Audio format
                </Label>
                <p className="text-xs text-gray-500 mb-2">
                  Backend extracts as MP3. WAV option for future.
                </p>
                <Select value={audioFormat} onValueChange={setAudioFormat} disabled={isProcessing}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp3">MP3</SelectItem>
                    {/* <SelectItem value="wav" disabled>WAV (Future)</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Trim (Feature Coming Soon)
                </Label>
                <p className="text-xs text-gray-500 mb-2">
                  Choose the part of your video to extract the audio from.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="start" className="text-xs">Start at (seconds)</Label>
                    <Input
                      id="start"
                      type="number"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      placeholder="0"
                      className="mt-1"
                      disabled={true} // Disabled until backend supports
                    />
                  </div>
                  <div>
                    <Label htmlFor="end" className="text-xs">End at (seconds)</Label>
                    <Input
                      id="end"
                      type="number"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      placeholder="60"
                      className="mt-1"
                      disabled={true} // Disabled until backend supports
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleExtractAudioProcess}
                disabled={!selectedFile || isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isUploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : isExtracting ? (
                  <>
                    <Music className="h-4 w-4 mr-2 animate-spin" />
                    Extracting Audio...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Extract Audio
                  </>
                )}
              </Button>

              {isUploading && (
                <div className="space-y-1 mt-2">
                  <Progress value={uploadProgress} className="w-full h-2" />
                  <p className="text-xs text-center text-gray-600">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
              {isExtracting && (
                 <p className="text-sm text-center text-gray-600 mt-2">
                    Extracting audio, please wait...
                  </p>
              )}
              {extractedAudioUuid && !isProcessing && (
                <Button 
                    onClick={handleDownloadExtractedAudio}
                    className="w-full mt-2"
                    variant="outline"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Download Extracted Audio ({audioFormat.toUpperCase()})
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};