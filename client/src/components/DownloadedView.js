import React from 'react'

function DownloadedView(props) {
  const { playlists } = props;
  return (
    <div className='downloaded-container'>
        <div className='downloaded-list'>
            {playlists.length > 0 ? (playlists.map((playlist) => {
              console.log(playlist);
            })) : "Loaaddding"}
        </div>
    </div>
  )
}

export default DownloadedView