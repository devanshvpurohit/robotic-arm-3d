# 🤖 Robotic Arm Simulator 3D

A professional 3D robotic arm simulation with real-time hand tracking control using **Three.js** and **MediaPipe Hands**.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **3D Robot Arm Visualization** - Industrial-grade robotic arm with:
  - Brushed metal materials and dark metallic finishes
  - Warning stripes and LED indicators
  - Robotic gripper end-effector
  - Side panels and technical details
  - Glowing joints with neon accents
  
- **Hand Tracking Control** - Real-time webcam control with your index finger
- **Inverse Kinematics** - Analytical IK solver for smooth, natural movements
- **Real-time Performance** - Optimized rendering at 60 FPS
- **Industrial UI Design** - Technical HUD interface with:
  - Glassmorphic control panels
  - Animated scan lines and grid overlay
  - Neon border effects and corner brackets
  - Orbitron technical font
  - Pulsing indicators and status lights
  
- **Interactive 3D Controls** - Full orbit, zoom, and pan controls

## 🎮 How to Use

1. **Start Camera** - Click the "Start Camera Tracking" button
2. **Show Your Hand** - Position your hand in front of the webcam
3. **Control the Arm** - Move your index finger to control the target position
4. **Adjust Settings** - Use sliders to fine-tune smoothing, scale, and speed
5. **Explore** - Drag to rotate camera, scroll to zoom, right-click to pan

## 🛠️ Technology Stack

- **Three.js** - 3D graphics and rendering
- **MediaPipe Hands** - Real-time hand tracking
- **Vite** - Fast development and building
- **Vanilla JavaScript** - Modern ES6+ modules

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
robotic-arm-3d/
├── src/
│   ├── main.js           # Application entry point
│   ├── scene-manager.js  # Three.js scene management
│   ├── ik-solver.js      # Inverse kinematics solver
│   ├── hand-tracker.js   # MediaPipe hand tracking
│   └── style.css         # Styles and animations
├── index.html            # HTML entry point
└── package.json          # Dependencies and scripts
```

## 🎯 Architecture

### Modules

- **SceneManager** - Manages Three.js scene, camera, lighting, and rendering
- **IKSolver** - Analytical inverse kinematics for 3-DOF arm
- **HandTracker** - MediaPipe integration and coordinate mapping
- **RoboticArmApp** - Main application controller

### Data Flow

```
Webcam → MediaPipe → Hand Landmarks → World Coordinates → IK Solver → Joint Angles → 3D Arm
```

## 🎨 Customization

### Arm Configuration

Edit arm dimensions in `ik-solver.js`:

```javascript
const ikSolver = new IKSolver({
  baseHeight: 4,
  lowerArmLength: 12,
  upperArmLength: 10
});
```

### Visual Style

Modify colors in `style.css`:

```css
:root {
  --accent-primary: #38bdf8;
  --accent-secondary: #0ea5e9;
  /* ... */
}
```

## 🚀 Performance Tips

- Use a modern browser (Chrome, Edge, Firefox recommended)
- Ensure good lighting for hand tracking
- Close other applications using the webcam
- Reduce motion scale if arm moves too erratically

## 📝 Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari (WebKit)
- ⚠️ Requires WebGL 2.0 support

## 🤝 Contributing

Contributions welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use in your projects!

## 🙏 Acknowledgments

- [Three.js](https://threejs.org/) - 3D graphics library
- [MediaPipe](https://google.github.io/mediapipe/) - Hand tracking solution
- [Vite](https://vitejs.dev/) - Build tool

---

**Made with ❤️ using modern web technologies**

*Keywords: robotics, 3D simulation, hand tracking, inverse kinematics, three.js, mediapipe, web app*
