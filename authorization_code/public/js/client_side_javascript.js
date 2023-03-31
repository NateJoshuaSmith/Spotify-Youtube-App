// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement("script");

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "390",
    width: "640",
    videoId: "M7lc1UVf-VE",
    playerVars: {
      playsinline: 1,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  console.log("onPlayerReady");
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING && !done) {
    setTimeout(stopVideo, 600000);
    done = true;
  }
}
function stopVideo() {
  player.stopVideo();
}

//Youtube search and play
document.getElementById("youtube-search-button").addEventListener(
  "click",
  async function () {
    var videoName = document.getElementById("video-name").value;

    var data = { videoName: videoName };

    await fetch("search_youtube", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => player.loadVideoById(data.videoId, 0));
  },
  false
);

//not entirely sure where I should put these variables. There kinda acting like global variables in my head.
var combinedPlaylists = [];
var index = 0;

//Youtube search and combine into playlist
document.getElementById("youtube-search-button-combination").addEventListener(
  "click",
  async function () {
    var videoName = document.getElementById("youtube-video-name").value;

    var data = { videoName: videoName };

    await fetch("search_youtube", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => combinedPlaylists.push(data));
  },
  false
);

//Spotify search and combine into playlist
document.getElementById("spotify-search-button-combination").addEventListener(
  "click",
  async function () {
    var trackName = document.getElementById("spotify-song-name").value;

    var data = { trackName: trackName };

    await fetch("search_spotify_track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => combinedPlaylists.push(data));
  },
  false
);

//next button
document.getElementById("next-button").addEventListener(
  "click",
  async function () {
    if ((index + 1) % combinedPlaylists.length == 0) {
      index = 0;
    } else {
      index++;
    }

    play(index);
  },
  false
);

//previous button
document.getElementById("previous-button").addEventListener(
  "click",
  async function () {
    if (index == 0) {
      index = combinedPlaylists.length - 1;
    } else {
      index--;
    }

    play(index);
  },
  false
);

//play the combined playlist
document.getElementById("play-combined-playlist").addEventListener(
  "click",
  async function () {
    play(index);
  },
  false
);

//plays spotify or youtube track. Used for the next and previous buttons
async function play(index) {
  var playerState = player.getPlayerState();

  if (combinedPlaylists[index].application == "youtube") {
    if (
      playerState == YT.PlayerState.PAUSED ||
      playerState == -1 ||
      playerState == YT.PlayerState.CUED
    ) {
      await fetch("pause_spotify");
    }

    player.loadVideoById(combinedPlaylists[index].id, 0);
  }

  if (combinedPlaylists[index].application == "spotify") {
    if (player.getPlayerState() == YT.PlayerState.PLAYING) {
      player.pauseVideo();
    }

    var data = { trackUri: combinedPlaylists[index].id };

    await fetch("play_spotify_track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => console.log("success"));
  }
}

//searching for a track
document.getElementById("search-button").addEventListener(
  "click",
  function () {
    var trackName = document.getElementById("track-name").value;

    var data = { trackName: trackName };

    fetch("search_track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  },
  false
);

//creating a playlist
document.getElementById("create-playlist").addEventListener(
  "click",
  function () {
    fetch("/test_youtube");

    var playlistName = document.getElementById("playlist-name").value;

    var data = { playlistName: playlistName };

    fetch("create_playlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  },
  false
);
