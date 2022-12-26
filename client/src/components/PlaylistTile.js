import React, {useState} from 'react'
import Card from '@mui/material/Card';
import { IconButton, Menu, Typography, MenuItem, Box, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { deletePlaylist, refreshPlaylist } from '../services/spotify';

function PlaylistTile(props) {
  const { item, setPlaylistID, status, updatePlaylistsStatus, addAlert, token } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', height: 300, width: 300 }}>
      <Typography variant="h4" color="white" sx={{ textAlign: 'center', zIndex: 5, fontWeight: "bolder", padding: 2, fontSize: '2.5rem'}}>{item.name}</Typography>
      {
        status === "loading" ?  <CircularProgress thickness={6} sx={{position: 'absolute', zIndex: 2, top: 10, right: 10, color: 'white'}} /> : null
      }
      {
        status === "downloaded" ? <div>
        <IconButton
          sx={{position: 'absolute', zIndex: 2, top: 10, right: 10, borderRadius: 1, backdropFilter: "blur(8px)", backgroundColor: "rgba(255, 255, 255, .3)"}}
          id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        >
          <MoreVertIcon sx={{ color: 'white', fontSize: '3rem'}} />
        </IconButton>
        <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem sx={{width: 100}} onClick={() => {refreshPlaylist(token, item.id, updatePlaylistsStatus, addAlert); handleClose()}}>Refresh</MenuItem>
        <MenuItem onClick={() => {deletePlaylist(item.id, updatePlaylistsStatus, addAlert); handleClose()}}>Delete</MenuItem>
      </Menu>
        </div> : null
      }
      {
        status !== "loading" && status !== "downloaded" ? 
        <IconButton sx={{position: 'absolute', zIndex: 2, top: 10, right: 10, borderRadius: 1, backdropFilter: "blur(8px)", backgroundColor: "rgba(255, 255, 255, .3)"}} onClick={() => setPlaylistID({id: item.id, name: item.name})} >
          <DownloadIcon sx={{ color: 'white', fontSize: '3rem'}} />
        </IconButton> : null
      }
      <Box sx={{position: 'absolute', top: 0, left: 0, width: 300, height: 300, zIndex: 1, backgroundColor: "rgba(0,0,0,.5)"}}></Box>
      <Box sx={{position: 'absolute', top: 0, left: 0, width: 300, height: 300, backgroundImage: `url(${item.images[0].url})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', filter: "blur(2px)" }}></Box>
    </Card>
  )
}

export default PlaylistTile