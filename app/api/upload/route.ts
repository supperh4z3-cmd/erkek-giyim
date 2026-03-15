import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const BUCKET = "media";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("files") as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
        }

        // Bucket yoksa oluştur (ilk seferde)
        const { data: buckets } = await supabaseAdmin.storage.listBuckets();
        const bucketExists = buckets?.some(b => b.name === BUCKET);
        if (!bucketExists) {
            await supabaseAdmin.storage.createBucket(BUCKET, {
                public: true,
                fileSizeLimit: 52428800, // 50MB
                allowedMimeTypes: [
                    "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
                    "video/mp4", "video/webm", "video/quicktime",
                ],
            });
        }

        const uploadedFiles: string[] = [];

        for (const file of files) {
            // Dosya boyutu kontrolü (max 50MB)
            if (file.size > 50 * 1024 * 1024) {
                return NextResponse.json(
                    { error: `${file.name}: Dosya boyutu 50MB'ı aşamaz` },
                    { status: 400 }
                );
            }

            // Dosya tipi kontrolü
            const allowedTypes = [
                "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
                "video/mp4", "video/webm", "video/quicktime",
            ];
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json(
                    { error: `${file.name}: Geçersiz dosya tipi` },
                    { status: 400 }
                );
            }

            // Benzersiz dosya adı
            const ext = file.name.split(".").pop() || "bin";
            const baseName = file.name
                .replace(/\.[^.]+$/, "")
                .replace(/[^a-zA-Z0-9-_]/g, "-")
                .toLowerCase();
            const uniqueName = `${baseName}-${Date.now()}.${ext}`;
            const storagePath = `uploads/${uniqueName}`;

            // Supabase Storage'a yükle
            const arrayBuffer = await file.arrayBuffer();
            const { error: uploadError } = await supabaseAdmin.storage
                .from(BUCKET)
                .upload(storagePath, arrayBuffer, {
                    contentType: file.type,
                    upsert: false,
                });

            if (uploadError) {
                console.error("Supabase upload hatası:", uploadError);
                return NextResponse.json(
                    { error: `${file.name}: Yükleme başarısız — ${uploadError.message}` },
                    { status: 500 }
                );
            }

            // Public URL al
            const { data: urlData } = supabaseAdmin.storage
                .from(BUCKET)
                .getPublicUrl(storagePath);

            uploadedFiles.push(urlData.publicUrl);
        }

        return NextResponse.json({
            success: true,
            urls: uploadedFiles,
        });
    } catch (err) {
        console.error("Upload hatası:", err);
        return NextResponse.json(
            { error: "Dosya yükleme sırasında hata oluştu" },
            { status: 500 }
        );
    }
}
