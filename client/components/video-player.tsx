"use client";

import { useState } from "react";

interface VideoPlayerProps {
  videoPath: string;
  title?: string;
  adminOnly?: boolean;
  className?: string;
  poster?: string;
}

export function VideoPlayer({
  videoPath,
  title,
  adminOnly = false,
  className = "",
  poster,
}: VideoPlayerProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const videoSrc = adminOnly 
    ? `/api/admin/video/${videoPath}`
    : `/api/video/${videoPath}`;

  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleCanPlay = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError("فشل في تحميل الفيديو. تأكد من صحة الرابط والصلاحيات.");
  };

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">جاري تحميل الفيديو...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
          <div className="text-center p-4">
            <div className="text-red-600 mb-2">⚠️</div>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <video
        controls
        className={`w-full rounded-lg shadow-lg ${loading ? 'opacity-0' : 'opacity-100'}`}
        poster={poster}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
        preload="metadata"
      >
        <source src={videoSrc} type="video/mp4" />
        <source src={videoSrc} type="video/webm" />
        <source src={videoSrc} type="video/ogg" />
        متصفحك لا يدعم تشغيل الفيديو.
      </video>

      {title && (
        <div className="mt-2">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {adminOnly && (
            <span className="inline-block mt-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
              للمشرفين فقط
            </span>
          )}
        </div>
      )}
    </div>
  );
}
