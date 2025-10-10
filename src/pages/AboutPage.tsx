
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1546521343-4eb2c01aa44b?auto=format&fit=crop&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
            À propos de <span className="text-[#4CAF50]">MindInsight</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg">
            <h2 className="text-2xl text-[#4CAF50] font-bold mb-4">Notre Mission</h2>
            <p className="text-white text-lg mb-6">
              MindInsight a été créé pour aider les professionnels de la santé mentale à mieux comprendre 
              l'état émotionnel de leurs patients entre les consultations. Notre plateforme utilise l'analyse 
              avancée des données sociales pour offrir des insights précieux et objectifs.
            </p>
            <p className="text-white text-lg">
              Nous croyons qu'en fournissant des outils d'analyse puissants mais faciles à utiliser, nous pouvons 
              contribuer à améliorer la qualité des soins en santé mentale et aider à une détection précoce 
              des changements d'humeur significatifs.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg">
            <h2 className="text-2xl text-[#4CAF50] font-bold mb-4">Comment ça fonctionne</h2>
            <p className="text-white text-lg mb-6">
              En analysant les publications Twitter des patients (avec leur consentement), notre algorithme d'intelligence 
              artificielle peut détecter des indicateurs subtils d'humeur, de stress, d'anxiété et d'autres 
              états émotionnels, basés sur les mots utilisés, le ton et la fréquence des publications.
            </p>
            <p className="text-white text-lg">
              MindInsight présente ensuite ces données sous forme de graphiques clairs et de rapports détaillés, 
              permettant aux professionnels de la santé mentale de suivre l'évolution de l'état émotionnel 
              de leurs patients au fil du temps.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg">
            <h2 className="text-2xl text-[#4CAF50] font-bold mb-4">Avantages pour les professionnels</h2>
            <ul className="text-white text-lg list-disc list-inside space-y-3">
              <li>Suivi continu entre les consultations</li>
              <li>Détection précoce des changements d'humeur significatifs</li>
              <li>Visualisation claire des tendances à long terme</li>
              <li>Rapports détaillés pour une approche plus personnalisée</li>
              <li>Gestion optimisée du temps avec des analyses automatisées</li>
              <li>Interface intuitive ne nécessitant aucune expertise technique</li>
            </ul>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg">
            <h2 className="text-2xl text-[#4CAF50] font-bold mb-4">Confidentialité et éthique</h2>
            <p className="text-white text-lg mb-6">
              Nous prenons la confidentialité des données très au sérieux. MindInsight ne collecte que les données 
              auxquelles le patient a explicitement consenti, et toutes les informations sont chiffrées et stockées 
              de manière sécurisée conformément aux réglementations RGPD et HIPAA.
            </p>
            <p className="text-white text-lg">
              Notre approche est conçue pour être un outil complémentaire et non un substitut à la consultation 
              clinique traditionnelle, respectant ainsi l'importance de la relation thérapeute-patient.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link to="/register">
            <Button 
              className="bg-[#4CAF50] hover:bg-[#2E7D32] text-lg px-8 py-6 mx-4 mb-4"
            >
              Créer un compte
            </Button>
          </Link>
          <Link to="/">
            <Button 
              variant="outline" 
              className="text-lg px-8 py-6 mx-4 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 mb-4"
            >
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
