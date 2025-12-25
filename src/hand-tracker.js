/**
 * Hand Tracking Manager using MediaPipe Hands
 * Handles webcam input and hand landmark detection
 */

import { Camera } from '@mediapipe/camera_utils';
import { Hands } from '@mediapipe/hands';

export class HandTracker {
    constructor(videoElement, onResults) {
        this.videoElement = videoElement;
        this.onResultsCallback = onResults;
        this.camera = null;
        this.hands = null;
        this.isActive = false;

        this.initMediaPipe();
    }

    initMediaPipe() {
        // Initialize MediaPipe Hands
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.5
        });

        this.hands.onResults((results) => {
            if (this.onResultsCallback) {
                this.onResultsCallback(results);
            }
        });
    }

    async start() {
        if (this.isActive) return;

        try {
            // Initialize camera
            this.camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    await this.hands.send({ image: this.videoElement });
                },
                width: 1280,
                height: 720
            });

            await this.camera.start();
            this.isActive = true;
            return true;
        } catch (error) {
            console.error('Failed to start camera:', error);
            throw new Error('Camera access denied or not available');
        }
    }

    async stop() {
        if (!this.isActive) return;

        try {
            if (this.camera) {
                await this.camera.stop();
            }

            // Stop all video tracks
            const stream = this.videoElement.srcObject;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                this.videoElement.srcObject = null;
            }

            this.isActive = false;
        } catch (error) {
            console.error('Error stopping camera:', error);
        }
    }

    /**
     * Extract 3D position from hand landmarks
     * @param {Array} landmarks - MediaPipe hand landmarks
     * @param {number} landmarkIndex - Index of landmark to extract (default: 8 = index finger tip)
     * @returns {Object} 3D position {x, y, z}
     */
    static getLandmarkPosition(landmarks, landmarkIndex = 8) {
        if (!landmarks || landmarks.length <= landmarkIndex) {
            return null;
        }

        const landmark = landmarks[landmarkIndex];
        return {
            x: landmark.x,
            y: landmark.y,
            z: landmark.z
        };
    }

    /**
     * Map normalized MediaPipe coordinates to 3D world space
     * @param {Object} normalized - Normalized position {x, y, z} (0-1 range)
     * @param {number} scale - Scale factor for mapping
     * @returns {Object} World position {x, y, z}
     */
    static mapToWorldSpace(normalized, scale = 1.5) {
        // MediaPipe coordinates:
        // x: 0 (left) to 1 (right)
        // y: 0 (top) to 1 (bottom)
        // z: depth (negative = closer to camera)

        // Map to world space
        // Invert X for mirrored effect
        const x = (0.5 - normalized.x) * 20 * scale;

        // Invert Y (1 is bottom in MediaPipe)
        const y = (1 - normalized.y) * 20 * scale;

        // Map depth
        const z = -normalized.z * 20 * scale + 10;

        return {
            x: Math.max(-15, Math.min(15, x)),
            y: Math.max(2, Math.min(25, y)),
            z: Math.max(-5, Math.min(20, z))
        };
    }

    dispose() {
        this.stop();
        if (this.hands) {
            this.hands.close();
        }
    }
}

/**
 * Available MediaPipe Hand Landmarks
 */
export const HandLandmarks = {
    WRIST: 0,
    THUMB_CMC: 1,
    THUMB_MCP: 2,
    THUMB_IP: 3,
    THUMB_TIP: 4,
    INDEX_FINGER_MCP: 5,
    INDEX_FINGER_PIP: 6,
    INDEX_FINGER_DIP: 7,
    INDEX_FINGER_TIP: 8,
    MIDDLE_FINGER_MCP: 9,
    MIDDLE_FINGER_PIP: 10,
    MIDDLE_FINGER_DIP: 11,
    MIDDLE_FINGER_TIP: 12,
    RING_FINGER_MCP: 13,
    RING_FINGER_PIP: 14,
    RING_FINGER_DIP: 15,
    RING_FINGER_TIP: 16,
    PINKY_MCP: 17,
    PINKY_PIP: 18,
    PINKY_DIP: 19,
    PINKY_TIP: 20
};
