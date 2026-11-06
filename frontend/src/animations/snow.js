import { useEffect, useRef } from "react";

const SnowEffect = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const particles = [];
    const numParticles = 150;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();

    class Snowflake {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 2 + 0.5;
        this.speed = Math.random() * 1 + 0.2;
        this.wind = Math.random() * 0.5 - 0.25;
      }

      update() {
        this.y += this.speed;
        this.x += this.wind;

        if (this.y > canvas.height) {
          this.y = -this.radius;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#2a3a57";
        ctx.fill();
        ctx.closePath();
      }
    }

    for (let i = 0; i < numParticles; i++) {
      particles.push(new Snowflake());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((flake) => {
        flake.update();
        flake.draw();
      });
      requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none" style={{ width: '100vw', height: '100vh' }} />;
};

export default SnowEffect;
