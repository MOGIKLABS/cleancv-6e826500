import { useNavigate } from "react-router-dom";
import { FileText, Sparkles, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  {
    icon: Zap,
    title: "Instant Builder",
    description: "Build your professional CV in minutes with our intuitive editor and live preview.",
  },
  {
    icon: Sparkles,
    title: "Modern Templates",
    description: "Stand out with clean, ATS-friendly designs loved by top tech companies.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data stays in your browser. No account required, no tracking.",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">ResumeForge</span>
          </div>
          <Button onClick={() => navigate("/builder")} size="sm">
            Build Your CV
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden hero-gradient pt-16">
        <div
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="relative container flex flex-col items-center justify-center py-32 text-center lg:py-44">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            Free & No Sign-up Required
          </div>
          <h1 className="max-w-3xl font-display text-4xl font-bold tracking-tight text-hero-foreground sm:text-5xl lg:text-6xl animate-fade-up">
            Build a CV That Gets You{" "}
            <span className="text-gradient">Hired</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-hero-foreground/70 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Create a stunning, professional resume in minutes. Real-time preview, modern templates, zero friction.
          </p>
          <div className="mt-10 flex gap-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <Button size="lg" onClick={() => navigate("/builder")} className="text-base px-8 h-12">
              Start Building — It's Free
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl font-bold text-foreground">Why ResumeForge?</h2>
          <p className="mt-3 text-muted-foreground text-lg">Everything you need, nothing you don't.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group rounded-xl border border-border bg-card p-8 transition-all hover:border-primary/40 hover:shadow-lg"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold text-card-foreground">{f.title}</h3>
              <p className="mt-2 text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient">
        <div className="container py-20 text-center">
          <h2 className="font-display text-3xl font-bold text-hero-foreground">
            Ready to land your dream job?
          </h2>
          <p className="mt-3 text-hero-foreground/70 text-lg">Join thousands of professionals who trust ResumeForge.</p>
          <Button size="lg" onClick={() => navigate("/builder")} className="mt-8 h-12 px-8 text-base">
            Create Your CV Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container py-8 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="font-display font-semibold text-foreground">ResumeForge</span>
          </div>
          <span>© 2026 ResumeForge. Built for professionals.</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
