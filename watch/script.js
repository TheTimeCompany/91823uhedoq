const peerServerURL = "http://mux8.com/server.php";  // PHP-based signaling server
const peer = new Peer();

// Elements
const localVideo = document.getElementById("local-video");
const remoteVideo = document.getElementById("remote-video");
const peerIdInput = document.getElementById("peer-id-input");
const myPeerIdElement = document.getElementById("my-peer-id");
const micIcon = document.getElementById("mic-icon");
const videoIcon = document.getElementById("video-icon");
const micBtn = document.getElementById("mic-btn");
const videoBtn = document.getElementById("video-btn");
const copyBtn = document.getElementById("copy-id");

// Get user media
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localVideo.srcObject = stream;

        peer.on("call", call => {
            call.answer(stream);
            call.on("stream", remoteStream => remoteVideo.srcObject = remoteStream);
        });
    })
    .catch(error => console.error("Error accessing media devices:", error));

// Call peer function
function callPeer() {
    const peerId = peerIdInput.value;
    if (!peerId) return alert("Enter a Peer ID to call!");

    const call = peer.call(peerId, localVideo.srcObject);
    call.on("stream", remoteStream => remoteVideo.srcObject = remoteStream);

    // Truncate peer ID to 6 digits
    if (peerId.length > 6) {
        alert("Peer ID should be 6 digits or less!");
        return;
    }
}

// Save Peer ID to PHP server
peer.on("open", id => {
    // Display truncated Peer ID (first 6 digits)
    myPeerIdElement.innerText = id.substring(0, 6);

    fetch(peerServerURL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "peerId=" + encodeURIComponent(id)
    })
    .then(response => response.json())
    .then(data => console.log("Peer ID stored:", data))
    .catch(error => console.error("Error storing Peer ID:", error));
});

// Copy peer ID to clipboard
copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(myPeerIdElement.innerText);
    alert("ID copied to clipboard!");
});

// Toggle mic on/off
let micMuted = false;
function toggleMic() {
    const stream = localVideo.srcObject;
    const audioTrack = stream.getAudioTracks()[0];
    if (micMuted) {
        audioTrack.enabled = true;
        micIcon.classList.replace("fa-microphone-slash", "fa-microphone");
    } else {
        audioTrack.enabled = false;
        micIcon.classList.replace("fa-microphone", "fa-microphone-slash");
    }
    micMuted = !micMuted;
}

// Toggle video on/off
let videoMuted = false;
function toggleVideo() {
    const stream = localVideo.srcObject;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoMuted) {
        videoTrack.enabled = true;
        videoIcon.classList.replace("fa-video-slash", "fa-video");
    } else {
        videoTrack.enabled = false;
        videoIcon.classList.replace("fa-video", "fa-video-slash");
    }
    videoMuted = !videoMuted;
}

// Handle disconnection if video feed drops
remoteVideo.on("error", () => {
    peer.disconnect();
});
