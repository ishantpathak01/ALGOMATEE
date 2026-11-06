import { useEffect, useRef } from "react";

const FirefliesEffect = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const fireflies = [...Array(50)].map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1 + 1,
      speedX: Math.random() * 0.6 - 0.3,
      speedY: Math.random() * 0.6 - 0.3,
      opacity: Math.random() * 0.5 + 0.5
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";

      fireflies.forEach((fly) => {
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.radius, 0, Math.PI * 2);
        ctx.fillStyle = `#2b364a`;
        ctx.fill();
        ctx.closePath();

        fly.x += fly.speedX;
        fly.y += fly.speedY;

        if (fly.x < 0 || fly.x > canvas.width) fly.speedX *= -1;
        if (fly.y < 0 || fly.y > canvas.height) fly.speedY *= -1;
      });
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none" />;
};

export default FirefliesEffect;