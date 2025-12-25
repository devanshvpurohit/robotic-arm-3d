/**
 * Inverse Kinematics Solver for 3-DOF Robotic Arm
 * Solves arm position using analytical IK for a 2-link planar arm with base rotation
 */

export class IKSolver {
    constructor(config = {}) {
        this.baseHeight = config.baseHeight || 4;
        this.lowerArmLength = config.lowerArmLength || 12;
        this.upperArmLength = config.upperArmLength || 10;
        this.maxReach = this.lowerArmLength + this.upperArmLength;
        this.minReach = Math.abs(this.lowerArmLength - this.upperArmLength);
    }

    /**
     * Solve inverse kinematics for target position
     * @param {Object} target - Target position {x, y, z}
     * @returns {Object} Joint angles {base, shoulder, elbow}
     */
    solve(target) {
        // Step 1: Calculate base rotation (yaw) - rotation around Y axis
        const baseAngle = Math.atan2(target.x, target.z);

        // Step 2: Project to 2D plane for planar IK
        // Distance from base center on X-Z plane
        const horizontalDistance = Math.sqrt(target.x * target.x + target.z * target.z);

        // Height relative to shoulder pivot (base top)
        const verticalDistance = target.y - this.baseHeight;

        // Total planar distance to target
        const planarDistance = Math.sqrt(
            horizontalDistance * horizontalDistance +
            verticalDistance * verticalDistance
        );

        // Clamp to reachable workspace
        let reachDistance = planarDistance;
        if (reachDistance > this.maxReach * 0.999) {
            reachDistance = this.maxReach * 0.999;
        }
        if (reachDistance < this.minReach + 0.01) {
            reachDistance = this.minReach + 0.01;
        }

        // Step 3: Solve 2-link planar arm using law of cosines

        // Elbow angle calculation
        // Using law of cosines: c² = a² + b² - 2ab·cos(C)
        const cosElbowAngle = (
            reachDistance * reachDistance -
            this.lowerArmLength * this.lowerArmLength -
            this.upperArmLength * this.upperArmLength
        ) / (-2 * this.lowerArmLength * this.upperArmLength);

        // Clamp cosine value to valid range
        const clampedCosElbow = Math.max(-1, Math.min(1, cosElbowAngle));

        // Internal angle at elbow joint
        const elbowAngleInternal = Math.acos(clampedCosElbow);

        // Joint angle (deviation from straight)
        const elbowAngle = Math.PI - elbowAngleInternal;

        // Shoulder angle calculation
        // Angle of line from shoulder to target
        const targetAngle = Math.atan2(verticalDistance, horizontalDistance);

        // Triangle offset angle using law of cosines
        const cosShoulderOffset = (
            this.lowerArmLength * this.lowerArmLength +
            reachDistance * reachDistance -
            this.upperArmLength * this.upperArmLength
        ) / (2 * this.lowerArmLength * reachDistance);

        const shoulderOffset = Math.acos(Math.max(-1, Math.min(1, cosShoulderOffset)));

        // Final shoulder angle (measured from vertical up)
        const shoulderAngle = (Math.PI / 2) - (targetAngle + shoulderOffset);

        return {
            base: baseAngle,
            shoulder: shoulderAngle,
            elbow: elbowAngle,
            reachDistance,
            isAtLimit: planarDistance > this.maxReach * 0.999
        };
    }

    /**
     * Calculate forward kinematics (joint angles -> end effector position)
     * @param {Object} angles - Joint angles {base, shoulder, elbow}
     * @returns {Object} End effector position {x, y, z}
     */
    forward(angles) {
        const { base, shoulder, elbow } = angles;

        // Lower arm endpoint
        const lowerX = this.lowerArmLength * Math.sin(shoulder);
        const lowerY = this.lowerArmLength * Math.cos(shoulder);

        // Upper arm (relative to lower arm)
        const totalAngle = shoulder + elbow - Math.PI;
        const upperX = this.upperArmLength * Math.sin(totalAngle);
        const upperY = this.upperArmLength * Math.cos(totalAngle);

        // End effector in 2D plane
        const planarX = lowerX + upperX;
        const planarY = lowerY + upperY + this.baseHeight;

        // Rotate around base
        const x = planarX * Math.sin(base);
        const z = planarX * Math.cos(base);
        const y = planarY;

        return { x, y, z };
    }

    /**
     * Check if target is within reachable workspace
     * @param {Object} target - Target position {x, y, z}
     * @returns {boolean}
     */
    isReachable(target) {
        const horizontal = Math.sqrt(target.x * target.x + target.z * target.z);
        const vertical = target.y - this.baseHeight;
        const distance = Math.sqrt(horizontal * horizontal + vertical * vertical);

        return distance >= this.minReach && distance <= this.maxReach;
    }
}
