/**
 * 3D Scene Manager for Robotic Arm Simulation
 * Handles Three.js scene, camera, lighting, and rendering
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneManager {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.robotArm = null;

        this.init();
        this.setupLighting();
        this.setupEnvironment();
        this.createRobotArm();
        this.createTargetMarker();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);
        this.scene.fog = new THREE.FogExp2(0xe8e8e8, 0.008);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(28, 22, 28);
        this.camera.lookAt(0, 8, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        this.container.appendChild(this.renderer.domElement);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 80;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
        this.controls.target.set(0, 8, 0);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404060, 1.5);
        this.scene.add(ambientLight);

        // Main directional light (sun)
        const mainLight = new THREE.DirectionalLight(0xffffff, 2);
        mainLight.position.set(15, 25, 15);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -25;
        mainLight.shadow.camera.right = 25;
        mainLight.shadow.camera.top = 25;
        mainLight.shadow.camera.bottom = -25;
        this.scene.add(mainLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(0x7799ff, 0.8);
        fillLight.position.set(-10, 10, -10);
        this.scene.add(fillLight);

        // Accent spotlight (cyan)
        const spotLight = new THREE.SpotLight(0x38bdf8, 6);
        spotLight.position.set(-12, 15, -8);
        spotLight.angle = Math.PI / 6;
        spotLight.penumbra = 0.5;
        spotLight.decay = 2;
        spotLight.distance = 40;
        spotLight.castShadow = true;
        this.scene.add(spotLight);

        // Rim light
        const rimLight = new THREE.PointLight(0xff9955, 2, 50);
        rimLight.position.set(8, 5, -15);
        this.scene.add(rimLight);
    }

    setupEnvironment() {
        // Ground plane - white for engineering paper look
        const planeGeometry = new THREE.PlaneGeometry(200, 200);
        const planeMaterial = new THREE.MeshStandardMaterial({
            color: 0xfafafa,
            roughness: 0.95,
            metalness: 0.05
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.receiveShadow = true;
        this.scene.add(plane);

        // Engineering Grid - Primary (10 unit spacing)
        const gridSize = 100;
        const gridDivisions = 20;
        const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x000000, 0x333333);
        gridHelper.material.opacity = 0.8;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);

        // Fine Grid - Secondary (1 unit spacing)
        const fineGridHelper = new THREE.GridHelper(gridSize, gridDivisions * 5, 0x666666, 0xaaaaaa);
        fineGridHelper.material.opacity = 0.25;
        fineGridHelper.material.transparent = true;
        fineGridHelper.position.y = 0.01;
        this.scene.add(fineGridHelper);

        // Coordinate Axes with Engineering Style
        this.createCoordinateAxes();

        // Measurement Circles (like CAD software)
        this.createMeasurementCircles();

        // Blueprint-style Reference Lines
        this.createBlueprintLines();

        // Technical Annotations
        this.createTechnicalAnnotations();

        // Atmospheric particles
        this.createParticles();
    }

    createCoordinateAxes() {
        const axisLength = 40;
        const axisThickness = 0.15;

        // X Axis - Red
        const xAxisGeometry = new THREE.CylinderGeometry(axisThickness, axisThickness, axisLength, 8);
        const xAxisMaterial = new THREE.MeshBasicMaterial({ color: 0xff3333 });
        const xAxis = new THREE.Mesh(xAxisGeometry, xAxisMaterial);
        xAxis.rotation.z = Math.PI / 2;
        xAxis.position.set(axisLength / 2, 0.02, 0);
        this.scene.add(xAxis);

        // X Axis Arrow
        const xArrow = new THREE.Mesh(
            new THREE.ConeGeometry(0.4, 1, 8),
            xAxisMaterial
        );
        xArrow.rotation.z = -Math.PI / 2;
        xArrow.position.set(axisLength, 0.02, 0);
        this.scene.add(xArrow);

        // Y Axis - Green
        const yAxisGeometry = new THREE.CylinderGeometry(axisThickness, axisThickness, axisLength, 8);
        const yAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x33ff33 });
        const yAxis = new THREE.Mesh(yAxisGeometry, yAxisMaterial);
        yAxis.position.set(0, axisLength / 2, 0);
        this.scene.add(yAxis);

        // Y Axis Arrow
        const yArrow = new THREE.Mesh(
            new THREE.ConeGeometry(0.4, 1, 8),
            yAxisMaterial
        );
        yArrow.position.set(0, axisLength, 0);
        this.scene.add(yArrow);

        // Z Axis - Blue
        const zAxisGeometry = new THREE.CylinderGeometry(axisThickness, axisThickness, axisLength, 8);
        const zAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x3333ff });
        const zAxis = new THREE.Mesh(zAxisGeometry, zAxisMaterial);
        zAxis.rotation.x = Math.PI / 2;
        zAxis.position.set(0, 0.02, axisLength / 2);
        this.scene.add(zAxis);

        // Z Axis Arrow
        const zArrow = new THREE.Mesh(
            new THREE.ConeGeometry(0.4, 1, 8),
            zAxisMaterial
        );
        zArrow.rotation.x = -Math.PI / 2;
        zArrow.position.set(0, 0.02, axisLength);
        this.scene.add(zArrow);

        // Axis Labels using sprites (simplified - actual text would need canvas textures)
        // Add small spheres at axis tips as markers
        const markers = [
            { pos: [axisLength + 1, 0, 0], color: 0xff3333 },
            { pos: [0, axisLength + 1, 0], color: 0x33ff33 },
            { pos: [0, 0, axisLength + 1], color: 0x3333ff }
        ];

        markers.forEach(marker => {
            const markerMesh = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 8, 8),
                new THREE.MeshBasicMaterial({ color: marker.color })
            );
            markerMesh.position.set(...marker.pos);
            this.scene.add(markerMesh);
        });
    }

    createMeasurementCircles() {
        // Concentric circles for measurement reference (like CAD)
        const radii = [10, 20, 30, 40];
        const circleColor = 0x0066cc;

        radii.forEach((radius, index) => {
            const circleGeometry = new THREE.RingGeometry(radius - 0.05, radius + 0.05, 64);
            const circleMaterial = new THREE.MeshBasicMaterial({
                color: circleColor,
                transparent: true,
                opacity: 0.35 - (index * 0.05),
                side: THREE.DoubleSide
            });
            const circle = new THREE.Mesh(circleGeometry, circleMaterial);
            circle.rotation.x = -Math.PI / 2;
            circle.position.y = 0.05;
            this.scene.add(circle);

            // Add tick marks every 45 degrees
            for (let angle = 0; angle < 360; angle += 45) {
                const rad = (angle * Math.PI) / 180;
                const tickLength = 0.8;
                const tickGeometry = new THREE.BoxGeometry(0.08, 0.01, tickLength);
                const tickMaterial = new THREE.MeshBasicMaterial({
                    color: 0x333333,
                    transparent: true,
                    opacity: 0.5
                });
                const tick = new THREE.Mesh(tickGeometry, tickMaterial);
                tick.position.set(
                    Math.cos(rad) * radius,
                    0.06,
                    Math.sin(rad) * radius
                );
                tick.rotation.y = -rad;
                this.scene.add(tick);
            }
        });
    }

    createBlueprintLines() {
        // Create blueprint-style construction lines
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x0066cc,
            transparent: true,
            opacity: 0.3
        });

        // Radial lines from center
        for (let angle = 0; angle < 360; angle += 30) {
            const rad = (angle * Math.PI) / 180;
            const points = [];
            points.push(new THREE.Vector3(0, 0.03, 0));
            points.push(new THREE.Vector3(Math.cos(rad) * 45, 0.03, Math.sin(rad) * 45));

            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            this.scene.add(line);
        }

        // Cross-hair at center
        const crosshairSize = 2;
        const crosshairMaterial = new THREE.LineBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.8
        });

        const crosshairPoints1 = [
            new THREE.Vector3(-crosshairSize, 0.04, 0),
            new THREE.Vector3(crosshairSize, 0.04, 0)
        ];
        const crosshair1 = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(crosshairPoints1),
            crosshairMaterial
        );
        this.scene.add(crosshair1);

        const crosshairPoints2 = [
            new THREE.Vector3(0, 0.04, -crosshairSize),
            new THREE.Vector3(0, 0.04, crosshairSize)
        ];
        const crosshair2 = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(crosshairPoints2),
            crosshairMaterial
        );
        this.scene.add(crosshair2);
    }

    createTechnicalAnnotations() {
        // Create dimension marker lines at ground plane edges
        const markerMaterial = new THREE.MeshBasicMaterial({
            color: 0xff8800,
            transparent: true,
            opacity: 0.6
        });

        // Corner markers
        const cornerPositions = [
            [45, 0.1, 45], [-45, 0.1, 45],
            [45, 0.1, -45], [-45, 0.1, -45]
        ];

        cornerPositions.forEach(pos => {
            const marker = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, 0.2, 0.5),
                markerMaterial
            );
            marker.position.set(...pos);
            this.scene.add(marker);

            // Small vertical line
            const vertLine = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 2, 8),
                new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.7 })
            );
            vertLine.position.set(pos[0], 1, pos[2]);
            this.scene.add(vertLine);
        });
    }

    createParticles() {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 60;
            positions[i + 1] = Math.random() * 40;
            positions[i + 2] = (Math.random() - 0.5) * 60;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0x38bdf8,
            size: 0.15,
            transparent: true,
            opacity: 0.4,
            sizeAttenuation: true
        });

        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
    }

    createRobotArm() {
        const ARM_CONFIG = {
            baseHeight: 4,
            lowerArmLength: 12,
            upperArmLength: 10
        };

        // Enhanced Materials - Industrial Robotic Look
        const brushedMetalMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a3f5f,
            roughness: 0.4,
            metalness: 0.9,
            envMapIntensity: 1.5
        });

        const darkMetalMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1f2e,
            roughness: 0.6,
            metalness: 0.8
        });

        const jointMaterial = new THREE.MeshStandardMaterial({
            color: 0x0ea5e9,
            roughness: 0.15,
            metalness: 0.9,
            emissive: 0x0ea5e9,
            emissiveIntensity: 0.4
        });

        const warningStripeMaterial = new THREE.MeshBasicMaterial({
            color: 0xfbbf24,
            side: THREE.DoubleSide
        });

        const ledMaterial = new THREE.MeshBasicMaterial({
            color: 0x22c55e,
            transparent: true,
            opacity: 0.9
        });

        // Robot arm hierarchy
        const baseGroup = new THREE.Group();
        baseGroup.name = 'robotBase';
        this.scene.add(baseGroup);

        // Industrial Base Platform with details
        const baseMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(2.5, 3.2, ARM_CONFIG.baseHeight, 32),
            brushedMetalMaterial
        );
        baseMesh.position.y = ARM_CONFIG.baseHeight / 2;
        baseMesh.castShadow = true;
        baseMesh.receiveShadow = true;
        baseGroup.add(baseMesh);

        // Base bottom accent
        const baseBottom = new THREE.Mesh(
            new THREE.CylinderGeometry(3.2, 3.4, 0.4, 32),
            darkMetalMaterial
        );
        baseBottom.position.y = 0.2;
        baseGroup.add(baseBottom);

        // Warning stripes on base
        for (let i = 0; i < 8; i++) {
            const stripe = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, ARM_CONFIG.baseHeight - 0.5, 0.05),
                warningStripeMaterial
            );
            const angle = (i / 8) * Math.PI * 2;
            stripe.position.x = Math.cos(angle) * 2.7;
            stripe.position.z = Math.sin(angle) * 2.7;
            stripe.position.y = ARM_CONFIG.baseHeight / 2;
            stripe.rotation.y = -angle;
            baseGroup.add(stripe);
        }

        // LED indicator ring
        const ledRing = new THREE.Mesh(
            new THREE.TorusGeometry(2.9, 0.08, 16, 32),
            ledMaterial
        );
        ledRing.rotation.x = Math.PI / 2;
        ledRing.position.y = ARM_CONFIG.baseHeight + 0.05;
        baseGroup.add(ledRing);

        // Main power ring glow
        const powerRing = new THREE.Mesh(
            new THREE.TorusGeometry(2.6, 0.2, 16, 32),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 })
        );
        powerRing.rotation.x = Math.PI / 2;
        powerRing.position.y = ARM_CONFIG.baseHeight + 0.15;
        baseGroup.add(powerRing);

        // Shoulder joint assembly (rotates Y)
        const shoulderGroup = new THREE.Group();
        shoulderGroup.name = 'shoulder';
        shoulderGroup.position.y = ARM_CONFIG.baseHeight;
        baseGroup.add(shoulderGroup);

        // Main shoulder sphere
        const shoulderMesh = new THREE.Mesh(
            new THREE.SphereGeometry(2, 32, 32),
            jointMaterial
        );
        shoulderMesh.castShadow = true;
        shoulderGroup.add(shoulderMesh);

        // Shoulder detail rings
        for (let i = 0; i < 3; i++) {
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(2.1 + i * 0.15, 0.06, 8, 32),
                darkMetalMaterial
            );
            ring.rotation.x = Math.PI / 2;
            ring.position.y = -0.8 + i * 0.8;
            shoulderGroup.add(ring);
        }

        // Lower arm pivot (rotates X)
        const lowerArmPivot = new THREE.Group();
        lowerArmPivot.name = 'lowerArmPivot';
        shoulderGroup.add(lowerArmPivot);

        // Lower arm main structure
        const lowerArmMesh = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, ARM_CONFIG.lowerArmLength, 1.4),
            brushedMetalMaterial
        );
        lowerArmMesh.position.y = ARM_CONFIG.lowerArmLength / 2;
        lowerArmMesh.castShadow = true;
        lowerArmPivot.add(lowerArmMesh);

        // Lower arm side panels
        const sidePanelGeometry = new THREE.BoxGeometry(0.05, ARM_CONFIG.lowerArmLength - 1, 1.2);
        const leftPanel = new THREE.Mesh(sidePanelGeometry, darkMetalMaterial);
        leftPanel.position.set(-0.7, ARM_CONFIG.lowerArmLength / 2, 0);
        lowerArmPivot.add(leftPanel);

        const rightPanel = new THREE.Mesh(sidePanelGeometry, darkMetalMaterial);
        rightPanel.position.set(0.7, ARM_CONFIG.lowerArmLength / 2, 0);
        lowerArmPivot.add(rightPanel);

        // Lower arm warning stripes
        for (let i = 0; i < 3; i++) {
            const stripe = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.3, 0.05),
                warningStripeMaterial
            );
            stripe.position.y = 2 + i * 3.5;
            stripe.position.z = 0.71;
            lowerArmPivot.add(stripe);
        }

        // LED indicators on lower arm
        for (let i = 0; i < 4; i++) {
            const led = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16),
                ledMaterial
            );
            led.rotation.x = Math.PI / 2;
            led.position.set(0.5, 1.5 + i * 3, 0.72);
            lowerArmPivot.add(led);
        }

        // Elbow joint assembly
        const elbowGroup = new THREE.Group();
        elbowGroup.name = 'elbow';
        elbowGroup.position.y = ARM_CONFIG.lowerArmLength;
        lowerArmPivot.add(elbowGroup);

        const elbowMesh = new THREE.Mesh(
            new THREE.SphereGeometry(1.6, 32, 32),
            jointMaterial
        );
        elbowMesh.castShadow = true;
        elbowGroup.add(elbowMesh);

        // Elbow mechanical details
        const elbowRing1 = new THREE.Mesh(
            new THREE.TorusGeometry(1.7, 0.08, 8, 32),
            darkMetalMaterial
        );
        elbowRing1.rotation.x = Math.PI / 2;
        elbowGroup.add(elbowRing1);

        const elbowRing2 = new THREE.Mesh(
            new THREE.TorusGeometry(1.5, 0.06, 8, 32),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        );
        elbowRing2.rotation.x = Math.PI / 2;
        elbowRing2.position.y = 0.1;
        elbowGroup.add(elbowRing2);

        // Upper arm pivot (rotates X)
        const upperArmPivot = new THREE.Group();
        upperArmPivot.name = 'upperArmPivot';
        elbowGroup.add(upperArmPivot);

        // Upper arm sleeker design
        const upperArmMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.55, 0.7, ARM_CONFIG.upperArmLength, 32),
            brushedMetalMaterial
        );
        upperArmMesh.position.y = ARM_CONFIG.upperArmLength / 2;
        upperArmMesh.castShadow = true;
        upperArmPivot.add(upperArmMesh);

        // Upper arm accent rings
        for (let i = 0; i < 2; i++) {
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(0.72, 0.05, 8, 32),
                darkMetalMaterial
            );
            ring.rotation.x = Math.PI / 2;
            ring.position.y = 3 + i * 4;
            upperArmPivot.add(ring);
        }

        // End effector - robotic gripper look
        const endEffectorBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 0.6, 1.2, 32),
            jointMaterial
        );
        endEffectorBase.position.y = ARM_CONFIG.upperArmLength;
        endEffectorBase.castShadow = true;
        upperArmPivot.add(endEffectorBase);

        // Gripper jaws
        const gripperGeom = new THREE.BoxGeometry(0.3, 0.8, 0.1);
        const gripperMat = new THREE.MeshStandardMaterial({
            color: 0x1a1f2e,
            metalness: 0.9,
            roughness: 0.3
        });

        const gripper1 = new THREE.Mesh(gripperGeom, gripperMat);
        gripper1.position.set(0.4, ARM_CONFIG.upperArmLength - 0.6, 0);
        upperArmPivot.add(gripper1);

        const gripper2 = new THREE.Mesh(gripperGeom, gripperMat);
        gripper2.position.set(-0.4, ARM_CONFIG.upperArmLength - 0.6, 0);
        upperArmPivot.add(gripper2);

        // End effector LED ring
        const endLedRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.85, 0.06, 16, 32),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        );
        endLedRing.rotation.x = Math.PI / 2;
        endLedRing.position.y = ARM_CONFIG.upperArmLength + 0.6;
        upperArmPivot.add(endLedRing);

        // Bright point light at end effector
        const effectorLight = new THREE.PointLight(0x38bdf8, 2, 12);
        effectorLight.position.y = ARM_CONFIG.upperArmLength;
        upperArmPivot.add(effectorLight);

        this.robotArm = {
            base: baseGroup,
            shoulder: shoulderGroup,
            lowerArmPivot,
            elbow: elbowGroup,
            upperArmPivot
        };
    }

    createTargetMarker() {
        const markerGroup = new THREE.Group();
        markerGroup.name = 'targetMarker';

        // Core sphere
        const coreMesh = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.6, 1),
            new THREE.MeshBasicMaterial({
                color: 0x38bdf8,
                wireframe: true
            })
        );
        markerGroup.add(coreMesh);

        // Outer glow ring
        const ringMesh = new THREE.Mesh(
            new THREE.RingGeometry(1.2, 1.5, 32),
            new THREE.MeshBasicMaterial({
                color: 0x38bdf8,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.3
            })
        );
        ringMesh.rotation.x = Math.PI / 2;
        markerGroup.add(ringMesh);

        // Point light
        const markerLight = new THREE.PointLight(0x38bdf8, 2, 8);
        markerGroup.add(markerLight);

        this.scene.add(markerGroup);
        this.targetMarker = markerGroup;
    }

    updateArmAngles(angles) {
        if (!this.robotArm) return;

        this.robotArm.shoulder.rotation.y = angles.base;
        this.robotArm.lowerArmPivot.rotation.x = angles.shoulder;
        this.robotArm.upperArmPivot.rotation.x = angles.elbow;
    }

    updateTargetMarker(position) {
        if (!this.targetMarker) return;

        this.targetMarker.position.copy(position);
        this.targetMarker.rotation.y += 0.015;
        this.targetMarker.rotation.z += 0.01;
    }

    render() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    dispose() {
        this.renderer.dispose();
        this.controls.dispose();
    }
}
