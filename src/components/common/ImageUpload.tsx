// src/components/common/ImageUpload.tsx
'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Upload, X } from 'lucide-react'

interface ImageUploadProps {
  label: string
  description?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number // MB
  accept?: string
  onFilesChange: (files: File[]) => void
  currentFiles: File[]
  existingImages?: string[] // 기존 이미지 URLs (수정 시 사용)
  onRemoveExisting?: (url: string) => void
}

export const ImageUpload = ({
  label,
  description,
  multiple = false,
  maxFiles = 5,
  maxSize = 10,
  accept = "image/*",
  onFilesChange,
  currentFiles,
  existingImages = [],
  onRemoveExisting
}: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 파일 유효성 검사
  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `파일 크기는 ${maxSize}MB 이하여야 합니다.`
    }

    if (!file.type.startsWith('image/')) {
      return '이미지 파일만 업로드 가능합니다.'
    }

    return null
  }

  // 파일 처리
  const handleFiles = (files: FileList) => {
    const newFiles: File[] = []
    const errors: string[] = []

    // 파일 개수 체크
    const totalFiles = currentFiles.length + existingImages.length + files.length
    if (totalFiles > maxFiles) {
      errors.push(`최대 ${maxFiles}개까지 업로드 가능합니다.`)
      return
    }

    // 각 파일 유효성 검사
    Array.from(files).forEach((file) => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        newFiles.push(file)
      }
    })

    if (errors.length > 0) {
      alert(errors.join('\n'))
      return
    }

    // 단일 파일 모드일 때는 기존 파일 교체
    if (!multiple && newFiles.length > 0) {
      onFilesChange([newFiles[0]])
    } else {
      onFilesChange([...currentFiles, ...newFiles])
    }
  }

  // 드래그 앤 드롭 핸들러
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  // 파일 제거
  const removeFile = (index: number) => {
    const newFiles = currentFiles.filter((_, i) => i !== index)
    onFilesChange(newFiles)
  }

  // 파일 선택 창 열기
  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  // 이미지 미리보기 URL 생성
  const getPreviewUrl = (file: File) => {
    return URL.createObjectURL(file)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{label}</Label>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>

      {/* 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 드롭존 */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">
          클릭하거나 파일을 드래그해서 업로드하세요
        </p>
        <p className="text-sm text-gray-400">
          {multiple ? `최대 ${maxFiles}개` : '1개'} 파일, 
          각 파일당 최대 {maxSize}MB
        </p>
      </div>

      {/* 기존 이미지들 (수정 시) */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <Label>기존 이미지</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {existingImages.map((url, index) => (
              <Card key={index} className="relative group">
                <CardContent className="p-2">
                  <div className="aspect-square relative overflow-hidden rounded">
                    <img
                      src={url}
                      alt={`기존 이미지 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {onRemoveExisting && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onRemoveExisting(url)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 새로 선택된 파일들 미리보기 */}
      {currentFiles.length > 0 && (
        <div className="space-y-2">
          <Label>선택된 파일</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentFiles.map((file, index) => (
              <Card key={index} className="relative group">
                <CardContent className="p-2">
                  <div className="aspect-square relative overflow-hidden rounded">
                    <img
                      src={getPreviewUrl(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(1)}MB
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 파일 개수 표시 */}
      {multiple && (
        <p className="text-sm text-gray-500">
          {currentFiles.length + existingImages.length} / {maxFiles} 파일 선택됨
        </p>
      )}
    </div>
  )
}