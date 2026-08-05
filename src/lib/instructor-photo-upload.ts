export const INSTRUCTOR_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export function validateInstructorPhotoFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "画像ファイルを選択してください";
  }
  if (file.size > INSTRUCTOR_PHOTO_MAX_BYTES) {
    return "画像サイズは5MB以下にしてください";
  }
  return null;
}

export function instructorPhotoExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  const fromType = file.type.split("/")[1];
  if (fromType === "jpeg") return "jpg";
  if (fromType) return fromType;
  return "jpg";
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}
