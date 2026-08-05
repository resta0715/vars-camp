import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  INSTRUCTOR_PHOTO_MAX_BYTES,
  instructorPhotoExtension,
  isUuid,
} from "@/lib/instructor-photo-upload";

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "画像ファイルが必要です" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "画像ファイルを選択してください" }, { status: 400 });
  }
  if (file.size > INSTRUCTOR_PHOTO_MAX_BYTES) {
    return NextResponse.json({ error: "画像サイズは5MB以下にしてください" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let folder: string;
  if (user) {
    folder = user.id;
  } else {
    const sessionId = String(formData.get("sessionId") || "").trim();
    if (!isUuid(sessionId)) {
      return NextResponse.json({ error: "セッションIDが不正です" }, { status: 400 });
    }
    folder = `applications/${sessionId}`;
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: "画像アップロードの設定が完了していません" },
      { status: 503 }
    );
  }

  const ext = instructorPhotoExtension(file);
  const path = `${folder}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from("instructor-photos")
    .upload(path, buffer, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "写真のアップロードに失敗しました: " + uploadError.message },
      { status: 500 }
    );
  }

  const { data } = admin.storage.from("instructor-photos").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
