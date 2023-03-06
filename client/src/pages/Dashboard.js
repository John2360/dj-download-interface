import React, {useEffect} from 'react'
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import PlaylistTile from '../components/PlaylistTile';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Checkbox from '@mui/material/Checkbox';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';

import { postDownloadPlaylist, refreshPlaylist } from '../services/spotify';


function Dashboard(props) {
    const { playlists, token, updatePlaylistsStatus } = props;

    const [playlistID, setPlaylistID] = React.useState({});
    const [saveLocation, setSaveLocation] = React.useState("");
    const [search, setSearch] = React.useState("");
    const [filterStatus, setFilterStatus] = React.useState(false);
    const [alerts, setAlerts] = React.useState([]);

    const addAlert = (alert) => {
        setAlerts(prevState => [...prevState, alert]);
    }

    useEffect(() => {
        playlists.forEach(playlist => {
            if (playlist.status === "downloaded"){
                refreshPlaylist(token, playlist.id, updatePlaylistsStatus, addAlert);
            }
        });

    }, []);

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        display: 'flex',
        flexDirection: 'column',
      };

    return (
        <div>
            { 
            alerts.length > 0 && 
                <Snackbar open={true} autoHideDuration={3000} onClose={() => {setAlerts([])}} >
                    <Alert onClose={false} severity={alerts[alerts.length-1].type} sx={{ width: '100%' }}>
                        {alerts[alerts.length-1].message}
                    </Alert>
                </Snackbar>
            }
            { Object.keys(playlistID).length > 0 &&
            <Modal
                open={Object.keys(playlistID).length > 0}
                onClose={() => setPlaylistID({})}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                        Ready to Download
                    </Typography>
                    <Box id="modal-modal-description"  sx={{mt: 2}}>
                        <Typography id="modal-modal-description">We are almost ready to download <i><b>{playlistID.name}</b></i> to your computer. Please select a folder to save the tracks to.</Typography>
                        <div style={{display: 'flex', flexDirection: 'row', alignContent: 'center', justifyContent: 'flex-start', marginTop: 15}}>
                            <TextField label="Playlist Folder Path" onChange={e => setSaveLocation(e.target.value)} variant="outlined" fullWidth defaultValue={`./downloads/${playlistID.name.replaceAll("[^A-Za-z0-9]","")}`} />
                        </div>
                        <div style={{display: 'flex', flexDirection: 'row', alignContent: 'center', justifyContent: 'flex-end', marginTop: 15}}>
                            <Button variant='contained' onClick={() => {updatePlaylistsStatus(playlistID.id, "loading"); postDownloadPlaylist(token, playlistID.id, saveLocation !== "" ? saveLocation : `./downloads/${playlistID.name.replaceAll("[^A-Za-z0-9]","")}`, addAlert, updatePlaylistsStatus); setPlaylistID({})}}>Start Download</Button>
                        </div>
                    </Box>
                </Box>
            </Modal>
        }
        <Card>
            <CardHeader
                title="Library Manager"
                subheader={`${playlists.length} playlists loaded from Spotify`}
            />
        <CardContent>
            <Box sx={{display: 'flex', flexDirection: 'row', paddingBottom: 3, paddingLeft: 4, paddingRight: 4, justifyContent: 'center', alignContent: 'center'}}>
                <TextField
                    id="input-with-icon-textfield"
                    label="Search All Playlists"
                    InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                    }}
                    variant="outlined"
                    sx={{flexGrow: 2}}
                    onChange={e => setSearch(e.target.value)}
                />
                <div style={{width: 100, display: 'flex', justifyContent: 'center', alignContent: 'center'}}>
                    <Checkbox onClick={() => setFilterStatus(!filterStatus)}  icon={<DownloadForOfflineIcon sx={{fontSize: '3rem'}} />} checkedIcon={<DownloadForOfflineIcon sx={{fontSize: '3rem'}} />}  />
                </div>
            </Box>
            <Box sx={{flexWrap: 'wrap', display: 'flex', gap: 5, alignContent: 'center', justifyContent: 'center'}}>
                {
                    playlists.filter((playlist) => {return playlist.name.toLowerCase().includes(search.toLowerCase())}).filter((playlist) => {return filterStatus ? playlist.status == "downloaded" || playlist.status == "loading" : true}).map((playlist, index) => {
                        return (
                            <PlaylistTile key={index} item={playlist} setPlaylistID={setPlaylistID} status={playlist.status} updatePlaylistsStatus={updatePlaylistsStatus} addAlert={addAlert} token={token}  />
                        )
                    })
                }
            </Box>
        </CardContent>
        </Card>
        </div>
    )
}

export default Dashboard