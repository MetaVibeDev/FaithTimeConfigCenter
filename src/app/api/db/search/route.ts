import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { searchText, page = 1, limit = 50, offset } = await request.json();

    if (!searchText || typeof searchText !== "string") {
      return NextResponse.json(
        { success: false, error: "搜索关键词不能为空" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // 使用参数化查询防止SQL注入，只选择指定字段，支持分页
      const calculatedOffset = offset !== undefined ? offset : (page - 1) * limit;
      const result = await client.query(
        "SELECT post_id, author_id, title, content, is_public FROM posts WHERE content LIKE $1 ORDER BY post_id DESC LIMIT $2 OFFSET $3",
        [`%${searchText}%`, limit, calculatedOffset]
      );

      return NextResponse.json({
        success: true,
        data: result.rows,
        columns: result.fields.map((field) => ({
          name: field.name,
          dataTypeID: field.dataTypeID,
        })),
        rowCount: result.rowCount,
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Database search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "数据库搜索失败",
      },
      { status: 500 }
    );
  }
}

