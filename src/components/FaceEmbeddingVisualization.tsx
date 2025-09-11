import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Upload, 
  Camera, 
  Eye, 
  AlertCircle, 
  CheckCircle, 
  Scan,
  Zap,
  Target,
  Map
} from 'lucide-react';
import { toast } from 'sonner';

interface FacePoint {
  x: number;
  y: number;
  type: 'corner' | 'center' | 'keypoint' | 'feature';
}

interface FaceDetectionResult {
  success: boolean;
  face_detected: boolean;
  bounding_box: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
  };
  face_points: FacePoint[];
  embedding_size: number;
  confidence: number;
  image_dimensions: {
    width: number;
    height: number;
  };
}

interface FaceEmbeddingVisualizationProps {
  registerNumber?: string;
  onEmbeddingGenerated?: (data: FaceDetectionResult) => void;
  onFaceRegistered?: () => void;
}

export function FaceEmbeddingVisualization({ 
  registerNumber, 
  onEmbeddingGenerated,
  onFaceRegistered
}: FaceEmbeddingVisualizationProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [faceData, setFaceData] = useState<FaceDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<string>('idle');
  interface CameraDebugInfo {
    trackLabel?: string;
    trackReadyState?: string;
    trackMuted?: boolean;
    constraints?: MediaTrackConstraints | undefined;
    settings?: MediaTrackSettings | undefined;
  }
  const [debugInfo, setDebugInfo] = useState<CameraDebugInfo>({});
  const [isRegistering, setIsRegistering] = useState(false);
  const [lastCapturedFile, setLastCapturedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);

  const drawVisualization = useCallback((data: FaceDetectionResult) => {
    const canvas = canvasRef.current;
    const image = new Image();
    
    if (!canvas || !imagePreview) return;
    
    image.onload = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size to match image aspect ratio
      const maxWidth = 600;
      const maxHeight = 400;
      let { width, height } = data.image_dimensions;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw the image
      ctx.drawImage(image, 0, 0, width, height);
      
      // Calculate scale factors
      const scaleX = width / data.image_dimensions.width;
      const scaleY = height / data.image_dimensions.height;
      
      // Draw bounding box
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        data.bounding_box.x1 * scaleX,
        data.bounding_box.y1 * scaleY,
        data.bounding_box.width * scaleX,
        data.bounding_box.height * scaleY
      );
      
      // Draw face points
      data.face_points.forEach((point) => {
        const x = point.x * scaleX;
        const y = point.y * scaleY;
        
        ctx.beginPath();
        
        switch (point.type) {
          case 'corner':
            ctx.fillStyle = '#ef4444';
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            break;
          case 'center':
            ctx.fillStyle = '#10b981';
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            break;
          case 'keypoint':
            ctx.fillStyle = '#f59e0b';
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            break;
          case 'feature':
            ctx.fillStyle = '#8b5cf6';
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            break;
        }
        
        ctx.fill();
        
        // Add a small white border for visibility
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      
      // Add confidence text
      ctx.fillStyle = '#1f2937';
      ctx.font = '14px Arial';
      ctx.fillText(
        `Confidence: ${(data.confidence * 100).toFixed(1)}%`,
        10,
        height - 10
      );
    };
    
    image.src = imagePreview;
  }, [imagePreview]);

  const processImage = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setFaceData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8085/process_face/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process image');
      }

      const result: FaceDetectionResult = await response.json();
      
      if (result.success && result.face_detected) {
        setFaceData(result);
        setLastCapturedFile(file);
        onEmbeddingGenerated?.(result);
        toast.success(`Face detected! Extracted ${result.embedding_size} features`);
        
        // Draw visualization on canvas
        setTimeout(() => drawVisualization(result), 100);
      } else {
        throw new Error('No face detected in the image');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process image';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [onEmbeddingGenerated, drawVisualization]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('Image size should be less than 10MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Process the image
    await processImage(file);
  }, [processImage]);



  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsVideoPlaying(false);
      setCameraStatus('requesting');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera is not supported in this browser');
      }

      // Prefer a simple, broadly supported constraint first
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false
        });
      } catch {
        // Fallback to any video device
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setStream(mediaStream);
      setIsCameraOpen(true);
      setCameraStatus('stream-acquired');

      const video = videoRef.current;
      if (video) {
        // Clear any existing source first
        video.srcObject = null;
        video.src = '';

        // Set up video element properties
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.muted = true;
        video.autoplay = true;
        video.controls = false;

        // Bind the stream
        video.srcObject = mediaStream;
        setCameraStatus('binding-video');

        const primaryTrack = mediaStream.getVideoTracks()[0];
        setDebugInfo({
          trackLabel: primaryTrack?.label,
          trackReadyState: primaryTrack?.readyState,
          trackMuted: primaryTrack?.muted,
          constraints: primaryTrack?.getConstraints?.(),
          settings: primaryTrack?.getSettings?.()
        });

        // Force a load to ensure metadata is available
        video.load();

        let playAttempts = 0;
        const tryPlay = async () => {
          if (!video) return;

          try {
            // Ensure video is ready
            if (video.readyState === 0) {
              await new Promise(resolve => {
                const onLoadStart = () => {
                  video.removeEventListener('loadstart', onLoadStart);
                  resolve(void 0);
                };
                video.addEventListener('loadstart', onLoadStart);
              });
            }

            await video.play();
            setCameraStatus('playing');
          } catch (err) {
            playAttempts++;
            console.warn(`Play attempt ${playAttempts} failed:`, err);

            if (playAttempts < 5) {
              setTimeout(tryPlay, 300);
            } else {
              console.error('All play attempts failed');
              setCameraStatus('play-failed');

              // Try user interaction fallback
              setTimeout(() => {
                const forcePlayBtn = document.createElement('button');
                forcePlayBtn.innerText = 'Click to Start Camera';
                forcePlayBtn.style.cssText = `
                  position: fixed;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  z-index: 9999;
                  padding: 10px 20px;
                  background: white;
                  border: 2px solid black;
                  cursor: pointer;
                `;
                forcePlayBtn.onclick = async () => {
                  try {
                    await video.play();
                    setCameraStatus('user-triggered-play');
                    document.body.removeChild(forcePlayBtn);
                  } catch (e) {
                    console.error('User-triggered play failed:', e);
                  }
                };
                document.body.appendChild(forcePlayBtn);
              }, 1000);
            }
          }
        };

        const onLoadedMetadata = () => {
          console.log('Video metadata loaded:', video.videoWidth, 'x', video.videoHeight);
          setCameraStatus('metadata-loaded');
          
          // Ensure video element dimensions match the video stream
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            video.width = video.videoWidth;
            video.height = video.videoHeight;
          }
        };

        const onLoadedData = () => {
          console.log('Video data loaded');
          if (video.videoWidth > 0) {
            setIsVideoPlaying(true);
            setCameraStatus('frames-flowing');
          }
        };

        const onCanPlay = () => {
          console.log('Video can play');
          setIsVideoPlaying(true);
          setCameraStatus('can-play');
          
          // Force a repaint to ensure video is visible
          if (video) {
            video.style.display = 'none';
            void video.offsetHeight; // Trigger reflow
            video.style.display = 'block';
          }
        };

        const onPlaying = () => {
          console.log('Video playing');
          setIsVideoPlaying(true);
          setCameraStatus('playing');
          
          // Ensure video dimensions are set for proper rendering
          if (video && video.videoWidth > 0 && video.videoHeight > 0) {
            video.width = video.videoWidth;
            video.height = video.videoHeight;
          }
        };

        const onWaiting = () => {
          console.log('Video waiting');
          setIsVideoPlaying(false);
          setCameraStatus('waiting');
        };

        const onError = (e: Event) => {
          console.error('Video error:', e);
          setIsVideoPlaying(false);
          setCameraStatus('error');
        };

        const onTrackEnded = () => {
          console.log('Track ended');
          setCameraStatus('track-ended');
          setIsVideoPlaying(false);
        };

        if (primaryTrack) primaryTrack.addEventListener('ended', onTrackEnded as EventListener);

        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('loadeddata', onLoadedData);
        video.addEventListener('canplay', onCanPlay);
        video.addEventListener('playing', onPlaying);
        video.addEventListener('waiting', onWaiting);
        video.addEventListener('error', onError);

        // Start playing immediately
        tryPlay();

        // Cleanup function
        const cleanupListeners = () => {
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('loadeddata', onLoadedData);
          video.removeEventListener('canplay', onCanPlay);
          video.removeEventListener('playing', onPlaying);
          video.removeEventListener('waiting', onWaiting);
          video.removeEventListener('error', onError);
          if (primaryTrack) primaryTrack.removeEventListener('ended', onTrackEnded as EventListener);
        };

        (video as HTMLVideoElement & { __cleanupCameraListeners?: () => void }).__cleanupCameraListeners = cleanupListeners;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      let errorMessage = 'Unable to access camera.';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') errorMessage = 'Camera permission denied. Enable it and retry.';
        else if (err.name === 'NotFoundError') errorMessage = 'No camera device found.';
        else if (err.name === 'NotReadableError') errorMessage = 'Camera is in use by another application.';
        else errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
      setIsCameraOpen(false);
      setCameraStatus('error');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      const extended = videoRef.current as HTMLVideoElement & { __cleanupCameraListeners?: () => void };
      if (extended.__cleanupCameraListeners) {
        extended.__cleanupCameraListeners();
      }
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current.removeAttribute('src');
    }
    setIsCameraOpen(false);
    setIsVideoPlaying(false);
  }, [stream]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !captureCanvasRef.current) {
      toast.error('Camera not ready for capture');
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = captureCanvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        toast.error('Canvas not available');
        return;
      }

      // Check if video is ready
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        toast.error('Video not ready. Please wait for camera to initialize.');
        return;
      }

      // Capture current video frame

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas (flip horizontally to match preview)
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      toast.success('Photo captured! Processing...');

      // Convert canvas to blob and process
      canvas.toBlob(async (blob) => {
        if (blob) {
          // Create preview
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          setImagePreview(dataUrl);

          // Process the captured image
          const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
          await processImage(file);

          // Stop camera after capture
          stopCamera();
        } else {
          toast.error('Failed to create image from capture');
        }
      }, 'image/jpeg', 0.9);
    } catch (err) {
      console.error('Error capturing photo:', err);
      toast.error('Failed to capture photo: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [processImage, stopCamera]);

  const registerFaceEmbedding = useCallback(async () => {
    if (!registerNumber || !lastCapturedFile) {
      toast.error('Cannot register: missing register number or image');
      return;
    }

    setIsRegistering(true);
    try {
      const formData = new FormData();
      formData.append('register_number', registerNumber);
      formData.append('file', lastCapturedFile);

      const response = await fetch('http://localhost:8085/register_from_dashboard/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to register face');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Face recognition registered successfully!');
        onFaceRegistered?.();
      } else {
        throw new Error('Registration failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register face';
      toast.error(errorMessage);
    } finally {
      setIsRegistering(false);
    }
  }, [registerNumber, lastCapturedFile, onFaceRegistered]);

  // Single cleanup effect
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const getPointTypeColor = (type: string) => {
    switch (type) {
      case 'corner': return 'bg-red-500';
      case 'center': return 'bg-green-500';
      case 'keypoint': return 'bg-yellow-500';
      case 'feature': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };



  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Face Embedding Visualization
          </CardTitle>
          <CardDescription>
            Upload an image or take a photo to see how face recognition features are extracted and processed
            {registerNumber && ` for student ${registerNumber}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          {!isCameraOpen ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isProcessing 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {isProcessing ? (
                <div className="space-y-4">
                  <div className="mx-auto"><LoadingSpinner /></div>
                  <p className="text-sm text-muted-foreground">
                    Processing image and extracting facial features...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-3 bg-gray-100 rounded-full">
                      <Upload className="h-8 w-8 text-gray-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-medium">Upload a face image or take a photo</p>
                    <p className="text-sm text-muted-foreground">
                      Drag and drop an image here, or use the options below
                    </p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                    <Button
                      variant="outline"
                      onClick={startCamera}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Camera Interface */
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden min-h-[400px] flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  webkit-playsinline="true"
                  muted
                  controls={false}
                  disablePictureInPicture
                  disableRemotePlayback
                  preload="none"
                  className="w-full h-full max-w-2xl rounded-lg"
                  style={{ 
                    minHeight: '300px',
                    maxHeight: '500px',
                    objectFit: 'cover',
                    backgroundColor: '#000000',
                    transform: 'none' // Explicitly disable any transforms
                  }}
                />
                {/* Loading indicator while camera initializes */}
                {(!stream || !isVideoPlaying) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white gap-3">
                    <LoadingSpinner />
                    <p className="text-sm font-medium">
                      {!stream ? 'Requesting camera access…' : 'Starting video feed…'}
                    </p>
                    <p className="text-xs opacity-70">Status: {cameraStatus}</p>
                    {debugInfo.trackLabel && (
                      <div className="text-[10px] leading-tight max-w-[240px] text-center opacity-60">
                        <div>Track: {debugInfo.trackLabel}</div>
                        <div>Ready: {debugInfo.trackReadyState}</div>
                        <div>Muted: {String(debugInfo.trackMuted)}</div>
                      </div>
                    )}
                    {stream && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const v = videoRef.current;
                          if (v) {
                            v.play().catch(() => {
                              toast.error('Manual start failed');
                            });
                          }
                        }}
                        className="bg-white text-black hover:bg-gray-200"
                      >
                        Force Start
                      </Button>
                    )}
                  </div>
                )}
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  <Button
                    size="lg"
                    onClick={capturePhoto}
                    disabled={!stream || !isVideoPlaying}
                    className="bg-white text-gray-900 hover:bg-gray-100 rounded-full h-16 w-16 p-0 disabled:opacity-50"
                  >
                    <Camera className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={stopCamera}
                    className="bg-red-500 text-white hover:bg-red-600 border-red-500"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Position your face in the camera and click the capture button
              </p>
            </div>
          )}

          {/* Hidden canvas for photo capture */}
          <canvas ref={captureCanvasRef} className="hidden" />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {faceData && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Face detected successfully! Generated {faceData.embedding_size} feature embeddings 
                with {(faceData.confidence * 100).toFixed(1)}% confidence.
              </AlertDescription>
            </Alert>
          )}

          {/* Action buttons when image is processed */}
          {imagePreview && !isCameraOpen && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setImagePreview(null);
                  setFaceData(null);
                  setError(null);
                  setLastCapturedFile(null);
                }}
              >
                Clear Image
              </Button>
              <Button
                variant="outline"
                onClick={startCamera}
              >
                <Camera className="h-4 w-4 mr-2" />
                Take New Photo
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Another
              </Button>
              {registerNumber && faceData && lastCapturedFile && (
                <Button
                  onClick={registerFaceEmbedding}
                  disabled={isRegistering}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isRegistering ? (
                    <>
                      <LoadingSpinner />
                      Registering...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Register Face
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visualization Results */}
      {imagePreview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Image with Overlay */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Face Detection Points
              </CardTitle>
              <CardDescription>
                Visual representation of detected facial features and embeddings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <canvas
                  ref={canvasRef}
                  className="w-full border rounded-lg"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                
                {faceData && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Detection Points:</span>
                      <span className="ml-2 font-medium">{faceData.face_points.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className="ml-2 font-medium">{(faceData.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Face Width:</span>
                      <span className="ml-2 font-medium">{faceData.bounding_box.width}px</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Face Height:</span>
                      <span className="ml-2 font-medium">{faceData.bounding_box.height}px</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Feature Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Feature Analysis
              </CardTitle>
              <CardDescription>
                Breakdown of detected facial features and embedding points
              </CardDescription>
            </CardHeader>
            <CardContent>
              {faceData ? (
                <div className="space-y-4">
                  {/* Embedding Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Embeddings</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{faceData.embedding_size}</p>
                      <p className="text-xs text-muted-foreground">Feature dimensions</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Map className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Points</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">{faceData.face_points.length}</p>
                      <p className="text-xs text-muted-foreground">Detection points</p>
                    </div>
                  </div>

                  {/* Point Types Legend */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Detection Point Types</h4>
                    <div className="space-y-2">
                      {[...new Set(faceData.face_points.map(p => p.type))].map(type => {
                        const count = faceData.face_points.filter(p => p.type === type).length;
                        return (
                          <div key={type} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getPointTypeColor(type)}`} />
                              <span className="capitalize">{type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {count}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Face Bounding Box Info */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Face Boundaries</h4>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Top-Left:</span>
                        <span>({faceData.bounding_box.x1}, {faceData.bounding_box.y1})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bottom-Right:</span>
                        <span>({faceData.bounding_box.x2}, {faceData.bounding_box.y2})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dimensions:</span>
                        <span>{faceData.bounding_box.width} × {faceData.bounding_box.height}</span>
                      </div>
                    </div>
                  </div>

                  {/* Processing Quality */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Processing Quality</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Detection Confidence</span>
                        <Badge 
                          variant={faceData.confidence > 0.8 ? "default" : faceData.confidence > 0.6 ? "secondary" : "destructive"}
                        >
                          {(faceData.confidence * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${faceData.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Upload an image to see feature analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}