"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, Upload, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validateInstructorPhotoFile } from "@/lib/instructor-photo-upload";

type Props = {
  avatarUrl: string;
  onAvatarUrlChange: (url: string) => void;
  uploadSessionId: string;
  onError?: (message: string) => void;
};

export function InstructorPhotoUpload({
  avatarUrl,
  onAvatarUrlChange,
  uploadSessionId,
  onError,
}: Props) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    const validationError = validateInstructorPhotoFile(file);
    if (validationError) {
      onError?.(validationError);
      return;
    }

    setUploading(true);
    onError?.("");

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("sessionId", uploadSessionId);

      const res = await fetch("/api/instructor/apply/photo", {
        method: "POST",
        body,
      });
      const data = await res.json();

      if (!res.ok) {
        onError?.(data.error || "写真のアップロードに失敗しました");
        return;
      }

      onAvatarUrlChange(data.url);
    } catch {
      onError?.("通信エラーが発生しました。しばらくしてから再度お試しください。");
    } finally {
      setUploading(false);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="sm:col-span-2">
      <p className="mb-1.5 block text-sm font-medium text-gray-700">
        顔写真・イメージ画像
      </p>
      <p className="mb-3 text-xs text-gray-500">
        顔写真、イラスト、イメージ画像のいずれでも構いません。カメラで撮影するか、ファイルをアップロードしてください（任意・5MBまで）。
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative mx-auto h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100 sm:mx-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="プロフィール画像"
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <UserCircle className="h-12 w-12 text-gray-300" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => cameraInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Camera className="mr-1.5 h-4 w-4" />
              )}
              カメラで撮る
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-1.5 h-4 w-4" />
              )}
              ファイルを選択
            </Button>
          </div>
          {avatarUrl && (
            <button
              type="button"
              onClick={() => onAvatarUrlChange("")}
              className="text-left text-xs text-gray-400 hover:text-red-500"
              disabled={uploading}
            >
              画像を削除
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
