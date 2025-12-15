import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId || (typeof userId !== "string" && typeof userId !== "number")) {
      return NextResponse.json(
        { success: false, error: "user_id不能为空" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // 检查用户是否已在黑名单中
      const checkResult = await client.query(
        "SELECT user_id FROM blacklist WHERE user_id = $1",
        [userId]
      );

      if (checkResult.rowCount && checkResult.rowCount > 0) {
        return NextResponse.json(
          { success: false, error: "该用户已在黑名单中" },
          { status: 400 }
        );
      }

      // 使用参数化查询防止SQL注入，插入新记录
      const result = await client.query(
        "INSERT INTO blacklist (user_id) VALUES ($1) RETURNING user_id",
        [userId]
      );

      return NextResponse.json({
        success: true,
        data: result.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Database blacklist error:", error);
    
    // 处理唯一约束冲突
    if (error.code === "23505") {
      return NextResponse.json(
        { success: false, error: "该用户已在黑名单中" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "添加到黑名单失败",
      },
      { status: 500 }
    );
  }
}

