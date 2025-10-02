"use client";

import React, { useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Camera,
  Upload,
  Play,
  Square,
  RotateCcw,
  Zap,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
} from "lucide-react";
import { toast } from "sonner";

// ========================
// API TYPES (HF Space)
// ========================
interface HFSpaceResponse {
  percent: number;
  total_pixels: number;
  corrosion_pixels: number;
  isolated_image?: string; // Base64 da imagem segmentada (opcional)
  corrosion_image?: string; // data URL OU base64 da imagem de corrosão (overlay/heatmap)
}

interface AnalysisUI {
  percent: number;
  totalPixels: number;
  corrosionPixels: number;
  isolatedImage?: string; // data URL pronto para <img>
  corrosionImage?: string; // data URL pronto para <img>
  status: "approved" | "inspection" | "rejected";
}

// Regra simples de status baseada no % de corrosão
function deriveStatus(percent: number): AnalysisUI["status"] {
  if (percent < 5) return "approved";
  if (percent < 15) return "inspection";
  return "rejected";
}

// Lê URL da Space do env ou usa rota local de fallback (útil para contornar CORS com um proxy)
const SPACE_URL = process.env.NEXT_PUBLIC_HF_SPACE_URL || "/api/proxy/analyze";

export default function CapturaPage() {
  const [activeTab, setActiveTab] = useState("camera");
  const [isRecording, setIsRecording] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisUI | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // ========================
  // MUTATION -> Envia FormData (image)
  // ========================
  const analyzeImageMutation = useMutation({
    mutationFn: async (file: File): Promise<AnalysisUI> => {
      const form = new FormData();
      form.append("file", file); // o backend espera o campo "file" (FastAPI indicou loc=["body","file"]) 

      const res = await fetch(SPACE_URL, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(
          `Falha ao analisar imagem (${res.status})` + (txt ? `: ${txt}` : "")
        );
      }

      const data: HFSpaceResponse = await res.json();

      const isolatedImageDataUrl = data.isolated_image
        ? (data.isolated_image.startsWith("data:")
            ? data.isolated_image
            : `data:image/png;base64,${data.isolated_image}`)
        : undefined;

      const corrosionImageDataUrl = data.corrosion_image
        ? (data.corrosion_image.startsWith("data:")
            ? data.corrosion_image
            : `data:image/png;base64,${data.corrosion_image}`)
        : undefined;

      return {
        percent: data.percent,
        totalPixels: data.total_pixels,
        corrosionPixels: data.corrosion_pixels,
        isolatedImage: isolatedImageDataUrl,
        status: deriveStatus(data.percent),
        corrosionImage: corrosionImageDataUrl,
      };
    },
    onSuccess: (result) => {
      setAnalysis(result);
      toast.success(`Análise concluída! Corrosão: ${result.percent.toFixed(1)}%`);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro na análise da imagem");
    },
  });

  // ========================
  // CÂMERA
  // ========================
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsRecording(true);
      }
    } catch (error) {
      toast.error("Erro ao acessar a câmera");
      console.error("Camera error:", error);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsRecording(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(imageDataUrl);
        stopCamera();
      }
    }
  }, [stopCamera]);

  // ========================
  // UPLOAD
  // ========================
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".bmp", ".tiff"],
    },
    maxFiles: 1,
  });

  // ========================
  // ANÁLISE
  // ========================
  const handleAnalyze = async () => {
    let file: File | null = null;

    if (uploadedFile) {
      file = uploadedFile;
    } else if (capturedImage) {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      file = new File([blob], `capture_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
    }

    if (!file) {
      toast.error("Nenhuma imagem disponível para análise");
      return;
    }

    setAnalysis(null);
    analyzeImageMutation.mutate(file);
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setUploadedFile(null);
    setAnalysis(null);
  };

  const getStatusIcon = (status: AnalysisUI["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "inspection":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: AnalysisUI["status"]) => {
    switch (status) {
      case "approved":
        return "Aprovado";
      case "inspection":
        return "Inspeção";
      case "rejected":
        return "Rejeitado";
      default:
        return status;
    }
  };

  const downloadIsolated = () => {
    if (!analysis?.isolatedImage) return;
    const a = document.createElement("a");
    a.href = analysis.isolatedImage;
    a.download = `isolated_${Date.now()}.png`;
    a.click();
  };

  const downloadCorrosion = () => {
    if (!analysis?.corrosionImage) return;
    const a = document.createElement("a");
    a.href = analysis.corrosionImage;
    a.download = `corrosion_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Captura e Análise"
        description="Capture imagens ou faça upload para análise de corrosão"
      >
        <Button variant="outline" onClick={resetCapture} disabled={!capturedImage}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Limpar
        </Button>
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Painel de Captura */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Captura de Imagem</CardTitle>
              <CardDescription>
                Use a câmera ou faça upload de uma imagem para análise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="camera" className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Câmera
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload
                  </TabsTrigger>
                </TabsList>

                {/* Captura com câmera */}
                <TabsContent value="camera" className="space-y-4">
                  {!capturedImage && (
                    <div className="space-y-4">
                      {!isRecording ? (
                        <Button onClick={startCamera}>
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button onClick={capturePhoto}>
                            <Camera className="h-4 w-4 mr-2" />
                            Capturar
                          </Button>
                          <Button variant="outline" onClick={stopCamera}>
                            <Square className="h-4 w-4 mr-2" />
                            Parar
                          </Button>
                        </div>
                      )}

                      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <canvas ref={canvasRef} style={{ display: "none" }} />
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Upload de imagem */}
                <TabsContent value="upload" className="space-y-4">
                  {!capturedImage && (
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Arraste uma imagem aqui</h3>
                      <p className="text-sm text-muted-foreground">ou clique para selecionar</p>
                      <p className="text-xs text-muted-foreground mt-2">Formatos: JPG, PNG, BMP, TIFF</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Preview + Analisar */}
              {capturedImage && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Imagem Capturada</h3>
                    <Button onClick={handleAnalyze} disabled={analyzeImageMutation.isPending} size="sm">
                      {analyzeImageMutation.isPending ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      Analisar
                    </Button>
                  </div>

                  <div className="relative border rounded-lg overflow-hidden">
                    <img ref={imageRef} src={capturedImage} alt="Captured" className="w-full h-auto max-h-96 object-contain" />
                  </div>
                </div>
              )}

              {/* Progress */}
              {analyzeImageMutation.isPending && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm">Analisando imagem...</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  <p className="text-xs text-muted-foreground">Processando no servidor (Hugging Face Space)</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resultados */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Resultado da Análise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge
                      variant={
                        analysis.status === "approved"
                          ? "default"
                          : analysis.status === "inspection"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {getStatusIcon(analysis.status)}
                      <span className="ml-2">{getStatusText(analysis.status)}</span>
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Corrosão:</span>
                      <span className="text-lg font-bold tabular-nums">{analysis.percent.toFixed(1)}%</span>
                    </div>
                  </div>

                  {analysis.corrosionImage && (
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Imagem de Corrosão</h4>
                        <Button size="sm" variant="outline" onClick={downloadCorrosion}>
                          <Download className="h-4 w-4 mr-2" /> Baixar
                        </Button>
                      </div>
                      <div className="relative border rounded-lg overflow-hidden">
                        <img
                          src={analysis.corrosionImage}
                          alt="Corrosion heatmap/overlay"
                          className="w-full h-auto max-h-80 object-contain bg-black"
                        />
                      </div>
                    </div>
                  )}

                  {analysis.isolatedImage && (
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Imagem Isolada</h4>
                        <Button size="sm" variant="outline" onClick={downloadIsolated}>
                          <Download className="h-4 w-4 mr-2" /> Baixar
                        </Button>
                      </div>
                      <div className="relative border rounded-lg overflow-hidden">
                        <img
                          src={analysis.isolatedImage}
                          alt="Isolated corrosion"
                          className="w-full h-auto max-h-80 object-contain bg-black"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Capture ou faça upload de uma imagem para ver os resultados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
