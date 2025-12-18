import { NextResponse } from "next/server";
import { read, readByPattern, save, remove } from "@/lib/redis";

// Redis 键前缀常量
const NOTE_KEY_PREFIX = "invitation:note:";

// 构建备注的 Redis 键
function buildNoteKey(codeId: string): string {
  return `${NOTE_KEY_PREFIX}${codeId}`;
}

// 从 Redis 键中提取邀请码 ID
function extractCodeId(redisKey: string): string {
  return redisKey.replace(NOTE_KEY_PREFIX, "");
}

// GET - 获取所有备注或特定邀请码的备注
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codeId = searchParams.get("codeId");

    if (codeId) {
      const key = buildNoteKey(codeId);
      const note = await read(key);
      return NextResponse.json({
        success: true,
        note: note || "",
      });
    }

    // 获取所有备注
    const pattern = `${NOTE_KEY_PREFIX}*`;
    const notes = await readByPattern(pattern, extractCodeId);
    return NextResponse.json({
      success: true,
      notes,
    });
  } catch (error: any) {
    console.error("Error reading notes:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "读取备注失败",
      },
      { status: 500 }
    );
  }
}

// POST - 更新或创建备注
export async function POST(request: Request) {
  try {
    const { codeId, note } = await request.json();

    if (!codeId) {
      return NextResponse.json(
        { success: false, error: "邀请码ID不能为空" },
        { status: 400 }
      );
    }

    const key = buildNoteKey(codeId);

    if (!note || note.trim() === "") {
      // 如果备注为空，删除键
      await remove(key);
      return NextResponse.json({
        success: true,
        message: "备注已删除",
        note: "",
      });
    }

    // 保存备注到 Redis
    await save(key, note);

    return NextResponse.json({
      success: true,
      message: "备注已保存",
      note: note,
    });
  } catch (error: any) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "保存备注失败",
      },
      { status: 500 }
    );
  }
}

// DELETE - 删除备注
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codeId = searchParams.get("codeId");

    if (!codeId) {
      return NextResponse.json(
        { success: false, error: "邀请码ID不能为空" },
        { status: 400 }
      );
    }

    const key = buildNoteKey(codeId);
    await remove(key);

    return NextResponse.json({
      success: true,
      message: "备注已删除",
    });
  } catch (error: any) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "删除备注失败",
      },
      { status: 500 }
    );
  }
}
