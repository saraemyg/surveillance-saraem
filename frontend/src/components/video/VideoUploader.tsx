import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useVideoUpload } from '@/hooks/useVideoUpload'
import { validateVideoFile } from '@/utils/validators'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface VideoUploaderProps {
  onUploadComplete?: () => void
}

export default function VideoUploader({ onUploadComplete }: VideoUploaderProps) {
  const { upload, reset, uploadedVideo, isUploading, progress, error } =
    useVideoUpload()

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      const validation = validateVideoFile(file)
      if (!validation.valid) {
        return
      }

      upload(file)
    },
    [upload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv'],
    },
    maxFiles: 1,
    disabled: isUploading,
  })

  // Reset when upload is complete and call callback
  if (uploadedVideo && !isUploading) {
    setTimeout(() => {
      reset()
      onUploadComplete?.()
    }, 2000)
  }

  return (
    <Card>
      <CardContent className="p-6">
        {!isUploading && !uploadedVideo && !error && (
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg font-medium">Drop the video here...</p>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">
                  Drag and drop a video file here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to select a file
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats: MP4, AVI, MOV, MKV, WMV, FLV (Max 500MB)
                </p>
              </>
            )}
          </div>
        )}

        {isUploading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} />
            <Button variant="outline" size="sm" onClick={reset}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}

        {uploadedVideo && !error && (
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Upload Complete!</p>
              <p className="text-sm text-green-700">
                {uploadedVideo.filename} uploaded successfully
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div className="flex-1">
              <p className="font-medium text-red-900">Upload Failed</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={reset}>
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
