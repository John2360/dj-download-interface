import React from 'react'

import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import SearchIcon from '@mui/icons-material/Search';



function SongSearch() {
  return (
    <div className='search-container'>
        <div className='search-bar'>
            <div className='search-bar-holder'>
                <input className='search-bar-bar input-field' placeholder='Search a song'/>
                <SearchIcon className='input-icon' />
            </div>
            <div className='search-results'>
                <Typography className='search-results-text'>No results have been found &#128557;</Typography>
            </div>
        </div>
    </div>
  )
}

export default SongSearch