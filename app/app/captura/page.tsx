'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/ui/page-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Upload, Zap, Image as ImageIcon, CheckCircle, XCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { analysisApi } from '@/lib/api/analysis-api';
import { CorrosionAnalysis } from '@/lib/types/analysis';

// Tipo ROI (mantido para compatibilidade)
interface ROI {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function CapturaPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [analyses, setAnalyses] = useState<CorrosionAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ✅ Mutation para analisar uma única imagem
  const analyzeImageMutation = useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      return analysisApi.analyzeImage(file);
    },
    onSuccess: (result) => {
      setAnalyses((prev) => [...prev, result]);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro na análise da imagem');
    },
  });

  // Upload de imagens (agora múltiplas)
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploadedFiles(acceptedFiles);
    setAnalyses([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.bmp', '.tiff'] },
    maxFiles: 10, // ✅ permite até 10 imagens
    multiple: true,
  });

  // Executar análise para todas as imagens
  const handleAnalyzeAll = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Nenhuma imagem selecionada');
      return;
    }

    setAnalyses([]);
    setIsAnalyzing(true);

    for (const file of uploadedFiles) {
      await analyzeImageMutation.mutateAsync({ file });
    }

    setIsAnalyzing(false);
    toast.success('Análise concluída para todas as imagens!');
  };

  // Resetar tudo
  const resetAll = () => {
    setUploadedFiles([]);
    setAnalyses([]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'inspection':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovado';
      case 'inspection':
        return 'Inspeção';
      case 'rejected':
        return 'Rejeitado';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Análise de Corrosão"
        description="Faça upload de uma ou mais imagens para análise automática"
      >
        <Button variant="outline" onClick={resetAll} disabled={uploadedFiles.length === 0}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Limpar
        </Button>
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Painel de upload */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Upload de Imagens</CardTitle>
              <CardDescription>Selecione múltiplas imagens para análise</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  Arraste as imagens aqui ou clique para selecionar
                </h3>
                <p className="text-sm text-muted-foreground">
                  Formatos: JPG, PNG, BMP, TIFF — até 10 imagens
                </p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Imagens Selecionadas</h3>
                    <Button
                      onClick={handleAnalyzeAll}
                      disabled={isAnalyzing || uploadedFiles.length === 0}
                      size="sm"
                    >
                      {isAnalyzing ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      Analisar Todas
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="border rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-2 text-xs text-center text-muted-foreground truncate">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm">Analisando imagens...</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Painel de resultados */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Resultados da Análise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyses.length > 0 ? (
                analyses.map((result, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 space-y-2 hover:bg-muted/50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Imagem {index + 1}</span>
                      <Badge
                        variant={
                          result.status === 'approved'
                            ? 'default'
                            : result.status === 'inspection'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {getStatusIcon(result.status)}
                        <span className="ml-2">{getStatusText(result.status)}</span>
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Corrosão:</span>
                      <span className="font-semibold">
                        {result.corrosionPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Confiança:</span>
                      <span>{(result.confidenceScore * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Envie imagens para ver os resultados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
