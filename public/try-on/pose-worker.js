/* MediaPipe runs off the UI thread. Only same-origin runtime/model assets load. */
/* global Vision */
importScripts("/try-on/vision/vision_bundle.js");
let detector;
self.onmessage = async ({ data }) => {
  try {
    if (data.type === "init") {
      const files = await Vision.FilesetResolver.forVisionTasks("/try-on/vision");
      detector = await Vision.PoseLandmarker.createFromOptions(files, {
        baseOptions: { modelAssetPath: "/try-on/pose_landmarker_lite.task", delegate: "CPU" },
        runningMode: "VIDEO", numPoses: 2,
        minPoseDetectionConfidence: 0.5, minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5, outputSegmentationMasks: false,
      });
      self.postMessage({ type: "ready" });
    } else if (data.type === "frame" && detector) {
      try {
        const result = detector.detectForVideo(data.image, data.time);
        self.postMessage({ type: "poses", landmarks: result.landmarks });
      } finally { data.image.close(); }
    }
  } catch (cause) {
    if (data.image) data.image.close();
    self.postMessage({ type: "error", reason: cause instanceof Error ? cause.message : String(cause) });
  }
};
