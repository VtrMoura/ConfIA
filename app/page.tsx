import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Gauge, 
  Shield, 
  Zap, 
  CheckCircle, 
  Users, 
  BarChart3,
  ArrowRight,
  Star,
  Quote,
} from 'lucide-react';
import { appConfig } from '../app.config';
import { FallbackImage } from '@/components/fallback-image';

const features = [
  {
    icon: Camera,
    title: 'Captura Inteligente',
    description: 'Análise em tempo real através de câmera ou upload de imagens com detecção automática de ROI.',
  },
  {
    icon: Gauge,
    title: 'Precisão Industrial',
    description: 'Algoritmos de IA treinados especificamente para detectar corrosão em peças metálicas.',
  },
  {
    icon: Shield,
    title: 'Segurança Total',
    description: 'Dados processados localmente com criptografia e auditoria completa de todas as operações.',
  },
  {
    icon: Zap,
    title: 'Velocidade',
    description: 'Análise instantânea que acelera o processo de inspeção sem comprometer a qualidade.',
  },
];

const benefits = [
  'Redução de 90% no tempo de inspeção',
  'Eliminação de falsos positivos',
  'Rastreabilidade completa do processo',
  'Integração com sistemas existentes',
];

const testimonials = [
  {
    name: 'João Silva',
    role: 'Gerente de Qualidade',
    company: 'CISER',
    content: 'O CorroScan revolucionou nosso processo de inspeção. Conseguimos detectar problemas que passariam despercebidos na inspeção visual.',
    rating: 5,
  },
  {
    name: 'Maria Santos',
    role: 'Supervisora de Produção',
    company: 'CISER',
    content: 'A velocidade e precisão do sistema nos permitiram aumentar significativamente nossa capacidade de produção.',
    rating: 5,
  },
];

const faqItems = [
  {
    question: 'Como funciona a detecção de corrosão?',
    answer: 'O sistema utiliza algoritmos de visão computacional e inteligência artificial para analisar imagens e identificar pixels corroídos, calculando automaticamente a porcentagem de corrosão da peça.',
  },
  {
    question: 'Quais tipos de peças podem ser analisadas?',
    answer: 'O sistema está otimizado para parafusos, porcas, arruelas e outras peças metálicas utilizadas na indústria, com configurações específicas para cada tipo.',
  },
  {
    question: 'Os dados ficam seguros?',
    answer: 'Sim, todos os dados são processados localmente e armazenados com criptografia. Mantemos um log completo de auditoria para rastreabilidade.',
  },
  {
    question: 'É possível integrar com nossos sistemas?',
    answer: 'O CorroScan oferece APIs REST para integração com sistemas ERP, MES e outras soluções industriais existentes.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <FallbackImage 
              src="/brand/ciser-logo.png" 
              alt="CISER" 
              className="h-10 w-auto"
              fallbackText="CISER"
              fallbackClassName="text-2xl font-bold text-primary"
            />
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-primary">ConfIA</h1>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Funcionalidades
            </a>
            <a href="#benefits" className="text-sm font-medium hover:text-primary transition-colors">
              Benefícios
            </a>
            <a href="#cases" className="text-sm font-medium hover:text-primary transition-colors">
              Casos de Uso
            </a>
            <a href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center space-x-2">
            <Button asChild variant="ghost">
              <Link href="/auth/sign-in">Entrar</Link>
            </Button>
          </div>
        </div>
      </header>   

      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Inovação em Inspeção Industrial
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Detecção de corrosão em{' '}
              <span className="text-primary">tempo real</span>{' '}
              por IA
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Sistema inteligente para inspeção de qualidade de parafusos e porcas 
              utilizando visão computacional e inteligência artificial.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/sign-in">
                  Começar agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demo">Ver demonstração</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Como funciona o ConfIA
            </h2>
            <p className="text-lg text-muted-foreground">
              Processo simples e eficiente em 3 etapas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Benefícios para sua produção
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Melhore a qualidade, reduza custos e acelere seus processos 
                com nossa solução de detecção de corrosão.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Taxa de Precisão</span>
                    <span className="text-2xl font-bold text-green-600">98.7%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tempo de Análise</span>
                    <span className="text-2xl font-bold text-blue-600">2.3s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Peças Analisadas/Dia</span>
                    <span className="text-2xl font-bold text-primary">15,000+</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section id="cases" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Casos de sucesso na CISER
            </h2>
            <p className="text-lg text-muted-foreground">
              Veja como o CorroScan está transformando nossa produção 
              em Jaraguá do Sul
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="pt-0">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <blockquote className="text-foreground mb-6">
                    <Quote className="h-8 w-8 text-muted-foreground mb-2" />
                    "{testimonial.content}"
                  </blockquote>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} • {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-lg text-muted-foreground">
              Tire suas dúvidas sobre o sistema CorroScan
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqItems.map((item, index) => (
              <Card key={index} className="p-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{item.question}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Implemente o CorroScan em sua linha de produção hoje mesmo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/sign-in">Acessar sistema</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Falar com especialista</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <FallbackImage 
                  src="/brand/ciser-logo.png" 
                  alt="CISER" 
                  className="h-8 w-auto"
                  fallbackText="CISER"
                  fallbackClassName="text-lg font-bold text-primary"
                />
                <span className="text-lg font-bold">CorroScan</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Sistema de detecção de corrosão por inteligência artificial 
                para a indústria de parafusos e porcas.
              </p>
              <p className="text-sm text-muted-foreground">
                {appConfig.company} — {appConfig.tagline}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Sistema</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/auth/sign-in" className="hover:text-foreground">Login</Link></li>
                <li><Link href="/demo" className="hover:text-foreground">Demo</Link></li>
                <li><Link href="/docs" className="hover:text-foreground">Documentação</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">Sobre</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contato</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">Privacidade</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {appConfig.company}. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}