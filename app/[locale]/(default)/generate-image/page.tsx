"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Loader2, Download, Sparkles } from "lucide-react";
import { getAllStyles, type StylePreset } from "@/lib/style-presets";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useAppContext } from "@/contexts/app";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export default function GenerateImagePage() {
  const { getUserCredits } = useAppContext();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const styles = getAllStyles();

  // 处理文件上传
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      toast.error("文件大小不能超过 2MB");
      return;
    }

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      toast.error("请上传图片文件");
      return;
    }

    setSelectedFile(file);
    setGeneratedImageUrl(""); // 清空之前的生成结果

    // 转换为 Base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImageBase64(base64);
      setPreviewUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  // 模拟进度条 (分阶段展示)
  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 5;
      });
    }, 1000);
    return interval;
  };

  // 生成图片
  const handleGenerate = async () => {
    if (!imageBase64) {
      toast.error("请先上传图片");
      return;
    }

    if (!selectedStyle) {
      toast.error("请选择一种风格");
      return;
    }

    setIsGenerating(true);
    const progressInterval = simulateProgress();

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64,
          styleId: selectedStyle,
        }),
      });

      const result = await response.json();

      if (result.code !== 0) {
        throw new Error(result.message || "生成失败");
      }

      // 成功
      clearInterval(progressInterval);
      setProgress(100);
      setGeneratedImageUrl(result.data.imageUrl);

      // 更新用户积分
      await getUserCredits();

      toast.success("生成成功!");
    } catch (error) {
      clearInterval(progressInterval);
      console.error("生成失败:", error);
      toast.error(
        error instanceof Error ? error.message : "生成失败,请稍后重试"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // 下载图片
  const handleDownload = () => {
    if (!generatedImageUrl) return;

    const link = document.createElement("a");
    link.href = generatedImageUrl;
    link.download = `ai-portrait-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("开始下载");
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* 页面标题 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          <Sparkles className="inline-block mr-2 text-primary" />
          AI 肖像画廊
        </h1>
        <p className="text-muted-foreground text-lg">
          上传你的照片,选择风格,让 AI 为你创作专属艺术肖像
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 左侧: 图片上传与预览 */}
        <div>
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              {/* 图片画布 */}
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                {previewUrl || generatedImageUrl ? (
                  <Image
                    src={generatedImageUrl || previewUrl}
                    alt="Preview"
                    width={600}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-muted-foreground p-8">
                    <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">上传你的肖像照片</p>
                    <p className="text-sm">
                      支持 JPG、PNG 格式,文件不超过 2MB
                    </p>
                  </div>
                )}
              </div>

              {/* 上传按钮 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full mb-4"
                disabled={isGenerating}
              >
                <Upload className="mr-2 h-4 w-4" />
                {selectedFile ? "重新选择图片" : "上传图片"}
              </Button>

              {/* 上传引导 */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>💡 建议上传清晰的正脸照片,光线充足效果更佳</p>
                <p>📐 推荐分辨率 512x512 以上</p>
              </div>

              {/* 生成/下载按钮 */}
              {generatedImageUrl ? (
                <Button
                  onClick={handleDownload}
                  className="w-full mt-4"
                  size="lg"
                >
                  <Download className="mr-2 h-4 w-4" />
                  下载图片
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* 右侧: 风格选择与生成 */}
        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">选择你的风格</h3>

              {/* 风格选择器 */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {styles.map((style: StylePreset) => (
                  <Card
                    key={style.id}
                    className={cn(
                      "cursor-pointer transition-all hover:scale-105",
                      selectedStyle === style.id &&
                        "ring-2 ring-primary shadow-lg"
                    )}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      {/* TODO: 替换为实际的风格缩略图 */}
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {style.id === "cyberpunk" && "🌃"}
                        {style.id === "anime" && "🎨"}
                        {style.id === "hero" && "⚡"}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <p className="font-medium text-sm text-center">
                        {style.nameZh}
                      </p>
                      <p className="text-xs text-muted-foreground text-center">
                        {style.name}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 风格描述 */}
              {selectedStyle && (
                <div className="bg-muted p-4 rounded-lg mb-6">
                  <p className="text-sm text-muted-foreground">
                    {
                      styles.find((s) => s.id === selectedStyle)
                        ?.description
                    }
                  </p>
                </div>
              )}

              {/* 生成按钮 */}
              <Button
                onClick={handleGenerate}
                disabled={!imageBase64 || !selectedStyle || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    生成中... {progress}%
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    开始生成 (消耗 10 积分)
                  </>
                )}
              </Button>

              {/* 加载提示 */}
              {isGenerating && (
                <div className="mt-4 space-y-2">
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    {progress < 30 && "正在上传图片..."}
                    {progress >= 30 && progress < 60 && "AI 处理中..."}
                    {progress >= 60 && progress < 90 && "生成中,预计还需 15 秒"}
                    {progress >= 90 && "正在保存..."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
