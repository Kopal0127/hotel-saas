import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "hotelpro";

    if (!file) {
      return NextResponse.json({ error: "File chahiye!" }, { status: 400 });
    }

    // File to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Cloudinary pe upload
    const result = await cloudinary.uploader.upload(base64, {
      folder: `hotelpro/${folder}`,
      resource_type: "image",
      transformation: [
        { width: 1200, height: 800, crop: "fill" },
        { quality: "auto" },
        { fetch_format: "auto" }
      ]
    });

    return NextResponse.json({
      message: "Upload ho gaya!",
      url: result.secure_url,
      publicId: result.public_id,
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload nahi ho saka!" }, { status: 500 });
  }
}