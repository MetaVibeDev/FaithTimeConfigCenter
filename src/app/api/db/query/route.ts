import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { success: false, error: "查询语句不能为空" },
        { status: 400 }
      );
    }

    // 安全检查：只允许SELECT查询
    const trimmedQuery = query.trim().toUpperCase();
    if (!trimmedQuery.startsWith("SELECT")) {
      return NextResponse.json(
        { success: false, error: "只允许执行SELECT查询" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(query);

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
    console.error("Database query error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "数据库查询失败",
      },
      { status: 500 }
    );
  }
}
