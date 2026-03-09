import { NextRequest, NextResponse } from "next/server";
import { S3Storage } from "coze-coding-dev-sdk";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "缺少文件key" },
        { status: 400 }
      );
    }

    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: "",
      secretKey: "",
      bucketName: process.env.COZE_BUCKET_NAME,
      region: "cn-beijing",
    });

    const url = await storage.generatePresignedUrl({
      key,
      expireTime: 3600, // 1小时有效期
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("获取文件URL错误:", error);
    return NextResponse.json(
      { error: "获取文件URL失败" },
      { status: 500 }
    );
  }
}
