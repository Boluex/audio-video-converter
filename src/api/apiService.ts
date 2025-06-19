// src/api/apiService.ts
import axios from 'axios';
import type {
  UploadFileResponse,
  ExtractAudioRequest,
  ExtractAudioResponse,
  DownloadYouTubeRequest,
  DownloadYouTubeResponse,
  DownloadInstagramRequest, // Placeholder
  DownloadInstagramResponse, // Placeholder
  CreateVideoRequest,
  CreateVideoResponse
} from '../types/apiTypes'; // Path relative to apiService.ts

// Configure your API base URL.
// Using an environment variable is good practice.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    // Default Content-Type for POST/PUT is application/json for axios
    // It will be overridden for file uploads (multipart/form-data)
  },
});

// --- File Upload ---
export const uploadFile = async (file: File, onUploadProgress?: (progressEvent: any) => void): Promise<UploadFileResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await apiClient.post<UploadFileResponse>('/uploadfile/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error uploading file:", error.response?.data || error.message);
    // Throw a more structured error or the error object itself for the component to handle
    throw error.response?.data || new Error(error.message || "File upload failed");
  }
};

// --- Audio Extraction ---
export const extractAudio = async (payload: ExtractAudioRequest): Promise<ExtractAudioResponse> => {
  try {
    const response = await apiClient.post<ExtractAudioResponse>('/extract-audio/', payload, {
        headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error: any) {
    console.error("Error extracting audio:", error.response?.data || error.message);
    throw error.response?.data || new Error(error.message || "Audio extraction failed");
  }
};

// --- YouTube Video Download ---
export const downloadYouTubeVideo = async (payload: DownloadYouTubeRequest): Promise<DownloadYouTubeResponse> => {
    try {
        const response = await apiClient.post<DownloadYouTubeResponse>('/download-youtube-video/', payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error: any) {
        console.error("Error downloading YouTube video:", error.response?.data || error.message);
        throw error.response?.data || new Error(error.message || "YouTube download failed");
    }
};

// --- Instagram Video Download (Placeholder - Backend Endpoint Needed) ---
export const downloadInstagramVideo = async (payload: DownloadInstagramRequest): Promise<DownloadInstagramResponse> => {
  console.warn("Frontend: downloadInstagramVideo called, but backend endpoint might not be implemented yet.");
  // This is a placeholder and will throw an error.
  // Replace with actual API call when backend is ready.
  return new Promise((_, reject) => {
    setTimeout(() => {
        reject({ detail: "Instagram download feature not yet implemented on the backend." });
    }, 500);
  });
  // Example of how it might look:
  // try {
  //   const response = await apiClient.post<DownloadInstagramResponse>('/download-instagram-video/', payload, {
  //       headers: { 'Content-Type': 'application/json' }
  //   });
  //   return response.data;
  // } catch (error: any) {
  //   console.error("Error downloading Instagram video:", error.response?.data || error.message);
  //   throw error.response?.data || new Error(error.message || "Instagram download failed");
  // }
};


// --- Create Video From Images ---
export const createVideoFromImages = async (payload: CreateVideoRequest): Promise<CreateVideoResponse> => {
    try {
        const response = await apiClient.post<CreateVideoResponse>('/create-video-from-images/', payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error: any) {
        console.error("Error creating video from images:", error.response?.data || error.message);
        throw error.response?.data || new Error(error.message || "Video creation failed");
    }
};

// --- Download Result Helper ---
export const downloadResultFile = (fileUuid: string, desiredFilename?: string) => {
  const downloadUrl = `${API_BASE_URL}/download-result/${fileUuid}`;
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', desiredFilename || `download_${fileUuid}`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  link.remove(); // Extra cleanup
};