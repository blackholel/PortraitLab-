/**
 * 风格预设配置
 * MVP 版本提供 3 个精选风格
 */

export interface StylePreset {
  /** 风格唯一标识 */
  id: string;
  /** 英文名称 */
  name: string;
  /** 中文名称 */
  nameZh: string;
  /** 风格描述 Prompt (传给 AI) */
  prompt: string;
  /** 风格参考图 URL (传给 AI) */
  referenceUrl: string;
  /** 缩略图路径 (前端选择器展示) */
  thumbnail: string;
  /** 风格简介 */
  description?: string;
  /** 英文简介 */
  descriptionEn?: string;
}

/**
 * MVP 风格预设列表
 *
 * ⚠️ 重要: referenceUrl 需要替换为实际的风格参考图 URL
 * 临时方案: 使用公开的高质量风格图片作为参考
 */
export const STYLE_PRESETS: Record<string, StylePreset> = {
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk",
    nameZh: "赛博朋克",
    prompt: "cyberpunk style portrait, neon lights, futuristic cityscape background, digital art, vibrant cyan and magenta colors, sci-fi aesthetic, high contrast, dramatic lighting",
    // TODO: 替换为实际的风格参考图 URL
    referenceUrl: "https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=1024",
    thumbnail: "/styles/cyberpunk.jpg",
    description: "未来主义霓虹风格,赛博朋克美学",
    descriptionEn: "Futuristic neon style with cyberpunk aesthetics",
  },
  anime: {
    id: "anime",
    name: "Anime",
    nameZh: "日系动漫",
    prompt: "anime style portrait, manga art, cel shading, vibrant colors, clean lines, Japanese animation style, expressive eyes, soft lighting, colorful background",
    // TODO: 替换为实际的风格参考图 URL
    referenceUrl: "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=1024",
    thumbnail: "/styles/anime.jpg",
    description: "二次元动漫风格,清新可爱",
    descriptionEn: "Japanese anime style with vibrant colors",
  },
  hero: {
    id: "hero",
    name: "Hero Poster",
    nameZh: "超级英雄",
    prompt: "superhero poster style portrait, dramatic lighting, epic composition, Marvel/DC aesthetic, powerful stance, cinematic atmosphere, dynamic pose, intense colors",
    // TODO: 替换为实际的风格参考图 URL
    referenceUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=1024",
    thumbnail: "/styles/hero.jpg",
    description: "漫威风海报,英雄气质",
    descriptionEn: "Marvel-style heroic poster with epic composition",
  },
};

/**
 * 获取所有风格列表
 */
export function getAllStyles(): StylePreset[] {
  return Object.values(STYLE_PRESETS);
}

/**
 * 根据 ID 获取风格
 */
export function getStyleById(id: string): StylePreset | undefined {
  return STYLE_PRESETS[id];
}

/**
 * 验证风格 ID 是否有效
 */
export function isValidStyleId(id: string): boolean {
  return id in STYLE_PRESETS;
}
