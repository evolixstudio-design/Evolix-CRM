import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicHomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="mx-auto flex max-w-7xl items-center justify-between p-6">
        <div className="flex items-center space-x-3">
          <img src="/logo.jpg" alt="EVOLIX" className="h-10 w-10 object-contain rounded-xl shadow-lg" />
          <span className="text-xl font-extrabold tracking-tight">EVOLIX</span>
        </div>
        <nav className="flex items-center space-x-6">
          <Link href="#services" className="text-sm font-medium text-slate-300 hover:text-white">
            Services
          </Link>
          <Link href="#about" className="text-sm font-medium text-slate-300 hover:text-white">
            About
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm" className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white">
              Evolix OS Login
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 py-24 text-center">
        <div className="inline-flex items-center rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-400 ring-1 ring-inset ring-teal-500/20 mb-6">
          Digital Agency & Software Solutions
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-slate-100">
          Transforming Visions into <span className="text-teal-400">Digital Reality</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          Evolix provides premium website development, software engineering, branding, 3D animation, and digital marketing services to empower modern brands.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-4">
          <Button variant="primary" size="lg">
            Get in Touch
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700">
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {/* Services List */}
        <div id="services" className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
          {[
            { title: "Website & Software", desc: "Custom web applications and high-performance software engineering." },
            { title: "Branding & Identity", desc: "Distinctive logo design, brand systems, and visual guidelines." },
            { title: "Digital Marketing & SEO", desc: "Data-driven marketing campaigns, SEO, and social media growth." },
            { title: "3D Animation & Design", desc: "Immersive 3D animation, UI/UX design, and visual media." },
            { title: "Product Photography", desc: "Studio-quality product media and e-commerce listing assets." },
            { title: "AI Automation", desc: "Tailored workflow automation and modern AI integration." },
          ].map((service, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-800/50 p-6 backdrop-blur">
              <h3 className="text-lg font-bold text-slate-100">{service.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{service.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Evolix. All rights reserved. | Public Website
      </footer>
    </div>
  );
}
