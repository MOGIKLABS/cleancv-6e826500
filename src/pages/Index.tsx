import { useNavigate } from "react-router-dom";
import { FileText, Zap, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
{
  icon: Zap,
  title: "Instant Builder",
  description:
  "Build your professional CV in minutes with our intuitive editor and live preview."
},
{
  icon: Sparkles,
  title: "Modern Templates",
  description:
  "Stand out with clean, ATS-friendly designs loved by top tech companies."
},
{
  icon: Shield,
  title: "Privacy First",
  description:
  "Your data stays in your browser. No account required, no tracking."
}];


// Extracted into its own component so the map stays readable
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  index





}: {icon: React.ElementType;title: string;description: string;index: number;}) =>
<div
  className="group border border-border bg-card p-10 transition-all hover:border-foreground/20 animate-fade-up"
  style={{ animationDelay: `${index * 0.1}s` }}>

    <div className="mb-5 inline-flex h-10 w-10 items-center justify-center border border-border text-foreground/60 transition-colors group-hover:bg-foreground group-hover:text-background">
      <Icon className="h-4 w-4" />
    </div>
    <h3 className="font-display text-2xl font-light text-card-foreground tracking-wide">
      {title}
    </h3>
    <p className="mt-3 text-muted-foreground leading-relaxed text-sm">
      {description}
    </p>
  </div>;


const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-foreground" />
            <span className="font-display text-xl font-light tracking-[0.08em] text-foreground">
              CleanCV
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/builder")}
            size="sm"
            className="uppercase tracking-[0.15em] text-xs font-sans">

            Build Your CV
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden hero-gradient pt-16">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,hsl(0_0%_30%),transparent_70%)]" />
        <div className="relative container flex flex-col items-center justify-center py-20 sm:py-32 text-center lg:py-44 px-4">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.35em] text-hero-foreground/50 mb-6 sm:mb-8 animate-fade-in font-sans">FREE · NO SIGN-UP 
· NOTHING STORED. NOTHING SHARED.
          </p>
          <h1 className="max-w-3xl font-display text-3xl sm:text-5xl lg:text-7xl font-light tracking-wide text-hero-foreground animate-fade-up leading-[1.1]">CleanCV

          </h1>
          <p
            className="mt-6 sm:mt-8 max-w-lg text-sm sm:text-base text-hero-foreground/60 animate-fade-up font-light leading-relaxed px-4"
            style={{ animationDelay: "0.1s" }}>

            Real-time preview, modern templates, zero friction.
          </p>
          <div
            className="mt-8 sm:mt-12 flex gap-4 animate-fade-up"
            style={{ animationDelay: "0.2s" }}>

            <Button
              size="lg"
              onClick={() => navigate("/builder")}
              className="text-xs sm:text-sm uppercase tracking-[0.2em] px-6 sm:px-10 h-11 sm:h-12 font-sans">

              Start Building
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-16 sm:py-28 px-4">
        <div className="text-center mb-12 sm:mb-20">
          <h2 className="font-display text-3xl sm:text-4xl font-light tracking-wide text-foreground">
            CleanCV
          </h2>
          <p className="mt-4 text-muted-foreground text-sm uppercase tracking-[0.25em] font-sans">
            Everything you need, nothing you don't.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((f, i) =>
          <FeatureCard
            key={f.title}
            icon={f.icon}
            title={f.title}
            description={f.description}
            index={i} />

          )}
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient">
        <div className="container py-24 text-center">
          {/* FIX: heading was empty — added a proper tagline */}
          <h2 className="font-display text-4xl font-light tracking-wide text-hero-foreground">
            Your next role starts here.
          </h2>
          <p className="mt-4 text-hero-foreground/50 text-sm uppercase tracking-[0.25em] font-sans">
            CLEAN CV BUILDING. POWERED BY MOGIK LABS
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/builder")}
            className="mt-10 h-12 px-10 text-sm uppercase tracking-[0.2em] font-sans">

            Create Your CV Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container py-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground uppercase tracking-[0.15em] font-sans px-4">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            {/* FIX: removed conflicting normal-case override; kept consistent casing */}
            <span className="font-display text-sm tracking-[0.08em] text-foreground">
              CLEANCV
            </span>
          </div>
          <span>© 2026 MOGIK LABS</span>
        </div>
      </footer>
    </div>);

};

export default Index;