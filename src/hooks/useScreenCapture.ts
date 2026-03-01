import { useState, useRef, useCallback } from "react";

export function useScreenCapture() {
  const [isSharing, setIsSharing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      // Create hidden video element
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      await video.play();
      videoRef.current = video;

      setIsSharing(true);

      // Listen for user stopping share
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        stopCapture();
      });
    } catch (err) {
      console.error("Screen capture error:", err);
      setIsSharing(false);
    }
  }, []);

  const stopCapture = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current = null;
    }
    setIsSharing(false);
  }, []);

  const captureSnapshot = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video) return null;

    const canvas = document.createElement("canvas");
    // Compress: resize to max 800px wide
    const scale = Math.min(1, 800 / video.videoWidth);
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // JPEG at 60% quality for fast transfer
    const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
    return dataUrl.split(",")[1]; // return base64 only
  }, []);

  return { isSharing, startCapture, stopCapture, captureSnapshot };
}
