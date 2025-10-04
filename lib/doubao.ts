/**
 * 豆包火山 Ark API 封装
 * 文档: https://www.volcengine.com/docs/82379/1298454
 */

export interface DoubaoImageGenerateParams {
  /** 用户上传的肖像图片 (Base64 格式: data:image/png;base64,xxx) */
  userImageBase64: string;
  /** 风格参考图 URL */
  styleReferenceUrl: string;
  /** 风格描述 Prompt */
  stylePrompt: string;
  /** 输出尺寸,默认 2K */
  size?: "1K" | "2K";
  /** 是否添加水印,默认 false */
  watermark?: boolean;
}

export interface DoubaoImageGenerateResult {
  /** 生成的图片 URL */
  url: string;
  /** 请求 ID,用于追踪和调试 */
  requestId?: string;
}

export interface DoubaoErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

/**
 * 调用豆包 Seedream 4.0 生成风格化肖像
 */
export async function generateImageWithDoubao(
  params: DoubaoImageGenerateParams
): Promise<DoubaoImageGenerateResult> {
  const {
    userImageBase64,
    styleReferenceUrl,
    stylePrompt,
    size = "2K",
    watermark = false,
  } = params;

  // 验证环境变量
  const apiKey = process.env.ARK_API_KEY;
  if (!apiKey) {
    throw new Error("ARK_API_KEY 未配置,请在 .env.local 中添加");
  }

  // 验证 Base64 格式
  if (!userImageBase64.startsWith("data:image/")) {
    throw new Error("userImageBase64 必须是完整的 Data URL 格式");
  }

  const baseUrl = process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";
  const endpoint = `${baseUrl}/images/generations`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "doubao-seedream-4-0-250828",
        prompt: stylePrompt,
        // 豆包支持传入多张图片: [用户图, 风格参考图]
        image: [userImageBase64, styleReferenceUrl],
        size: size,
        response_format: "url", // 直接返回 URL,无需 Base64
        watermark: watermark,
      }),
    });

    if (!response.ok) {
      const errorData: DoubaoErrorResponse = await response.json();
      throw new Error(
        `豆包 API 调用失败 [${response.status}]: ${errorData.error?.message || response.statusText}`
      );
    }

    const result = await response.json();

    // 豆包返回格式: { data: [{ url: "https://..." }] }
    if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
      throw new Error("豆包 API 返回数据格式异常");
    }

    return {
      url: result.data[0].url,
      requestId: result.request_id,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`生成图片失败: ${error.message}`);
    }
    throw new Error("生成图片失败: 未知错误");
  }
}

/**
 * 健康检查: 验证 API Key 是否有效
 */
export async function checkDoubaoHealth(): Promise<boolean> {
  try {
    const apiKey = process.env.ARK_API_KEY;
    if (!apiKey) return false;

    const baseUrl = process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";
    const response = await fetch(`${baseUrl}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    return response.ok;
  } catch {
    return false;
  }
}
