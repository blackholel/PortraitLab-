# 风格缩略图目录

此目录用于存放 AI 肖像风格的缩略图。

## 需要的文件

MVP 版本需要以下 3 个风格缩略图:

1. `cyberpunk.jpg` - 赛博朋克风格 (200x200px)
2. `anime.jpg` - 日系动漫风格 (200x200px)
3. `hero.jpg` - 超级英雄风格 (200x200px)

## 当前状态

⚠️ **临时方案**: 前端页面使用 emoji 作为占位符
- 🌃 Cyberpunk
- 🎨 Anime
- ⚡ Hero

## 准备真实图片

### 方法 1: 使用 AI 生成
使用 Midjourney/Stable Diffusion 生成对应风格的示例图:
```
Prompt 示例:
- Cyberpunk: "cyberpunk portrait, neon lights, futuristic cityscape"
- Anime: "anime style portrait, manga art, vibrant colors"
- Hero: "superhero poster style, dramatic lighting, epic"
```

### 方法 2: 从公开素材库获取
- Unsplash: https://unsplash.com
- Pexels: https://www.pexels.com
- Pixabay: https://pixabay.com

### 处理要求
- 分辨率: 200x200px (正方形)
- 格式: JPG
- 文件大小: < 50KB
- 优化: 使用 TinyPNG 压缩

## 风格参考图 URL

同时需要更新 `lib/style-presets.ts` 中的 `referenceUrl`:
- 当前使用 Unsplash 占位图
- 建议替换为自己 CDN 上的高质量风格参考图 (1024x1024px)
