const socket = null;

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const btnCall = document.getElementById("callBtn");
const btnMic = document.getElementById("toggleMic");
const btnCamera = document.getElementById("toggleCamera");
const btnHangUp = document.getElementById("hangUp");
const btnAccept = document.getElementById("acceptCall");
const btnDecline = document.getElementById("declineCall");
const incomingCallUI = document.getElementById("incomingCallUI");
const callingScreen = document.getElementById("callingScreen");
const userCountEl = document.getElementById("userCount");
const noticeEl = document.getElementById("notice");
let callTimeout = null;
let incomingCall = false;

let localStream;
let peerConnection;
let micOn = true;
let camOn = true;
let isCalling = false;

const myEmail = CURRENT_USER;
const peerEmail = TARGET_USER;

// Tạo room từ 2 người
const roomName = [myEmail, peerEmail].sort().join("_");

socket.emit("join-room", roomName, myEmail);
const config = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const ringtone = new Audio(
  "../../../sounds/Phép Màu (Đàn Cá Gỗ OST) - Mounter x MAYDAYs, Minh Tốc ｜ Official MV.mp3"
);
ringtone.loop = true;

if (users) {
  socket = io();
}

// -------------------- UI Helpers --------------------

function updateUserCount(count) {
  userCountEl.textContent = `Người đang online: ${count}`;
  if (count >= 1) {
    btnCall.classList.remove("hidden");
    noticeEl.classList.add("hidden");
  } else {
    btnCall.classList.add("hidden");
    noticeEl.classList.remove("hidden");
  }
}

function endCall() {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  isCalling = false;
  hideCallingScreen();
  hideIncomingCall();
  remoteVideo.srcObject = null;
  clearTimeout(callTimeout);
  window.close(); // Quay về trang trước
}

function showIncomingCall() {
  incomingCallUI.classList.remove("hidden");
  ringtone.play();
}

function hideIncomingCall() {
  incomingCallUI.classList.add("hidden");
  ringtone.pause();
}

function showCallingScreen() {
  callingScreen.classList.remove("hidden");
  ringtone.play();
}

function hideCallingScreen() {
  callingScreen.classList.add("hidden");
  ringtone.pause();
}

// -------------------- Media --------------------

const getMedia = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStream = stream;
    console.log(localStream);
    localVideo.srcObject = stream;
  } catch (err) {
    console.error("Lỗi truy cập media:", err);
    alert("Không thể truy cập camera/mic");
  }
};

// -------------------- Peer Connection --------------------

const createPeerConnection = async (isCaller) => {
  peerConnection = new RTCPeerConnection(config);

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = ({ streams: [stream] }) => {
    remoteVideo.srcObject = stream;
  };

  peerConnection.onicecandidate = ({ candidate }) => {
    if (candidate) {
      socket.emit("ice-candidate", candidate);
    }
  };

  if (isCaller) {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("offer", offer);
  }
};

// -------------------- Socket Events --------------------

socket.on("user-count", (count) => updateUserCount(count));

socket.on("offer", async (offer) => {
  incomingCall = true;
  showIncomingCall();

  btnAccept.onclick = async () => {
    hideIncomingCall();
    await getMedia(); // 👈 Đảm bảo đã có camera
    await createPeerConnection(false);
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("answer", answer);
    callingScreen.style.display = "none";
  };

  btnDecline.onclick = () => {
    hideIncomingCall();
    clearTimeout(callTimeout); // ✅ Đề phòng
    socket.emit("decline");
    endCall();
  };
});

socket.on("answer", async (answer) => {
  if (peerConnection) {
    await peerConnection.setRemoteDescription(answer);
    hideCallingScreen();
    clearTimeout(callTimeout); // ✅ Hủy timeout nếu có người nhận
  }
});
socket.on("ice-candidate", async (candidate) => {
  if (peerConnection) {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("Lỗi ICE:", err);
    }
  }
});

socket.on("decline", () => {
  alert("❌ Người kia đã từ chối cuộc gọi.");
  hideCallingScreen();
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
    window.close(); // Quay về trang trước
  }
});

// -------------------- UI Button Events --------------------

btnCall.onclick = async () => {
  if (isCalling) return;
  isCalling = true;

  await createPeerConnection(true);
  showCallingScreen();

  // ⏰ Nếu sau 60 giây chưa ai trả lời, tự hủy cuộc gọi
  callTimeout = setTimeout(() => {
    alert("⏳ Không có ai nhận cuộc gọi. Đã tự động hủy.");
    endCall();
  }, 60000);
};
btnHangUp.onclick = () => {
  socket.emit("decline");
  endCall();
};

btnMic.onclick = () => {
  micOn = !micOn;
  localStream.getAudioTracks()[0].enabled = micOn;
  btnMic.textContent = micOn ? "🔊" : "🔇";
};

btnCamera.onclick = () => {
  camOn = !camOn;
  localStream.getVideoTracks()[0].enabled = camOn;
  btnCamera.textContent = camOn ? "🎥" : "📷";
};

// -------------------- Start --------------------

getMedia();

// auto call
socket.on("connect", () => {
  if (socket.connected) {
    setTimeout(() => {
      if (!incomingCall) {
        // ✅ không tự gọi nếu đang có người gọi đến
        btnCall.click();
      }
    }, 1000);
  }
});
