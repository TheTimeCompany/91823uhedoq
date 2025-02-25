const peerServerURL = "http://mux8.com/server.php";  // PHP-based signaling server

// Use default PeerJS settings (no custom signaling server needed)
const peer = new Peer();

const localVideo = document.getElementById("local-video");
const remoteVideo = document.getElementById("remote-video");

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

function callPeer() {
    const peerId = document.getElementById("peer-id-input").value;
    if (!peerId) return alert("Enter a Peer ID to call!");

    const call = peer.call(peerId, localVideo.srcObject);
    call.on("stream", remoteStream => remoteVideo.srcObject = remoteStream);
}

// Save Peer ID to PHP server
peer.on("open", id => {
    document.getElementById("my-peer-id").innerText = id;

    fetch(peerServerURL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "peerId=" + encodeURIComponent(id)
    })
    .then(response => response.json())
    .then(data => console.log("Peer ID stored:", data))
    .catch(error => console.error("Error storing Peer ID:", error));
});

// Fetch Available Peers from PHP Server
async function fetchPeers() {
    try {
        let response = await fetch(peerServerURL);
        let peerList = await response.json();
        alert("Available Peers: " + peerList.join(", "));
    } catch (error) {
        console.error("Error fetching peers:", error);
    }
}
