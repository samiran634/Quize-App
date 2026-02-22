// Jelly Text Effect for Three.js Text Geometry
// This module adds interactive jelly/wobble deformation to 3D text

export class JellyTextEffect {
    constructor(textMesh, camera) {
        this.textMesh = textMesh;
        this.camera = camera;
        this.jellyWaves = [];
        this.isHovering = false;
        
        // Raycaster for hover detection
        this.raycaster = new THREE.Raycaster();
        this.mouseVector = new THREE.Vector2();
        
        // Store original vertex positions
        this.storeOriginalPositions();
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    storeOriginalPositions() {
        const geometry = this.textMesh.geometry;
        const positionAttribute = geometry.attributes.position;
        this.originalPositions = new Float32Array(positionAttribute.array);
        this.textMesh.userData.originalPositions = this.originalPositions;
        this.textMesh.userData.geometry = geometry;
    }
    
    setupEventListeners() {
        window.addEventListener('mousemove', (event) => {
            this.mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouseVector.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        
        window.addEventListener('click', () => {
            if (this.isHovering) {
                this.triggerJellyEffect(0.4, 2.0, 3);
            }
        });
    }
    
    triggerJellyEffect(amplitude = 0.2, duration = 0.8, frequency = 2) {
        this.jellyWaves.push({
            time: 0,
            duration: duration,
            amplitude: amplitude,
            frequency: frequency
        });
    }
    
    checkHover() {
        this.raycaster.setFromCamera(this.mouseVector, this.camera);
        const intersects = this.raycaster.intersectObject(this.textMesh);
        
        const wasHovering = this.isHovering;
        this.isHovering = intersects.length > 0;
        
        // Change cursor and trigger subtle effect on hover
        if (this.isHovering) {
            document.body.style.cursor = 'pointer';
            if (!wasHovering) {
                this.triggerJellyEffect(0.08, 0.6, 3);
            }
        } else {
            document.body.style.cursor = 'default';
        }
    }
    
    update() {
        const geometry = this.textMesh.userData.geometry;
        if (!geometry) return;
        
        const positionAttribute = geometry.attributes.position;
        const originalPositions = this.originalPositions;
        
        // Reset to original positions
        for (let i = 0; i < positionAttribute.count; i++) {
            positionAttribute.setXYZ(
                i,
                originalPositions[i * 3],
                originalPositions[i * 3 + 1],
                originalPositions[i * 3 + 2]
            );
        }
        
        // Remove completed waves
        this.jellyWaves = this.jellyWaves.filter(wave => wave.time < wave.duration);
        
        // Apply all active waves
        this.jellyWaves.forEach(wave => {
            const progress = wave.time / wave.duration;
            const decay = Math.pow(1 - progress, 3); // Cubic decay for faster recovery
            
            for (let i = 0; i < positionAttribute.count; i++) {
                const x = originalPositions[i * 3];
                const y = originalPositions[i * 3 + 1];
                const z = originalPositions[i * 3 + 2];
                
                // Simple torque/rotation effect per character region
                const charRegion = Math.floor(x / 0.5); // Group vertices by character
                const localX = x - (charRegion * 0.5);
                
                // Apply rotation torque only, not deformation
                const wavePhase = charRegion * wave.frequency - wave.time * 8;
                const torque = Math.sin(wavePhase) * wave.amplitude * decay;
                
                // Apply minimal rotation around character center
                const rotatedY = y * Math.cos(torque) - z * Math.sin(torque);
                const rotatedZ = y * Math.sin(torque) + z * Math.cos(torque);
                
                // Get current position and apply subtle torque
                const currentX = positionAttribute.getX(i);
                const currentY = positionAttribute.getY(i);
                const currentZ = positionAttribute.getZ(i);
                
                positionAttribute.setXYZ(
                    i,
                    currentX,
                    currentY + (rotatedY - y) * 0.3,
                    currentZ + (rotatedZ - z) * 0.3
                );
            }
            
            wave.time += 0.025; // Faster animation for quicker recovery
        });
        
        // Update geometry
        positionAttribute.needsUpdate = true;
        geometry.computeVertexNormals();
        
        // Check hover state
        this.checkHover();
    }
}
