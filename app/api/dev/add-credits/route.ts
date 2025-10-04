/**
 * 开发环境专用 - 手动添加积分 API
 * POST /api/dev/add-credits
 *
 * ⚠️ 仅在开发环境使用,生产环境会被禁用
 */

import { NextRequest } from "next/server";
import { respData, respErr } from "@/lib/resp";
import { increaseCredits, CreditsTransType } from "@/services/credit";
import { getUserUuid } from "@/services/user";
import { getOneYearLaterTimestr } from "@/lib/time";

// 仅在开发环境启用
const isDev = process.env.NODE_ENV === "development";

interface AddCreditsRequest {
  /** 要添加的积分数量 */
  credits: number;
  /** 可选: 指定用户 UUID (不填则给当前登录用户) */
  userUuid?: string;
}

export async function POST(req: NextRequest) {
  // 生产环境禁用
  if (!isDev) {
    return respErr("此 API 仅在开发环境可用");
  }

  try {
    const body: AddCreditsRequest = await req.json();
    const { credits = 1000, userUuid } = body;

    // 验证积分数量
    if (credits <= 0 || credits > 100000) {
      return respErr("积分数量必须在 1-100000 之间");
    }

    // 获取用户 UUID
    let targetUserUuid = userUuid;
    if (!targetUserUuid) {
      targetUserUuid = await getUserUuid();
      if (!targetUserUuid) {
        return respErr("请先登录或提供 userUuid 参数");
      }
    }

    // 添加积分
    await increaseCredits({
      user_uuid: targetUserUuid,
      trans_type: CreditsTransType.SystemAdd,
      credits: credits,
      expired_at: getOneYearLaterTimestr(),
    });

    return respData({
      message: `成功添加 ${credits} 积分`,
      userUuid: targetUserUuid,
      credits: credits,
    });

  } catch (error) {
    console.error("添加积分失败:", error);
    return respErr(
      error instanceof Error ? error.message : "添加积分失败"
    );
  }
}

export async function GET() {
  if (!isDev) {
    return respErr("此 API 仅在开发环境可用");
  }

  return respData({
    message: "开发环境积分管理 API",
    usage: {
      method: "POST",
      endpoint: "/api/dev/add-credits",
      body: {
        credits: "积分数量 (默认 1000)",
        userUuid: "可选: 指定用户 UUID",
      },
      example: `
curl -X POST http://localhost:3000/api/dev/add-credits \\
  -H "Content-Type: application/json" \\
  -d '{"credits": 1000}'
      `.trim(),
    },
  });
}
