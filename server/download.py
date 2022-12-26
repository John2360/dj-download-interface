from youtubesearchpython import VideosSearch
from pytube import YouTube
import subprocess
import requests
import eyed3
import os
import io

class Download():
    def find_song(self, song_name, song_artists, use_lyrics = True):
        song_string = song_name + ' by ' + ' '.join(song_artists)

        if use_lyrics:
            song_string = song_string + ' lyrics'

        search_results = VideosSearch(song_string, limit = 1)
        song_url = search_results.result()['result'][0]['id']
        return 'https://www.youtube.com/watch?v='+song_url

    def download_song(self, song_url, download_path, song_name):
        youtube = YouTube(song_url)
        audio = youtube.streams.get_audio_only()
        audio.download(download_path, song_name+'.mp4')
        return audio.default_filename

    def add_metadata(self, song_location, song_name, song_artists, song_art):
        audiofile = eyed3.load(song_location)
        audiofile.tag.artist = '; '.join(song_artists)
        audiofile.tag.title = song_name
        image = io.BytesIO(requests.get(song_art, stream=True).content)
        audiofile.tag.images.set(3, image.read(), "image/jpeg", u"cover")
        audiofile.tag.save()

    def convert_to_mp3(self, song_location):
        print(song_location)
        subprocess.call(['ffmpeg -y -i "' + song_location + '.mp4" "' + song_location + '.mp3"' ], shell=True)
        os.remove(song_location + '.mp4')

    def download_track(self, song_name, song_artists, song_art, download_path):
        song_url = self.find_song(song_name, song_artists)
        self.download_song(song_url, download_path, song_name)
        song_location = download_path + '/' + song_name
        self.convert_to_mp3(song_location)
        self.add_metadata(song_location + '.mp3', song_name, song_artists, song_art) 