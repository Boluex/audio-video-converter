
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoUploader } from "@/components/VideoUploader";
import { YouTubeDownloader } from "@/components/YouTubeDownloader";
import { InstagramConverter } from "@/components/InstagramConverter";
import { ShortsEditor } from "@/components/ShortsEditor";
import { Youtube, Music, Video, Download } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="w-full py-6 px-4 bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Music className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AudioExtract Pro
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
            Extract audio from video for free
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Extract audio from video and get a MP3 or WAV audio file from your video using this free tool. 
            Download YouTube videos, convert Instagram content, and create stunning shorts with background music.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/70 backdrop-blur-sm">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Upload Video
              </TabsTrigger>
              <TabsTrigger value="youtube" className="flex items-center gap-2">
                <Youtube className="h-4 w-4" />
                YouTube
              </TabsTrigger>
              <TabsTrigger value="instagram" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Instagram
              </TabsTrigger>
              <TabsTrigger value="shorts" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Shorts Editor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <VideoUploader />
            </TabsContent>

            <TabsContent value="youtube">
              <YouTubeDownloader />
            </TabsContent>

            <TabsContent value="instagram">
              <InstagramConverter />
            </TabsContent>

            <TabsContent value="shorts">
              <ShortsEditor />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 px-4 bg-white/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">
            How to extract audio from a video
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-purple-600">1</span>
                </div>
                <CardTitle className="text-lg">Upload your video</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Drag or upload your video file into the audio extractor tool above. 
                  The maximum file size is 500MB.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-600">2</span>
                </div>
                <CardTitle className="text-lg">Choose your audio format</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Select which format you'd like your audio download to be. 
                  Choose from MP3 or WAV.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-indigo-600">3</span>
                </div>
                <CardTitle className="text-lg">Click "Extract audio"</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Hit the "Extract audio" button to extract the audio from your video file. 
                  Your audio file will instantly download.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Free online audio extractor
          </h3>
          <div className="space-y-8">
            <div>
              <h4 className="text-xl font-semibold mb-4 text-gray-800">
                Easily create and extract voice-overs
              </h4>
              <p className="text-gray-600">
                Extract a voice-over track from your video file with one click. Use our video 
                maker to attach any voice-over to your video projects as a new voice-over layer.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4 text-gray-800">
                Save and edit just the audio
              </h4>
              <p className="text-gray-600">
                Only need the audio from your video file? Easily separate the audio from the video 
                with our online audio extractor tool. Download the audio to safe-keep, or edit 
                just the audio to add effects or improve quality.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4 text-gray-800">
                Update tutorial videos without redoing the voice-over
              </h4>
              <p className="text-gray-600">
                Easily update tutorial and how-to videos without re-recording the voice-over. Extract 
                the audio file from your original video, then attach the voice-over to your new screen 
                recording or video walkthrough.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; 2024 AudioExtract Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
