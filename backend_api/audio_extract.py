from moviepy.editor import VideoFileClip
import yt_dlp
import os

# from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_audio
# from moviepy.video.io import VideoFileClip

def extract_audio_from_video(video_path, output_audio_path):
 
    try:
       
        video = VideoFileClip(video_path)

        
        audio = video.audio

        
        audio.write_audiofile(output_audio_path)

      
        audio.close()
        video.close()

        print(f"Audio extracted successfully from '{video_path}' to '{output_audio_path}'")

    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
   

    input_video_file = "/home/deji/kube_proj/audio_extract/when_we_pray_chant.mp4"  
    output_audio_file = "when_we_pray_chant.mp3"

    extract_audio_from_video(input_video_file, output_audio_file)


















