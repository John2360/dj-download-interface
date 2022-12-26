from database import Database
from download import Download

from flask import Flask, request, jsonify
from flask_cors import CORS

import shutil
import re
import os

app = Flask(__name__)
CORS(app)

database = Database('./data.json')
downloader = Download()


@app.route('/download/playlist', methods = ['POST'])
def download():
    playlist_id = request.json['playlist_id']
    playlist_location = request.json['playlist_location']
    track = request.json['tracks']

    if not database.isPlaylistDownloaded(playlist_id):
        database.addPlaylist(playlist_id, playlist_location, [])

    track_details = track['track']
    track_name = re.sub('[^a-zA-Z0-9 ]', '', track_details['name'])
    track_id = track_details['id']
    artist_details = track_details['artists']
    artst_names = []

    for artist in artist_details:
        artst_names.append(artist['name'])

    photo_url = track_details['album']['images'][0]['url']
    track_location = f'{playlist_location}/{track_name}.mp3'

    downloader.download_track(track_name, artst_names, photo_url, playlist_location)
    database.addTrack(playlist_id, {'track_id': track_id, 'track_location': track_location})

    response = {"success": True}
    return jsonify(response)

@app.route('/playlists/', methods = ['GET'])
def isDownloaded():
    playlists = database.getDownloadedPlaylists()
    response = {"success": True, "playlists": playlists}
    return jsonify(response)

@app.route('/delete/<playlist>', methods = ['GET'])
def delete(playlist):
    if database.isPlaylistDownloaded(playlist):
        location_path = database.getPlaylistLocation(playlist)
        shutil.rmtree(location_path)
        database.removePlaylist(playlist)
        response = {"success": True}
        return jsonify(response)

    response = {"success": False}
    return jsonify(response)

@app.route('/refresh/playlist', methods = ['POST'])
def refresh():
    playlist_id = request.json['playlist_id']
    tracks = request.json['tracks']
    playlist_location = database.getPlaylistLocation(playlist_id)

    if not database.isPlaylistDownloaded(playlist_id):
        response = {"success": False}
        return jsonify(response)

    refreshed_tracks = []
    for track in tracks:
        refreshed_tracks.append(track['track']['id'])

    
    current_tracks_data = database.getPlaylistTracks(playlist_id)
    current_tracks = []
    for track in current_tracks_data:
        current_tracks.append(track['track_id'])
    
    new_tracks = list(set(refreshed_tracks) - set(current_tracks))

    for track in new_tracks:
        for data in tracks:
            if data['track']['id'] == track:
                track_details = data['track']
                track_name = re.sub('[^a-zA-Z0-9 ]', '', track_details['name'])
                track_id = track_details['id']
                artist_details = track_details['artists']
                artst_names = []

                for artist in artist_details:
                    artst_names.append(artist['name'])

                photo_url = track_details['album']['images'][0]['url']
                track_location = f'{playlist_location}/{track_name}.mp3'

                downloader.download_track(track_name, artst_names, photo_url, playlist_location)
                database.addTrack(playlist_id, {'track_id': track_id, 'track_location': track_location})
    
    remove_tracks = list(set(current_tracks) - set(refreshed_tracks))

    for track in remove_tracks:
        track_location = database.getTrackLocation(playlist_id, track)
        os.remove(track_location)
        database.removeTrack(playlist_id, track)

    response = {"success": True}
    return jsonify(response)


if __name__ == '__main__':
    app.run(port=8000)