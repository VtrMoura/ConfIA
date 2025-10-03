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
    isolated_image?: string;   // Base64 ou data URL
    corrosion_image?: string;  // Base64 ou data URL
}

interface AnalysisUI {
    percent: number;
    totalPixels: number;
    corrosionPixels: number;
    isolatedImage?: string;    // data URL pronto para <img>
    corrosionImage?: string;   // data URL pronto para <img>
    status: "approved" | "inspection" | "rejected";
}

// Regra simples de status baseada no % de corrosão
function deriveStatus(percent: number): AnalysisUI["status"] {
    if (percent < 5) return "approved";
    if (percent < 15) return "inspection";
    return "rejected";
}

// Lê URL da Space do env ou usa rota local de fallback
const SPACE_URL = process.env.NEXT_PUBLIC_HF_SPACE_URL || "/api/proxy/analyze";

export default function CapturaClient() {
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
            form.append("file", file); // backend espera "file"

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
                video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
            });
            if (videoRef.current) {
                (videoRef.current as HTMLVideoElement).srcObject = stream;
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
            (videoRef.current as HTMLVideoElement).srcObject = null;
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
            reader.onload = (e) => setCapturedImage(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [".jpg", ".jpeg", ".png", ".bmp", ".tiff"] },
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
            file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
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
        </div>
    );
}
