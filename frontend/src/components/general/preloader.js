import { useState, useEffect } from "react";
import "./preloader.css";

const Preloader = () => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => setFadeOut(true), 1000); // Trigger fade out after scaling
          return 100;
        }
        return oldProgress + 5;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`relative h-screen w-screen flex flex-col justify-center items-center overflow-hidden bg-[#111826] text-white transition-all duration-1000 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className={`loader m-0 ${progress === 100 ? "scale-full" : ""}`}
      ></div>
      <p className="text-sm text-blue-200 relative mt-40 font-mono tracking-widest">
        {progress}%
      </p>
    </div>
  );
};

export default Preloader;
