import React, { useEffect, useCallback } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import './assets/css/app.css'

import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';

import theme from './themes/theme'

import Dashboard from './pages/Dashboard'
import { isSpotifyAlive, getLoginLink, getLoginToken, clearLoginToken, getUserPlaylists, isDownloaded } from './services/spotify'

function App() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [needAuth, setNeedAuth] = React.useState(false);
    const [spotifyID, setSpotifyID] = React.useState(null);
    const [token, setToken] = React.useState(null);
    const [playlists, setPlaylists] = React.useState([]);

    const updatePlaylistsStatus = (id, value) => {
        setPlaylists(playlists.map((playlist) => {
            if (playlist.id === id) {
                playlist.status = value;
            }
            return playlist;
        }))
    }

    // on load
    useEffect(() => {
        // check for token
        getLoginToken(setToken);

        if (token === null) {
            setIsLoading(false);
            setNeedAuth(true);
        }
    }, []);

    // on token change
    const fetchAlive = useCallback( async() => {
        const data = await isSpotifyAlive(token);

        if (data.success) {
            setSpotifyID(data.id);
            setIsLoading(true);
            setNeedAuth(false);
        } else if (!data.success && token !== null) {
            clearLoginToken(setToken);
            setIsLoading(false);
            setNeedAuth(true);
        }


    }, [token])
    
    // on api result
    useEffect(() => {
        // check if API is alive
        fetchAlive();
        
    }, [fetchAlive]);

    // // on spotify id change
    const fetchPlaylists = useCallback( async() => {
        const data = await getUserPlaylists(token, spotifyID, playlists, setPlaylists);
        
        if (data.success) {
            setIsLoading(false);
        }
    }, [spotifyID])

    // on playlists result
    useEffect(() => {
        // check if API is alive
        fetchPlaylists();
        
    }, [fetchPlaylists]);


    return (
        <ThemeProvider theme={theme}>
            <AppBar position="static" color="primary">
            <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                    <MusicNoteIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                    DJ Downloader Tool
                </Typography>
                </Toolbar>
            </AppBar>
            <Container>
                <Box sx={{padding: 5}}>
                    {
                        isLoading && !needAuth ? <div style={{display: 'flex', justifyContent: 'center', alignContent: 'center'}}><CircularProgress thickness={5} className='progress-size' /></div> : null
                    }
                    {
                        needAuth && !isLoading ? 
                        <Dialog
                            open={needAuth}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <DialogTitle id="alert-dialog-title">
                            {"Authenticate with Spotify"}
                            </DialogTitle>
                            <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                To use the DJ Downloader Tool, you must authenticate with Spotify. Click the button below to authenticate.
                            </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                            <Button href={getLoginLink()}>
                                Authenticate
                            </Button>
                            </DialogActions>
                        </Dialog> : null
                    }
                    {
                        !isLoading && !needAuth ? <Dashboard playlists={playlists} token={token} updatePlaylistsStatus={updatePlaylistsStatus} /> : null
                    }
                </Box>
            </Container>
        </ThemeProvider>
    )
}

export default App