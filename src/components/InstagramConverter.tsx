// src/components/InstagramConverter.tsx
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Download, Music, Loader2 } from "lucide-react"; // Added Loader2

// Import your API service functions
// Assuming you'll create 'downloadInstagramVideo' in apiService.ts
import { downloadInstagramVideo, extractAudio, downloadResultFile } from "../api/apiService";
import { DownloadInstagramRequest, ExtractAudioRequest } from "../types/apiTypes";

export const InstagramConverter = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [audioFormat, setAudioFormat] = useState("mp3");

  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [isDownloadingVideo, setIsDownloadingVideo] = useState(false);
  const [isExtractingAudio, setIsExtractingAudio] = useState(false);
  const [progress, setProgress] = useState(0);

  const [downloadedVideoFileId, setDownloadedVideoFileId] = useState<string | null>(null);
  const [extractedAudioUuid, setExtractedAudioUuid] = useState<string | null>(null);
  const [fetchedVideoInfo, setFetchedVideoInfo] = useState<{ title: string; type?: string; } | null>(null);

  const { toast } = useToast();

  const validateInstagramUrl = (url: string) => {
    const regex = /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|tv|stories)\/[a-zA-Z0-9_-]+/; // Added stories
    return regex.test(url);
  };

  // Optional Fetch Info - simplified for now
  const handleFetchVideoInfo = async () => {
    if (!videoUrl || !validateInstagramUrl(videoUrl)) {
      toast({ title: "Invalid URL", description: "Please enter a valid Instagram video URL.", variant: "destructive" });
      return;
    }
    setIsFetchingInfo(true);
    setFetchedVideoInfo(null);
    setDownloadedVideoFileId(null);
    setExtractedAudioUuid(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      let type = 'Post';
      if (videoUrl.includes('/reel/')) type = 'Reel';
      else if (videoUrl.includes('/tv/')) type = 'IGTV';
      else if (videoUrl.includes('/stories/')) type = 'Story';
      setFetchedVideoInfo({ title: `Instagram ${type}`, type });
      toast({ title: "URL Validated", description: "Ready to download and extract audio." });
    } catch (error) {
      toast({ title: "Error", description: "Could not validate URL.", variant: "destructive" });
    } finally {
      setIsFetchingInfo(false);
    }
  };


  const handleDownloadAndExtractAudio = async () => {
    if (!videoUrl || !validateInstagramUrl(videoUrl)) {
        toast({ title: "Invalid URL", description: "Please enter a valid Instagram video URL.", variant: "destructive" });
        return;
    }

    setIsDownloadingVideo(true);
    setIsExtractingAudio(false);
    setProgress(0);
    setDownloadedVideoFileId(null);
    setExtractedAudioUuid(null);
    setFetchedVideoInfo(null);

    try {
      // Step 1: Download Instagram Video
      setProgress(10);
      toast({ title: "Downloading Instagram Video...", description: "This may take a moment." });
      const downloadVideoPayload: DownloadInstagramRequest = { instagram_url: videoUrl };
      // THIS WILL FAIL UNTIL BACKEND ENDPOINT IS READY
      const videoResponse = await downloadInstagramVideo(downloadVideoPayload); 
      setDownloadedVideoFileId(videoResponse.file_id);
      setFetchedVideoInfo({ title: videoResponse.video_file_path.split('/').pop() || "Instagram Video" });
      setProgress(50);
      toast({ title: "Video Downloaded!", description: `File ID: ${videoResponse.file_id}` });

      // Step 2: Extract Audio
      setIsDownloadingVideo(false);
      setIsExtractingAudio(true);
      setProgress(60);
      toast({ title: "Extracting Audio...", description: "Processing..." });
      const extractPayload: ExtractAudioRequest = { file_id: videoResponse.file_id };
      const audioResponse = await extractAudio(extractPayload);
      setExtractedAudioUuid(audioResponse.audio_file_uuid);
      setProgress(100);
      toast({ title: "Audio Extracted!", description: "Ready for download." });

    } catch (error: any) {
      console.error("Instagram download/extraction failed:", error);
      const errorMessage = error.detail || error.message || "An unknown error occurred.";
      toast({ title: "Process Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsDownloadingVideo(false);
      setIsExtractingAudio(false);
    }
  };

  const handleDownloadResult = () => {
    if (extractedAudioUuid && fetchedVideoInfo) {
        const baseName = fetchedVideoInfo.title.replace(/\.[^/.]+$/, "") || "instagram_video";
        downloadResultFile(extractedAudioUuid, `${baseName}_audio.${audioFormat}`);
    } else {
        toast({title: "Nothing to download", description: "Please process a video first.", variant: "destructive"});
    }
  };
  
  const isProcessing = isFetchingInfo || isDownloadingVideo || isExtractingAudio;


  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500 rounded-full"></div>
            Instagram to Audio Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="instagram-url">Instagram Video URL</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="instagram-url"
                placeholder="https://www.instagram.com/p/... or /reel/..."
                value={videoUrl}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setVideoUrl(e.target.value)}
                className="flex-1"
                disabled={isProcessing}
              />
              {/* Optional Fetch button */}
              {/* <Button onClick={handleFetchVideoInfo} disabled={isProcessing || !videoUrl} variant="outline">
                 {isFetchingInfo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch Info"}
              </Button> */}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Supports Posts, Reels, IGTV. (Backend support pending)
            </p>
          </div>

          {fetchedVideoInfo && !isProcessing && (
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Music className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{fetchedVideoInfo.title}</h4>
                    {fetchedVideoInfo.type && <p className="text-sm text-gray-600">Type: {fetchedVideoInfo.type}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Audio Format</Label>
              <Select value={audioFormat} onValueChange={setAudioFormat} disabled={isProcessing}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp3">MP3 (Recommended)</SelectItem>
                  {/* <SelectItem value="wav" disabled>WAV (Future)</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleDownloadAndExtractAudio}
            disabled={!videoUrl || isProcessing}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700"
          >
            {isDownloadingVideo ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Downloading...</> :
             isExtractingAudio ? <><Music className="h-4 w-4 mr-2 animate-spin" />Extracting...</> :
             isFetchingInfo ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Fetching...</> :
             <><Download className="h-4 w-4 mr-2" />Convert to Audio</>}
          </Button>

          {isProcessing && progress > 0 && (
            <div className="space-y-1 mt-2">
              <Progress value={progress} className="w-full h-2" />
              <p className="text-xs text-center text-gray-600">
                Step {progress <= 50 ? 1 : 2} of 2: {isDownloadingVideo ? "Downloading..." : "Extracting..."} {progress}%
              </p>
            </div>
          )}
           {extractedAudioUuid && !isProcessing && (
             <Button 
                onClick={handleDownloadResult}
                className="w-full mt-2"
                variant="outline"
            >
                <Download className="h-4 w-4 mr-2" />
                Download Converted Audio ({audioFormat.toUpperCase()})
            </Button>
          )}
        </CardContent>
      </Card>
      {/* Info Cards ... */}
    </div>
  );
};