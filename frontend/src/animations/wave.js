import { useEffect, useRef } from "react";

const WaveEffect = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", resizeCanvas);

    let time = 0;
    const wave1 = { amplitude: 40, frequency: 0.05, speed: 0.1 };
    const wave2 = { amplitude: 50, frequency: 0.04, speed: 0.04 };

    const drawWave = (wave, color) => {
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      for (let x = 0; x < width; x++) {
        const y =
          height / 2 +
          wave.amplitude * Math.sin(x * wave.frequency + time * wave.speed);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      drawWave(wave1, "#2a3a57");
      drawWave(wave2, "#4b6796");
      time += 1;
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute bottom-0 left-0 w-full h-20 pointer-events-none" />;
};

export default WaveEffect;