// Optimized Floating Particle Background Animation
class ParticleSystem {
  constructor() {
    this.canvas = document.getElementById('particle-canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.particles = [];
    this.particleCount = 40; // Reduced from 80 for better performance
    this.mouse = { x: null, y: null, radius: 120 };
    this.lastTime = 0;
    this.fps = 60;
    this.frameInterval = 1000 / this.fps;
    
    this.init();
    this.animate(0);
    this.setupEventListeners();
  }

  init() {
    this.resize();
    this.createParticles();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.scale(dpr, dpr);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2.5 + 1,
        speedY: Math.random() * 0.4 + 0.15,
        speedX: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.4 + 0.25,
        glowIntensity: Math.random() * 0.6 + 0.3,
        pulseSpeed: Math.random() * 0.015 + 0.008,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
  }

  drawParticle(particle) {
    // Pulsing glow effect
    particle.pulsePhase += particle.pulseSpeed;
    const pulse = Math.sin(particle.pulsePhase) * 0.25 + 0.75;
    const glowSize = particle.size * 2.5 * pulse;
    
    // Simplified glow - single gradient
    const gradient = this.ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, glowSize
    );
    gradient.addColorStop(0, `rgba(0, 217, 255, ${particle.opacity * particle.glowIntensity * pulse * 0.8})`);
    gradient.addColorStop(1, 'rgba(0, 217, 255, 0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Core particle
    this.ctx.fillStyle = `rgba(0, 217, 255, ${particle.opacity})`;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  updateParticle(particle) {
    // Falling motion
    particle.y += particle.speedY;
    particle.x += particle.speedX;
    
    // Simplified mouse interaction - only when mouse is active
    if (this.mouse.x !== null && this.mouse.y !== null) {
      const dx = this.mouse.x - particle.x;
      const dy = this.mouse.y - particle.y;
      const distSq = dx * dx + dy * dy; // Use squared distance to avoid sqrt
      const radiusSq = this.mouse.radius * this.mouse.radius;
      
      if (distSq < radiusSq) {
        const force = (1 - distSq / radiusSq) * 1.5;
        const angle = Math.atan2(dy, dx);
        particle.x -= Math.cos(angle) * force;
        particle.y -= Math.sin(angle) * force;
      }
    }
    
    // Reset particle when it goes off screen
    if (particle.y > this.height + 10) {
      particle.y = -10;
      particle.x = Math.random() * this.width;
    }
    
    if (particle.x > this.width + 10) {
      particle.x = -10;
    } else if (particle.x < -10) {
      particle.x = this.width + 10;
    }
  }

  animate(currentTime) {
    requestAnimationFrame((time) => this.animate(time));
    
    const deltaTime = currentTime - this.lastTime;
    if (deltaTime < this.frameInterval) return;
    
    this.lastTime = currentTime - (deltaTime % this.frameInterval);
    
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    for (let i = 0; i < this.particles.length; i++) {
      this.updateParticle(this.particles[i]);
      this.drawParticle(this.particles[i]);
    }
  }

  setupEventListeners() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.resize();
        this.createParticles();
      }, 250);
    });
    
    // Throttle mouse move events
    let mouseMoveTimeout;
    window.addEventListener('mousemove', (e) => {
      if (!mouseMoveTimeout) {
        mouseMoveTimeout = setTimeout(() => {
          this.mouse.x = e.clientX;
          this.mouse.y = e.clientY;
          mouseMoveTimeout = null;
        }, 16); // ~60fps
      }
    });
    
    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }
}

// Initialize particle system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ParticleSystem();
});
