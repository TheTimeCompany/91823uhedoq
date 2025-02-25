const peerServerURL = "http://mux8.com/server.php";  // PHP-based signaling server
const peer = new Peer();

// Elements
const localVideo = document.getElementById("local-video");
const remoteVideosGrid = document.getElementById("video-grid");
const peerIdInput = document.getElementById("peer-id-input");
const myPeerIdElement = document.getElementById("my-peer-id");
const micIcon = document.getElementById("mic-icon");
const videoIcon = document.getElementById("video-icon");
const micBtn = document.getElementById("mic-btn");
const videoBtn = document.getElementById("video-btn");
const copyBtn = document.getElementById("copy-id");
const errorMessage = document.getElementById("error-message");
const errorText = document.getElementById("error-text");

let micMuted = false;
let videoMuted = false;
let activePeers = {};  // To keep track of active peer feeds

// Get user media
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localVideo.srcObject = stream;

        peer.on("call", call => {
            call.answer(stream);
            call.on("stream", remoteStream => {
                const peerId = call.peer;
                if (!activePeers[peerId]) {
                    addRemoteFeed(remoteStream, peerId);
                }
            });
        });
    })
    .catch(error => showError("Error accessing media devices: " + error));

// Add Peer by ID
function addPeer() {
    const peerId = peerIdInput.value;
    if (!peerId) {
        return showError("Please enter a Peer ID.");
    }

    if (activePeers[peerId]) {
        return showError("This Peer ID is already added.");
    }

    const call = peer.call(peerId, localVideo.srcObject);
    call.on("stream", remoteStream => {
        const peerId = call.peer;
        if (!activePeers[peerId]) {
            addRemoteFeed(remoteStream, peerId);
        }
    });
}

// Save Peer ID to PHP server
peer.on("open", id => {
    myPeerIdElement.innerText = id;
    fetch(peerServerURL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "peerId=" + encodeURIComponent(id)
    })
    .then(response => response.json())
    .catch(error => console.error("Error storing Peer ID:", error));
});

// Add remote video feed
function addRemoteFeed(remoteStream, peerId) {
    const newVideo = document.createElement("video");
    newVideo.classList.add("video-frame");
    newVideo.srcObject = remoteStream;
    newVideo.autoplay = true;
    remoteVideosGrid.appendChild(newVideo);

    // Store the peer's video feed
    activePeers[peerId] = newVideo;
    arrangeVideoFeeds();
}

// Remove a remote video feed
function removeRemoteFeed(peerId) {
    const videoElement = activePeers[peerId];
    if (videoElement) {
        videoElement.remove();
        delete activePeers[peerId];
        arrangeVideoFeeds();
    }
}

// Handle peer disconnections
peer.on("disconnected", () => {
    for (let peerId in activePeers) {
        removeRemoteFeed(peerId);
    }
});

// Arrange video feeds dynamically
function arrangeVideoFeeds() {
    const videos = remoteVideosGrid.querySelectorAll("video");
    const totalVideos = videos.length + 1; // Including local video
    const cols = Math.min(Math.ceil(Math.sqrt(totalVideos)), 3); // Maximum 3 columns
    const rows = Math.ceil(totalVideos / cols);

    remoteVideosGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    remoteVideosGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
}

// Toggle mic
function toggleMic() {
    const stream = localVideo.srcObject;
    const audioTrack = stream.getAudioTracks()[0];
    if (micMuted) {
        audioTrack.enabled = true;
        micIcon.classList.remove("text-red-500");
    } else {
        audioTrack.enabled = false;
        micIcon.classList.add("text-red-500");
    }
    micMuted = !micMuted;
}

// Toggle video
function toggleVideo() {
    const stream = localVideo.srcObject;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoMuted) {
        videoTrack.enabled = true;
        videoIcon.classList.remove("text-red-500");
    } else {
        videoTrack.enabled = false;
        videoIcon.classList.add("text-red-500");
    }
    videoMuted = !videoMuted;
}

// Show error message
function showError(message) {
    errorText.innerText = message;
    errorMessage.classList.remove("hidden");
    setTimeout(() => errorMessage.classList.add("hidden"), 5000);
}

// Copy Peer ID to clipboard
function copyID() {
    const textToCopy = myPeerIdElement.innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert("Peer ID copied to clipboard!");
    }).catch(err => {
        showError("Error copying Peer ID: " + err);
    });
}
