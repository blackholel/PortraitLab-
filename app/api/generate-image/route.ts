/**
 * AI 肖像风格生成 API
 * POST /api/generate-image
 */

import { NextRequest } from "next/server";
import { respData, respErr } from "@/lib/resp";
import { getUserUuid } from "@/services/user";
import { getUserCredits, decreaseCredits, CreditsTransType, CreditsAmount } from "@/services/credit";
import { generateImageWithDoubao } from "@/lib/doubao";
import { getStyleById, isValidStyleId } from "@/lib/style-presets";

// Vercel Pro 支持最长 5 分钟超时
export const maxDuration = 300;

interface GenerateImageRequest {
  /** 用户上传的肖像图片 (Base64 格式) */
  imageBase64: string;
  /** 选择的风格 ID */
  styleId: string;
}

interface GenerateImageResponse {
  /** 生成的图片 URL */
  imageUrl: string;
  /** 剩余积分 */
  remainingCredits: number;
  /** 请求 ID (用于追踪和调试) */
  requestId?: string;
}

export async function POST(req: NextRequest) {
  try {
    // 1. 身份验证
    const user_uuid = await getUserUuid();
    if (!user_uuid) {
      return respErr("请先登录");
    }

    // 2. 解析请求参数
    const body: GenerateImageRequest = await req.json();
    const { imageBase64, styleId } = body;

    // 3. 参数验证
    if (!imageBase64 || !imageBase64.startsWith("data:image/")) {
      return respErr("图片格式错误,请上传有效的图片");
    }

    if (!styleId || !isValidStyleId(styleId)) {
      return respErr("风格选择无效");
    }

    // 4. 检查积分
    const userCredits = await getUserCredits(user_uuid);
    const requiredCredits = CreditsAmount.ImageGenCost;

    if (userCredits.left_credits < requiredCredits) {
      return respErr(`积分不足,需要 ${requiredCredits} 积分,当前剩余 ${userCredits.left_credits} 积分`);
    }

    // 5. 获取风格配置
    const style = getStyleById(styleId);
    if (!style) {
      return respErr("风格配置未找到");
    }

    // 6. 调用豆包 API 生成图片
    let generatedImageUrl: string;
    let requestId: string | undefined;

    try {
      const result = await generateImageWithDoubao({
        userImageBase64: imageBase64,
        styleReferenceUrl: style.referenceUrl,
        stylePrompt: style.prompt,
        size: "2K",
        watermark: false,
      });

      generatedImageUrl = result.url;
      requestId = result.requestId;
    } catch (error) {
      console.error("生成图片失败:", error);
      return respErr(
        error instanceof Error
          ? `生成失败: ${error.message}`
          : "生成失败,请稍后重试"
      );
    }

    // 7. 扣除积分 (只有成功生成后才扣费)
    try {
      await decreaseCredits({
        user_uuid,
        trans_type: CreditsTransType.ImageGen,
        credits: requiredCredits,
      });
    } catch (error) {
      console.error("扣除积分失败:", error);
      // 注意: 此时图片已生成,但积分扣除失败
      // 生产环境应添加补偿逻辑或告警
    }

    // 8. 获取最新积分并返回结果
    const updatedCredits = await getUserCredits(user_uuid);

    const response: GenerateImageResponse = {
      imageUrl: generatedImageUrl,
      remainingCredits: updatedCredits.left_credits,
      requestId,
    };

    return respData(response);

  } catch (error) {
    console.error("API 处理异常:", error);
    return respErr("服务器错误,请稍后重试");
  }
}
