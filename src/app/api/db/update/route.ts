import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { postId, isPublic } = await request.json();

    if (postId === undefined || postId === null) {
      return NextResponse.json(
        { success: false, error: "post_id不能为空" },
        { status: 400 }
      );
    }

    if (typeof isPublic !== "boolean") {
      return NextResponse.json(
        { success: false, error: "is_public必须是布尔值" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // 使用参数化查询防止SQL注入
      const result = await client.query(
        "UPDATE posts SET is_public = $1 WHERE post_id = $2 RETURNING post_id, is_public",
        [isPublic, postId]
      );

      if (result.rowCount === 0) {
        return NextResponse.json(
          { success: false, error: "未找到对应的帖子" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: result.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Database update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "数据库更新失败",
      },
      { status: 500 }
    );
  }
}

