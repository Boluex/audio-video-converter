// src/types/apiTypes.ts

// For /uploadfile/
export interface UploadFileResponse {
  message: string;
  file_id: string;
  file_path: string;
  filename: string; // Make sure your backend Pydantic model for UploadFileResponse includes this
}

// For /extract-audio/
export interface ExtractAudioRequest {
  file_id: string;
  // Future: trim_start_time?: number; 
  // Future: trim_end_time?: number;
}

export interface ExtractAudioResponse {
  message: string;
  audio_file_uuid: string;
  audio_file_path: string;
}

// For /download-youtube-video/
export interface DownloadYouTubeRequest {
    youtube_url: string;
}
export interface DownloadYouTubeResponse {
    message: string;
    file_id: string; // This is the ID of the downloaded VIDEO file
    video_file_path: string;
}

// For /download-instagram-video/ (Placeholder - Backend needs this endpoint)
export interface DownloadInstagramRequest {
    instagram_url: string;
}
export interface DownloadInstagramResponse {
    message: string;
    file_id: string;
    video_file_path: string;
}

// For /create-video-from-images/
export interface TextOverlayData {
  text: string;
  style?: 'Minimal' | 'Meme Style' | 'Dynamic' | 'Retro'; 
  image_index?: number | null;
  position?: 'top' | 'center' | 'bottom';
}

export interface CreateVideoRequest {
  image_file_ids: string[];
  audio_file_id: string;
  output_filename?: string;
  image_display_duration?: number;
  transition_duration?: number;
  music_segment_start_time?: number;
  audio_segment_duration_from_music?: number | null;
  fps?: number;
  texts?: TextOverlayData[] | null;
  video_aspect_ratio?: '16:9' | '9:16' | '1:1';
  enable_image_animations?: boolean;
}

export interface CreateVideoResponse {
  message: string;
  video_file_uuid: string;
  video_file_path: string;
}