from tinydb import TinyDB, Query

class Database:

    def __init__(self, db_location):
        self.db = TinyDB(db_location)

    def isPlaylistDownloaded(self, playlist_id):
        Playlist = Query()
        return len(self.db.search(Playlist.playlist_id == playlist_id)) > 0

    def getDownloadedPlaylists(self):
        id_list = []

        for playlist in self.db.all():
            id_list.append(playlist['playlist_id'])

        return id_list

    def addPlaylist(self, playlist_id, playlist_location, track_list):
        self.db.insert({'playlist_id': playlist_id, 'playlist_location': playlist_location, 'tracks': track_list})

    def removePlaylist(self, playlist_id):
        Playlist = Query()
        self.db.remove(Playlist.playlist_id == playlist_id)

    def getPlaylistLocation(self, playlist_id):
        Playlist = Query()
        return self.db.search(Playlist.playlist_id == playlist_id)[0]['playlist_location']

    def addTrack(self, playlist_id, track):
        Playlist = Query()
        new_tracks = self.db.search(Playlist.playlist_id == playlist_id)[0]['tracks']+[track]
        self.db.update({'tracks': new_tracks}, Playlist.playlist_id == playlist_id)

    def removeTrack(self, playlist_id, track):
        Playlist = Query()
        new_tracks = [x for x in self.db.search(Playlist.playlist_id == playlist_id)[0]['tracks'] if x['track_id'] != track]
        self.db.update({'tracks': new_tracks}, Playlist.playlist_id == playlist_id)

    def getPlaylistTracks(self, playlist_id):
        Playlist = Query()
        return self.db.search(Playlist.playlist_id == playlist_id)[0]['tracks']

    def getTrackLocation(self, playlist_id, track_id):
        Playlist = Query()
        tracks = self.db.search(Playlist.playlist_id == playlist_id)[0]['tracks']
        for track in tracks:
            if track['track_id'] == track_id:
                return track['track_location']