import { useEffect, useRef } from "react";

const FloatingSquaresEffect = () => {
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

    const squares = [...Array(20)].map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 20 + 5,
      speedX: Math.random() * 1 - 0.5,
      speedY: Math.random() * 1 - 0.5,
      opacity: Math.random() * 0.5 + 0.5,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";

      squares.forEach((square) => {
        ctx.strokeStyle = "#162236";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(square.x, square.y, square.size, square.size, 4);
        ctx.stroke();
        ctx.closePath();

        square.x += square.speedX;
        square.y += square.speedY;

        if (square.x < 0 || square.x > canvas.width) square.speedX *= -1;
        if (square.y < 0 || square.y > canvas.height) square.speedY *= -1;
      });
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
    />
  );
};

export default FloatingSquaresEffect;
