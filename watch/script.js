const peerServerURL = "https://mux8.com/server.php";  // PHP-based signaling server
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
const screenShareBtn = document.getElementById("screen-share-btn");
const screenShareIcon = document.getElementById("screen-share-icon");

let micMuted = false;
let videoMuted = false;
let activePeers = {};  // To keep track of active peer feeds
let isScreenSharing = false;
let originalStream = null; // Store the original camera stream

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
    const peerId = peerIdInput.value.trim();
    if (!peerId) {
        return showError("Please enter a Peer ID.");
    }

    if (activePeers[peerId]) {
        return showError("This Peer ID is already added.");
    }

    const call = peer.call(peerId, localVideo.srcObject);
    call.on("stream", remoteStream => {
        if (!activePeers[peerId]) {
            addRemoteFeed(remoteStream, peerId);
        }
    });

    call.on("close", () => {
        removeRemoteFeed(peerId);
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

// Remove a remote video feed and update layout
function removeRemoteFeed(peerId) {
    const videoElement = activePeers[peerId];
    if (videoElement) {
        videoElement.remove();
        delete activePeers[peerId];
        console.log(`Removed feed for peer: ${peerId}`);
        arrangeVideoFeeds();
    }
}

// Check for inactive peers every 5 seconds
async function checkInactivePeers() {
    try {
        const response = await fetch(peerServerURL);
        const activePeerList = await response.json();

        // Compare with currently active peers
        for (const peerId in activePeers) {
            if (!activePeerList.includes(peerId)) {
                removeRemoteFeed(peerId);
                console.log(`Peer ${peerId} disconnected, removing feed.`);
            }
        }
    } catch (error) {
        console.error("Error checking inactive peers:", error);
    }
}

// Run the inactive peer check every 5 seconds
setInterval(checkInactivePeers, 5000);


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

async function toggleScreenShare() {
    if (!isScreenSharing) {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const videoTrack = screenStream.getVideoTracks()[0];

            // Store the original stream before replacing
            originalStream = localVideo.srcObject;
            localVideo.srcObject = screenStream;

            // Replace video track in existing peer connections
            for (const peerId in activePeers) {
                const sender = peer.connections[peerId]?.[0]?.peerConnection.getSenders().find(s => s.track.kind === "video");
                if (sender) {
                    sender.replaceTrack(videoTrack);
                }
            }

            // Handle when the user stops screen sharing
            videoTrack.onended = () => {
                toggleScreenShare(); // Automatically revert back
            };

            screenShareIcon.classList.remove("text-red-500");
            isScreenSharing = true;
        } catch (error) {
            showError("Screen sharing failed: " + error.message);
        }
    } else {
        // Revert back to original camera stream
        const videoTrack = originalStream.getVideoTracks()[0];
        localVideo.srcObject = originalStream;

        // Replace video track in existing peer connections
        for (const peerId in activePeers) {
            const sender = peer.connections[peerId]?.[0]?.peerConnection.getSenders().find(s => s.track.kind === "video");
            if (sender) {
                sender.replaceTrack(videoTrack);
            }
        }

        screenShareIcon.classList.add("text-red-500");
        isScreenSharing = false;
    }
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
    if (!textToCopy) return showError("No Peer ID available to copy!");

    navigator.clipboard.writeText(textToCopy).then(() => {
        copyBtn.innerHTML = '<i class="fas fa-check text-green-500"></i>'; // Success icon
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>'; // Restore copy icon
        }, 2000);
    }).catch(err => {
        showError("Error copying Peer ID: " + err);
    });
}

