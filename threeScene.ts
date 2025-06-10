import * as THREE from 'three';

export interface ShapeControls {
  shapeType: 'sphere' | 'cube' | 'cone';
  size: number;
  color: { r: number; g: number; b: number };
  rotation: { x: number; y: number; z: number };
}

export class ThreeScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private currentMesh: THREE.Mesh | null = null;
  private material: THREE.ShaderMaterial;
  private glowMesh: THREE.Mesh | null = null;
  private animationId: number | null = null;
  
  // Target values for smooth interpolation
  private targetSize = 1;
  private targetColor = { r: 0, g: 0.8, b: 1 };
  private targetRotation = { x: 0, y: 0, z: 0 };
  private targetShape: 'sphere' | 'cube' | 'cone' = 'sphere';
  
  // Current values
  private currentSize = 1;
  private currentColor = { r: 0, g: 0.8, b: 1 };
  private currentRotation = { x: 0, y: 0, z: 0 };
  private currentShape: 'sphere' | 'cube' | 'cone' = 'sphere';
  
  // Shape transition
  private shapeTransitionProgress = 0;
  private isTransitioning = false;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.setupCamera();
    this.setupRenderer(container);
    this.setupLights();
    this.createShaderMaterial();
    this.createShape('sphere');
    this.startRenderLoop();
  }

  private setupCamera() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;
  }

  private setupRenderer(container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);
  }

  private setupLights() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f5ff, 1, 100);
    pointLight.position.set(10, 10, 10);
    pointLight.castShadow = true;
    this.scene.add(pointLight);

    const rimLight = new THREE.DirectionalLight(0xff00ff, 0.5);
    rimLight.position.set(-5, 5, 5);
    this.scene.add(rimLight);
  }

  private createShaderMaterial() {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0, 0.8, 1) },
        glowIntensity: { value: 1.5 },
        transitionProgress: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float glowIntensity;
        uniform float transitionProgress;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
          // Fresnel effect for rim lighting
          float fresnel = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
          fresnel = pow(fresnel, 2.0);
          
          // Pulsing effect
          float pulse = 0.8 + 0.2 * sin(time * 2.0);
          
          // Transition shimmer effect
          float shimmer = 1.0 + 0.3 * sin(time * 5.0 + vPosition.x * 10.0) * transitionProgress;
          
          // Final color with glow and shimmer
          vec3 finalColor = color * (1.0 + fresnel * glowIntensity * pulse) * shimmer;
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
  }

  private createShape(shapeType: 'sphere' | 'cube' | 'cone') {
    // Remove existing meshes
    if (this.currentMesh) {
      this.scene.remove(this.currentMesh);
      this.currentMesh.geometry.dispose();
    }
    if (this.glowMesh) {
      this.scene.remove(this.glowMesh);
      this.glowMesh.geometry.dispose();
    }

    let geometry: THREE.BufferGeometry;
    let glowGeometry: THREE.BufferGeometry;

    switch (shapeType) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(1, 64, 64);
        glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
        break;
      case 'cube':
        geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5, 32, 32, 32);
        glowGeometry = new THREE.BoxGeometry(1.8, 1.8, 1.8, 16, 16, 16);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(1, 2, 32, 32);
        glowGeometry = new THREE.ConeGeometry(1.2, 2.4, 16, 16);
        break;
    }

    // Create main mesh
    this.currentMesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.currentMesh);

    // Create glow effect
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0, 0.8, 1) },
        intensity: { value: 0.3 },
        time: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float intensity;
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          float fresnel = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
          float pulse = 0.8 + 0.2 * sin(time * 3.0);
          gl_FragColor = vec4(color, fresnel * intensity * pulse);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });

    this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    this.scene.add(this.glowMesh);

    this.currentShape = shapeType;
  }

  private lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
  }

  private lerpColor(start: { r: number; g: number; b: number }, end: { r: number; g: number; b: number }, factor: number) {
    return {
      r: this.lerp(start.r, end.r, factor),
      g: this.lerp(start.g, end.g, factor),
      b: this.lerp(start.b, end.b, factor)
    };
  }

  private handleShapeTransition() {
    if (this.targetShape !== this.currentShape) {
      if (!this.isTransitioning) {
        this.isTransitioning = true;
        this.shapeTransitionProgress = 0;
      }
      
      this.shapeTransitionProgress += 0.05;
      
      if (this.shapeTransitionProgress >= 1) {
        this.createShape(this.targetShape);
        this.isTransitioning = false;
        this.shapeTransitionProgress = 0;
      }
    }
  }

  private startRenderLoop() {
    const animate = (time: number) => {
      // Handle shape transitions
      this.handleShapeTransition();
      
      // Smooth interpolation
      const lerpFactor = 0.1;
      
      this.currentSize = this.lerp(this.currentSize, this.targetSize, lerpFactor);
      this.currentColor = this.lerpColor(this.currentColor, this.targetColor, lerpFactor);
      this.currentRotation.x = this.lerp(this.currentRotation.x, this.targetRotation.x, lerpFactor);
      this.currentRotation.y = this.lerp(this.currentRotation.y, this.targetRotation.y, lerpFactor);
      this.currentRotation.z = this.lerp(this.currentRotation.z, this.targetRotation.z, lerpFactor);

      // Apply transformations to current mesh
      if (this.currentMesh) {
        this.currentMesh.scale.setScalar(this.currentSize);
        this.currentMesh.rotation.x = this.currentRotation.x;
        this.currentMesh.rotation.y = this.currentRotation.y;
        this.currentMesh.rotation.z = this.currentRotation.z;

        // Update material uniforms
        this.material.uniforms.color.value.setRGB(
          this.currentColor.r,
          this.currentColor.g,
          this.currentColor.b
        );
        this.material.uniforms.time.value = time * 0.001;
        this.material.uniforms.transitionProgress.value = this.shapeTransitionProgress;
      }

      // Apply transformations to glow mesh
      if (this.glowMesh) {
        this.glowMesh.scale.setScalar(this.currentSize);
        this.glowMesh.rotation.x = this.currentRotation.x;
        this.glowMesh.rotation.y = this.currentRotation.y;
        this.glowMesh.rotation.z = this.currentRotation.z;

        // Update glow material
        const glowMaterial = this.glowMesh.material as THREE.ShaderMaterial;
        glowMaterial.uniforms.color.value.setRGB(
          this.currentColor.r,
          this.currentColor.g,
          this.currentColor.b
        );
        glowMaterial.uniforms.time.value = time * 0.001;
      }

      this.renderer.render(this.scene, this.camera);
      this.animationId = requestAnimationFrame(animate);
    };

    animate(0);
  }

  updateControls(controls: Partial<ShapeControls>) {
    if (controls.shapeType !== undefined) {
      this.targetShape = controls.shapeType;
    }
    
    if (controls.size !== undefined) {
      this.targetSize = Math.max(0.5, Math.min(3, controls.size));
    }
    
    if (controls.color) {
      this.targetColor = controls.color;
    }
    
    if (controls.rotation) {
      this.targetRotation = controls.rotation;
    }
  }

  getCurrentShape(): 'sphere' | 'cube' | 'cone' {
    return this.currentShape;
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.currentMesh) {
      this.currentMesh.geometry.dispose();
      this.scene.remove(this.currentMesh);
    }
    
    if (this.glowMesh) {
      this.glowMesh.geometry.dispose();
      this.scene.remove(this.glowMesh);
    }
    
    this.material.dispose();
    this.renderer.dispose();
  }
}