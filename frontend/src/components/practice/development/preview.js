import React, { useState, useEffect, useRef } from "react";
import {
  Refresh,
  Fullscreen,
  FullscreenExit,
  ZoomIn,
  ZoomOut,
  PhoneAndroid,
  TabletAndroid,
  Laptop,
  DesktopWindows,
  Close,
} from "@mui/icons-material";

const devicePresets = [
  { name: "Mobile (Small)", icon: <PhoneAndroid />, width: 360, height: 640 },
  { name: "Mobile (Large)", icon: <PhoneAndroid />, width: 414, height: 896 },
  { name: "Tablet", icon: <TabletAndroid />, width: 768, height: 1024 },
  { name: "Laptop", icon: <Laptop />, width: 1366, height: 768 },
  { name: "Desktop", icon: <DesktopWindows />, width: 1920, height: 1080 },
  {
    name: "Full Width",
    icon: <DesktopWindows />,
    width: "100%",
    height: "100%",
  },
];

const Preview = ({ files, activeFile, onFileSelect }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(devicePresets[5]); // Start with Full Width
  const iframeRef = useRef(null);
  const previewContainerRef = useRef(null);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Handle file changes
  useEffect(() => {
    setIsLoading(true);
    setRefreshKey((prev) => prev + 1);
  }, [activeFile]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await previewContainerRef.current?.requestFullscreen?.();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  const handleZoom = (direction) => {
    setZoomLevel((prev) => {
      const newZoom =
        direction === "in"
          ? Math.min(prev + 0.1, 2)
          : Math.max(prev - 0.1, 0.5);
      return Math.round(newZoom * 10) / 10;
    });
  };

  const selectDevice = (device) => {
    setCurrentDevice(device);
    setShowDeviceMenu(false);
  };

  const getFrameStyle = () => {
    if (currentDevice.width === "100%") {
      return {
        transform: `scale(${zoomLevel})`,
        transformOrigin: "0 0",
        width: `${100 / zoomLevel}%`,
        height: `${100 / zoomLevel}%`,
      };
    }

    return {
      width: `${currentDevice.width}px`,
      height: `${currentDevice.height}px`,
      transform: `scale(${zoomLevel})`,
      transformOrigin: "0 0",
      margin: "auto",
      border: "1px solid #e5e7eb",
    };
  };

  return (
    <div
      className={`h-full flex flex-col bg-[#172130] rounded-lg border border-gray-700 ${
        isFullscreen ? "fixed inset-0 z-50" : ""
      }`}
      ref={previewContainerRef}
    >
      {/* Preview Header */}
      <div className="flex items-center justify-between p-2 bg-[#172130] border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <h2 className="text-sm font-medium text-gray-300">
            Preview: {activeFile?.name || "No file selected"}
          </h2>
          {isLoading && (
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1"></div>
              <span className="text-xs text-gray-400">Loading...</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Device Selection Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDeviceMenu(!showDeviceMenu)}
              className="flex items-center text-xs text-gray-300 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
              title="Device Presets"
            >
              {currentDevice.icon}
              <span className="ml-1 hidden sm:inline">
                {currentDevice.name}
              </span>
            </button>

            {showDeviceMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-20">
                <div className="flex justify-between items-center px-3 py-2 border-b border-gray-700">
                  <span className="text-sm font-medium">Device Presets</span>
                  <button
                    onClick={() => setShowDeviceMenu(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Close fontSize="small" />
                  </button>
                </div>
                {devicePresets.map((device, index) => (
                  <button
                    key={index}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center ${
                      currentDevice.name === device.name
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                    onClick={() => selectDevice(device)}
                  >
                    <span className="mr-2">{device.icon}</span>
                    {device.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center border-r border-gray-600 pr-2 mr-2">
            <button
              onClick={() => handleZoom("out")}
              disabled={zoomLevel <= 0.5}
              className="p-1 text-gray-400 hover:text-white disabled:text-gray-600"
              title="Zoom Out"
            >
              <ZoomOut fontSize="small" />
            </button>
            <span className="text-xs text-gray-400 mx-1">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => handleZoom("in")}
              disabled={zoomLevel >= 2}
              className="p-1 text-gray-400 hover:text-white disabled:text-gray-600"
              title="Zoom In"
            >
              <ZoomIn fontSize="small" />
            </button>
          </div>

          {/* Action buttons */}
          <button
            onClick={() => {
              setIsLoading(true);
              setRefreshKey((prev) => prev + 1);
            }}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Refresh Preview"
          >
            <Refresh fontSize="small" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <FullscreenExit fontSize="small" />
            ) : (
              <Fullscreen fontSize="small" />
            )}
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div
        className={`flex-1 bg-[#303030] relative overflow-auto ${
          currentDevice.width !== "100%"
            ? "flex items-center justify-center p-4"
            : ""
        }`}
      >
        {activeFile ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              key={`${activeFile.name}-${refreshKey}`}
              srcDoc={activeFile.content}
              className={`border-0 bg-white ${
                currentDevice.width !== "100%" ? "shadow-lg" : ""
              }`}
              style={getFrameStyle()}
              sandbox="allow-scripts allow-same-origin"
              title="Preview Output"
              onLoad={() => setIsLoading(false)}
            />
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center p-4">
              <svg
                className="w-12 h-12 mx-auto text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-2">No content to preview</p>
              <p className="text-xs mt-1 text-gray-400">
                {files.length > 0
                  ? "Select a file to preview"
                  : "No files available"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-3 py-1 bg-[#172130] border-t border-gray-700 flex justify-between text-xs text-gray-400">
        <div>
          {activeFile && (
            <span className="flex items-center">
              <span className="mr-2">Viewing:</span>
              <span className="font-medium">{activeFile.name}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {activeFile && currentDevice.width !== "100%" && (
            <span className="flex items-center">
              <span className="mr-2">Resolution:</span>
              <span className="font-medium">
                {currentDevice.width}×{currentDevice.height}
              </span>
            </span>
          )}
          <span className="flex items-center">
            <span className="mr-2">Zoom:</span>
            <span className="font-medium">{Math.round(zoomLevel * 100)}%</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Preview;
