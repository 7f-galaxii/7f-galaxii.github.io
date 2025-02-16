var songStarted = Math.floor(Date.now() / 1000);
var songLength = 999;
setInterval(updateSongTime, 1000);
function updateSongTime() {
    var timeString;
    var songElapsed = Math.floor(Date.now() / 1000) - songStarted;
    timeString = Math.floor(songElapsed/60).toString().padStart(2, '0') + ":" + (songElapsed % 60).toString().padStart(2, '0');
    timeString += " / ";
    timeString += Math.floor(songLength/60).toString().padStart(2, '0') + ":" + (songLength % 60).toString().padStart(2, '0');
    $(".song-time").html(timeString);
}

var player = document.getElementById('player');
var isPlaying = true;
togglePlaying();
player.onplay = function() { isPlaying = true; $("#play-button").html("<i class=\"fa-2x fa-solid fa-pause\"></i>"); }
function togglePlaying() {
    if (isPlaying == true) {
        player.pause();
        isPlaying = false;
        $("#play-button").html("<i class=\"fa-2x fa-solid fa-play\"></i>");
    } else {
        if (player.buffered.length != 0) {
            player.currentTime = player.buffered.end(0);
        }
        player.play();
    }
}
var volSlider = document.getElementById('volume');
volSlider.addEventListener("input", function(e) {
    player.volume = e.currentTarget.value;
});

let socket = new WebSocket("wss://radio.foxgirl.top/api/live/nowplaying/websocket");

socket.onopen = function(e) {
    socket.send(JSON.stringify({
        "subs": {
            "station:fangame_radio": {"recover": true}
        }
    }));
};

let nowplaying = {};
let currentTime = 0;

// Handle a now-playing event from a station. Update your now-playing data accordingly.
function handleSseData(ssePayload, useTime = true) {
    const jsonData = ssePayload.data;
    
    if (useTime && 'current_time' in jsonData) {
        currentTime = jsonData.current_time;
    }
    
    nowplaying = jsonData.np;
    $(".song-name").html(nowplaying.now_playing.song.title);
    $(".song-artist").html("by " + nowplaying.now_playing.song.artist);
    $(".game-list").html("Used in: " + nowplaying.now_playing.song.custom_fields.c_games);
    songStarted = nowplaying.now_playing.played_at;
    songLength = nowplaying.now_playing.duration;
}

socket.onmessage = function(e) {
    const jsonData = JSON.parse(e.data);
    
    if ('connect' in jsonData) {
        const connectData = jsonData.connect;
        
        if ('data' in connectData) {
            // Legacy SSE data
            connectData.data.forEach(
            (initialRow) => handleSseData(initialRow)
            );
        } else {
            // New Centrifugo time format
            if ('time' in connectData) {
                currentTime = Math.floor(connectData.time / 1000);
            }
            
            // New Centrifugo cached NowPlaying initial push.
            for (const subName in connectData.subs) {
                const sub = connectData.subs[subName];
                if ('publications' in sub && sub.publications.length > 0) {
                    sub.publications.forEach((initialRow) => handleSseData(initialRow, false));
                }
            }
        }
    } else if ('pub' in jsonData) {
        handleSseData(jsonData.pub);
    }
};