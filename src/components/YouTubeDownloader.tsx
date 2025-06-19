// src/components/YouTubeDownloader.tsx
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// Removed Select for audioFormat as we'll offer MP3 audio and MP4 video
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Youtube, Download, Music, Video as VideoIcon, Loader2 } from "lucide-react"; // Added VideoIcon

import { downloadYouTubeVideo, extractAudio, downloadResultFile } from "../api/apiService";
import { DownloadYouTubeRequest, ExtractAudioRequest } from "../types/apiTypes";

export const YouTubeDownloader = () => {
  const [videoUrl, setVideoUrl] = useState("");
  // const [audioFormat, setAudioFormat] = useState("mp3"); // Audio will be MP3, Video MP4

  const [isDownloadingVideo, setIsDownloadingVideo] = useState(false);
  const [isExtractingAudio, setIsExtractingAudio] = useState(false);
  const [progress, setProgress] = useState(0);

  const [downloadedVideoFileId, setDownloadedVideoFileId] = useState<string | null>(null);
  const [downloadedVideoFilename, setDownloadedVideoFilename] = useState<string | null>(null); // Store filename for video
  const [extractedAudioUuid, setExtractedAudioUuid] = useState<string | null>(null);
  const [extractedAudioFilename, setExtractedAudioFilename] = useState<string | null>(null); // Store filename for audio

  const { toast } = useToast();

  const validateYouTubeUrl = (url: string) => {
    const regex = /^https?:\/\/(www\.)?youtube\.com\/(watch\?v=|shorts\/)[a-zA-Z0-9_-]{11}(?:[&?].*)?$/;
    return regex.test(url);
  };

  const handleProcessYouTubeUrl = async () => {
    if (!videoUrl) {
        toast({ title: "URL required", description: "Please enter a YouTube video URL.", variant: "destructive" });
        return;
    }
    if (!validateYouTubeUrl(videoUrl)) {
        toast({ title: "Invalid URL", description: "Please enter a valid YouTube URL.", variant: "destructive" });
        return;
    }

    setIsDownloadingVideo(true);
    setIsExtractingAudio(false);
    setProgress(0);
    setDownloadedVideoFileId(null);
    setDownloadedVideoFilename(null);
    setExtractedAudioUuid(null);
    setExtractedAudioFilename(null);

    try {
      // Step 1: Download YouTube Video (MP4 with audio)
      setProgress(10);
      toast({ title: "Downloading YouTube Video...", description: "This may take a moment..." });
      const downloadVideoPayload: DownloadYouTubeRequest = { youtube_url: videoUrl };
      const videoResponse = await downloadYouTubeVideo(downloadVideoPayload);
      
      const videoFilenameFromServer = videoResponse.video_file_path.split('/').pop() || `youtube_video_${videoResponse.file_id}.mp4`;
      setDownloadedVideoFileId(videoResponse.file_id);
      setDownloadedVideoFilename(videoFilenameFromServer);
      setProgress(50);
      toast({ title: "Video Downloaded to Server!", description: `${videoFilenameFromServer} is ready.` });

      // Step 2: Extract Audio (MP3) from the downloaded video
      setIsDownloadingVideo(false);
      setIsExtractingAudio(true);
      setProgress(60);
      toast({ title: "Extracting Audio...", description: "Processing the downloaded video." });
      const extractPayload: ExtractAudioRequest = { file_id: videoResponse.file_id };
      const audioResponse = await extractAudio(extractPayload);
      
      const audioFilenameFromServer = audioResponse.audio_file_path.split('/').pop() || `extracted_audio_${audioResponse.audio_file_uuid}.mp3`;
      setExtractedAudioUuid(audioResponse.audio_file_uuid);
      setExtractedAudioFilename(audioFilenameFromServer);
      setProgress(100);
      toast({ title: "Audio Extracted!", description: "Both video and audio are ready for download." });

    } catch (error: any) {
      console.error("YouTube processing failed:", error);
      const errorMessage = error.detail || error.message || "An unknown error occurred.";
      toast({ title: "Process Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsDownloadingVideo(false);
      setIsExtractingAudio(false);
      // Don't reset progress if download buttons are shown
    }
  };
  
  const handleDownloadAudio = () => {
    if (extractedAudioUuid && extractedAudioFilename) {
        downloadResultFile(extractedAudioUuid, extractedAudioFilename);
    } else {
        toast({title: "Audio not ready", description: "Please process a video first.", variant: "destructive"});
    }
  };

  const handleDownloadVideoWithAudio = () => {
    if (downloadedVideoFileId && downloadedVideoFilename) {
        downloadResultFile(downloadedVideoFileId, downloadedVideoFilename);
    } else {
        toast({title: "Video not ready", description: "Please process a video first.", variant: "destructive"});
    }
  };

  const isProcessing = isDownloadingVideo || isExtractingAudio;

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-600" />
            YouTube Downloader (Video & Audio)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="youtube-url">YouTube Video URL</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="youtube-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setVideoUrl(e.target.value)}
                className="flex-1"
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Removed Audio Format Select as we now offer specific downloads */}

          <Button 
            onClick={handleProcessYouTubeUrl}
            disabled={!videoUrl || isProcessing}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
          >
            {isDownloadingVideo ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Downloading Video...</> :
             isExtractingAudio ? <><Music className="h-4 w-4 mr-2 animate-spin" />Extracting Audio...</> :
             <><Download className="h-4 w-4 mr-2" />Fetch & Process YouTube Link</>}
          </Button>

          {isProcessing && progress > 0 && (
            <div className="space-y-1 mt-2">
              <Progress value={progress} className="w-full h-2" />
              <p className="text-xs text-center text-gray-600">
                Step {progress <= 50 ? 1 : 2} of 2: {isDownloadingVideo ? "Downloading Video..." : "Extracting Audio..."} {progress}%
              </p>
            </div>
          )}

          {/* Download Buttons - Shown when processing is complete and respective files are ready */}
          {(!isProcessing && (extractedAudioUuid || downloadedVideoFileId)) && (
            <div className="mt-4 space-y-2 pt-4 border-t">
                <p className="text-sm font-medium text-center text-gray-700">Downloads Ready:</p>
                {extractedAudioUuid && extractedAudioFilename && (
                    <Button 
                        onClick={handleDownloadAudio}
                        className="w-full"
                        variant="outline"
                    >
                        <Music className="h-4 w-4 mr-2" />
                        Download Extracted Audio (MP3)
                    </Button>
                )}
                {downloadedVideoFileId && downloadedVideoFilename && (
                    <Button 
                        onClick={handleDownloadVideoWithAudio}
                        className="w-full"
                        variant="outline"
                    >
                        <VideoIcon className="h-4 w-4 mr-2" />
                        Download Full Video (MP4)
                    </Button>
                )}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Legal Notice Card can remain as is */}
       <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Legal Notice</h4>
              <p className="text-sm text-blue-800">
                Make sure you have the right to download and use the content. 
                Respect copyright laws and YouTube's terms of service.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};