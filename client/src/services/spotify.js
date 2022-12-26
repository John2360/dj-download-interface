const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;
const AUTH_ENDPOINT = process.env.REACT_APP_AUTH_ENDPOINT;
const RESPONSE_TYPE = process.env.REACT_APP_RESPONSE_TYPE;

export const getLoginToken = (setToken) => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    if (!token && hash) {
        token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

        window.location.hash = ""
        window.localStorage.setItem("token", token)
    }

    setToken(token);
}

export const clearLoginToken = (setToken) => {
    setToken(null);
    window.localStorage.removeItem("token");
}

export const getLoginLink = () => {
    return `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&show_dialog=true&scope=playlist-read-private,playlist-read-collaborative,user-read-private,user-library-read`;
}

export const isSpotifyAlive = async (token) => {
    const settings = {
        headers: {'Authorization': 'Bearer ' + token}
    }
    const response = await fetch('https://api.spotify.com/v1/me', settings);
    const data = await response.json()
    
    return {success: data.hasOwnProperty('error') ? false : true, id: data?.id};
}

export const getUserPlaylists = async (token, userId, playlists, setPlaylists) => {
    const settings = {
        headers: {'Authorization': 'Bearer ' + token}
    }
    const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', settings);
    const data = await response.json();
    const loop_times = (data.total-50)/50;

    const downloaded_playlists = (await getDownloadedPlaylists()).playlists;
    
    let playlist_items = data.items;
    for (let i = 0; i < playlist_items.length; i++) {
        playlist_items[i].status = downloaded_playlists.includes(playlist_items[i].id) ? "downloaded" : "idle";
    }
    setPlaylists(playlist_items);

    for (let i = 0; i < loop_times; i++) {
        const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50&offset='+((i+1)*50).toString(), settings);
        const data = await response.json();
        // setPlaylists(playlists => [...playlists, ...data.items]);
        
        let playlist_items = data.items;
        for (let i = 0; i < playlist_items.length; i++) {
            playlist_items[i].status = downloaded_playlists.includes(playlist_items[i].id) ? "downloaded" : "idle";
        }
        setPlaylists(playlists => [...playlists, ...playlist_items]);
    }

    return {success: data.hasOwnProperty('error') ? false : true, playlists: data?.items};
}

export const getPlaylistTracks = async (token, playlistId) => {
    const settings = {
        headers: {'Authorization': 'Bearer ' + token}
    }

    const response = await fetch('https://api.spotify.com/v1/playlists/'+playlistId+'/tracks', settings);
    const data = await response.json();
    const offset = 100;
    const loop_times = (data.total-offset)/offset;

    let tracks = data.items;

    for (let i = 0; i < loop_times; i++) {
        const response = await fetch('https://api.spotify.com/v1/playlists/'+playlistId+'/tracks?offset='+((i+1)*offset).toString(), settings);
        const data = await response.json();
        tracks = tracks.concat(data.items);
    }

    return {success: data.hasOwnProperty('error') ? false : true, tracks: tracks};
}

export const postDownloadPlaylist = async (token, playlistId, playlistLocation, addAlert, updatePlaylistStatus) => {
    // check if spotify active before doing this

    const tracks = await getPlaylistTracks(token, playlistId);

    addAlert({id: playlistId, type: "info", message: `Beginning playlist download shortly`, time: Date.now()});
    let error = false;
    
    for (let i = 0; i < tracks.tracks.length; i++) {
        const settings = {
            method: 'POST',
            mode: 'cors',
            crossDomain: true,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"playlist_id": playlistId, "playlist_location": playlistLocation, "tracks": tracks.tracks[i]})
        }

        const response = await fetch('http://127.0.0.1:8000/download/playlist', settings);
        const data = await response.json()
        error = data.hasOwnProperty('error') ? true : false

        addAlert({id: playlistId, type: "info", message: `Downloading track ${i+1} of ${tracks.tracks.length}`, time: Date.now()});
    }

    updatePlaylistStatus(playlistId, "downloaded");
    addAlert({id: playlistId, type: "success", message: "Playlist downloaded successfully", time: Date.now()});

    return {success: error};
}

export const getDownloadedPlaylists = async () => {
    const response = await fetch('http://127.0.0.1:8000/playlists/');
    const data = await response.json();
    return {success: data.hasOwnProperty('error') ? false : true, playlists: data?.playlists};
}

export const deletePlaylist = async (playlistId, updatePlaylistsStatus, addAlert) => {
    const response = await fetch('http://127.0.0.1:8000/delete/'+playlistId);
    const data = await response.json();
    addAlert({id: playlistId, type: "success", message: "Playlist deleted successfully", time: Date.now()});
    updatePlaylistsStatus(playlistId, "idle");
    return {success: data.hasOwnProperty('error') ? false : true};
}

export const refreshPlaylist = async (token, playlistId, updatePlaylistsStatus, addAlert) => {
    addAlert({id: playlistId, type: "info", message: `Beginning playlist refresh shortly`, time: Date.now()});
    updatePlaylistsStatus(playlistId, "loading");
    const refreshed_tracks = await getPlaylistTracks(token, playlistId);

    const settings = {
        method: 'POST',
        mode: 'cors',
        crossDomain: true,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"playlist_id": playlistId, "tracks": refreshed_tracks.tracks})
    }

    const response = await fetch('http://127.0.0.1:8000/refresh/playlist', settings);
    const data = await response.json()

    updatePlaylistsStatus(playlistId, "downloaded");
    addAlert({id: playlistId, type: "success", message: "Playlist refreshed successfully", time: Date.now()});
    return {success: data.hasOwnProperty('error') ? false : true};
}