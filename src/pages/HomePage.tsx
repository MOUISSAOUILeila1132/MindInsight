
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1606819717115-9159c900370b?auto=format&fit=crop&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
            Analysez l'état psychologique <br />
            <span className="text-[#4CAF50]">de vos patients</span>
          </h1>
          <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto leading-relaxed">
            MindInsight aide les professionnels de santé mentale à analyser l'état émotionnel
            de leurs patients à travers leurs activités sur les réseaux sociaux.
          </p>

          <div className="flex gap-6 justify-center flex-wrap">
            <Link to="/register">
              <Button 
                className="bg-[#4CAF50] hover:bg-[#2E7D32] text-lg px-8 py-6 transition-all duration-300 hover:scale-105 mb-4 sm:mb-0"
              >
                Commencer maintenant
              </Button>
            </Link>
            <Link to="/about">
              <Button 
                variant="outline" 
                className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                En savoir plus
              </Button>
            </Link>
          </div>
          
          <div className="mt-16 bg-black/30 backdrop-blur-sm rounded-lg p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">À propos de MindInsight</h2>
            <p className="text-gray-200 text-lg">
              MindInsight est une application innovante conçue pour les professionnels de la santé mentale. 
              Elle utilise des algorithmes avancés d'analyse de sentiment pour interpréter les publications 
              Twitter de vos patients, fournissant ainsi un aperçu de leur état émotionnel au fil du temps.
            </p>
            <p className="text-gray-200 text-lg mt-4">
              Notre plateforme aide les thérapeutes, psychiatres et psychologues à obtenir 
              des informations complémentaires pour mieux comprendre l'évolution de l'état 
              psychologique de leurs patients entre les consultations, permettant ainsi une 
              approche plus personnalisée et proactive des soins de santé mentale.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
