import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-12 md:py-20 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <h1 className="hero-heading">
                  Benvenuto su <span className="text-gradient">Nashi Hub</span>
                </h1>
                <p className="hero-subheading">
                  Scopri profili Discord casuali con la nostra Egirl Roulette o cerca utenti specifici tramite ID.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/dashboard">
                    <Button className="btn-gradient" size="lg">
                      Vai alla Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="lg:order-last rounded-lg overflow-hidden">
                <div className="w-full aspect-video bg-gray-800/40 rounded-lg flex items-center justify-center p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold text-gradient">Demo GIF</h3>
                    <p className="text-muted-foreground">
                      Qui verrà mostrata una GIF che dimostra il funzionamento della Egirl Roulette
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gradient">Funzionalità</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-lg p-6 card-gradient">
                <h3 className="text-xl font-semibold mb-2">Egirl Roulette</h3>
                <p className="text-muted-foreground">
                  Scopri profili Discord casuali con un semplice click. Visualizza foto profilo, nomi utente, date di creazione e altro.
                </p>
              </div>
              <div className="rounded-lg p-6 card-gradient">
                <h3 className="text-xl font-semibold mb-2">Ricerca Discord ID</h3>
                <p className="text-muted-foreground">
                  Cerca informazioni dettagliate su un utente specifico inserendo il suo ID Discord.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-6">
        <div className="container px-4 md:px-6">
          <div className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Nashi Hub. Tutti i diritti riservati.
          </div>
        </div>
      </footer>
    </div>
  );
}