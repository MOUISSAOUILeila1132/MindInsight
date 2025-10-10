import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home } from "lucide-react";
import ProfileLayout from "@/components/ProfileLayout";
import { Input } from "@/components/ui/input";

interface Patient {
  id: string;
  patient_name: string;
  twitter_username: string;
  created_at: string;
}

// Données d'exemple pour le graphique
const demoData = [
  { name: "Jan", patients: 4 },
  { name: "Fév", patients: 6 },
  { name: "Mar", patients: 8 },
  { name: "Avr", patients: 12 },
  { name: "Mai", patients: 15 },
  { name: "Juin", patients: 18 },
  { name: "Juil", patients: 22 },
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profileUrlOrUsername, setProfileUrlOrUsername] = useState("");
  const [patientName, setPatientName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setIsLoadingPatients(true);
    try {
      const doctorToken = localStorage.getItem("doctorToken");
      if (!doctorToken) {
        const storedPatients = localStorage.getItem('patients');
        if (storedPatients) {
          setPatients(JSON.parse(storedPatients));
        }
        setIsLoadingPatients(false);
        return;
      }

      const response = await fetch('http://127.0.0.1:8000/api/patients/', {
        headers: {
          'Authorization': `Bearer ${doctorToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Patients récupérés du MongoDB:", data);
      setPatients(data);
    } catch (err: any) {
      console.error("Erreur lors de la récupération des patients:", err);
      const storedPatients = localStorage.getItem('patients');
      if (storedPatients) {
        setPatients(JSON.parse(storedPatients));
      }
      toast.error("Impossible de charger les patients depuis MongoDB. Affichage des données locales.");
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const handleAnalyze = async () => {
    setError(null);

    if (!profileUrlOrUsername.trim()) {
      toast.error("Veuillez entrer un nom d'utilisateur ou une URL de profil Twitter valide");
      return;
    }

    if (!patientName.trim()) {
      toast.error("Veuillez entrer un nom pour le patient");
      return;
    }

    let targetUsername = profileUrlOrUsername.trim();
    try {
      if (targetUsername.includes("twitter.com/") || targetUsername.includes("x.com/")) {
        const url = new URL(targetUsername.startsWith('http') ? targetUsername : `https://${targetUsername}`);
        if (url.hostname !== 'twitter.com' && url.hostname !== 'x.com' && 
            url.hostname !== 'www.twitter.com' && url.hostname !== 'www.x.com') {
          throw new Error("Le lien ne semble pas provenir de twitter.com ou x.com.");
        }
        const pathParts = url.pathname.split('/').filter(part => part && !part.includes('.'));
        if (pathParts.length > 0) {
          targetUsername = pathParts[0];
        } else {
          throw new Error("Impossible d'extraire le nom d'utilisateur du lien.");
        }
      }
      
      targetUsername = targetUsername.replace(/^@/, '');
      if (!/^[a-zA-Z0-9_]{1,15}$/.test(targetUsername)) {
        throw new Error(`Format de nom d'utilisateur Twitter invalide (${targetUsername}).`);
      }
    } catch (err: any) {
      toast.error(err.message || "URL ou nom d'utilisateur invalide.");
      setError(err.message || "URL ou nom d'utilisateur invalide.");
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = 'http://127.0.0.1:8000/analyze';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: targetUsername, max_tweets: 10 }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `Erreur HTTP: ${response.status}` }));
        const errorMessage = errorData?.detail || `Erreur serveur (${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Données reçues:", data);
      
      await saveAnalysisData(patientName, data);
      
      toast.success(`Analyse pour @${data.username} réussie !`);
      navigate('/results', { state: { analysisData: data, patientName: patientName } });

    } catch (err: any) {
      console.error("Erreur lors de l'appel API:", err);
      const message = err.message.includes("Failed to fetch")
        ? "Impossible de contacter le serveur d'analyse. Est-il démarré et accessible ?"
        : (err.message || "Une erreur inconnue est survenue.");
      toast.error(message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnalysisData = async (patientName: string, analysisData: any) => {
    try {
      const newPatient = {
        id: Date.now().toString(),
        patient_name: patientName,
        twitter_username: analysisData.username,
        created_at: new Date().toISOString(),
        data: analysisData
      };
      
      const existingPatients = JSON.parse(localStorage.getItem('patients') || '[]');
      const updatedPatients = [...existingPatients, newPatient];
      localStorage.setItem('patients', JSON.stringify(updatedPatients));
      
      const doctorToken = localStorage.getItem("doctorToken");
      if (doctorToken) {
        console.log("Sauvegarde de l'analyse dans MongoDB...");
        const saveResponse = await fetch('http://127.0.0.1:8000/api/patients/save_analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${doctorToken}`
          },
          body: JSON.stringify({
            patient_name: patientName,
            analysis_data: analysisData
          }),
        });
        
        if (!saveResponse.ok) {
          const errorData = await saveResponse.json().catch(() => null);
          console.error("Erreur lors de la sauvegarde MongoDB:", errorData);
          throw new Error(`Erreur lors de la sauvegarde sur MongoDB: ${saveResponse.status}`);
        }
        
        const saveResult = await saveResponse.json();
        console.log("Analyse sauvegardée dans MongoDB:", saveResult);
        toast.success("Analyse sauvegardée dans la base de données MongoDB");
        
        fetchPatients();
      }
    } catch (err: any) {
      console.error("Erreur lors de la sauvegarde de l'analyse:", err);
      toast.error("L'analyse a été sauvegardée localement mais pas dans MongoDB.");
    }
  };

  return (
    <ProfileLayout activePage="patients">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#2E7D32]">Mes patients</h1>
          <Button 
            onClick={() => navigate('/')} 
            size="sm" 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Accueil
          </Button>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-[#2E7D32]">
              Analyser un profil Twitter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du patient
                </label>
                <Input
                  id="patientName"
                  type="text"
                  placeholder="Nom du patient à analyser"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="twitterProfile" className="block text-sm font-medium text-gray-700 mb-1">
                    Profil Twitter
                  </label>
                  <input
                    id="twitterProfile"
                    type="text"
                    placeholder="Entrez le lien du profil ou @nomdutilisateur"
                    value={profileUrlOrUsername}
                    onChange={(e) => setProfileUrlOrUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent disabled:opacity-50"
                    disabled={isLoading}
                  />
                </div>
                <div className="md:self-end">
                  <Button
                    onClick={handleAnalyze}
                    className="bg-[#4CAF50] hover:bg-[#2E7D32] text-white font-semibold text-lg px-6 py-3 flex items-center justify-center min-w-[150px] w-full md:w-auto"
                    disabled={isLoading || !patientName.trim() || !profileUrlOrUsername.trim()}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyse...
                      </>
                    ) : (
                      <>
                        Analyser <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {error && (
                <p className="text-red-600 mt-3 text-sm font-medium">{error}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Mes patients</h2>
          
          {isLoadingPatients ? (
            <div className="flex justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-[#4CAF50]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : patients.length > 0 ? (
            patients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{patient.patient_name}</h3>
                    <p className="text-sm text-gray-500">@{patient.twitter_username || "N/A"}</p>
                    <p className="text-xs text-gray-400">{new Date(patient.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button 
                    onClick={() => {
                      const storedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
                      const patientData = storedPatients.find((p: any) => 
                        p.patient_name === patient.patient_name || 
                        p.twitter_username === patient.twitter_username
                      );
                      
                      if (patientData?.data) {
                        navigate('/results', { 
                          state: { 
                            analysisData: patientData.data,
                            patientName: patient.patient_name
                          } 
                        });
                      } else {
                        toast.error("Données d'analyse non disponibles localement");
                      }
                    }}
                    variant="outline" 
                    size="sm"
                  >
                    Voir l'analyse
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">Aucun patient analysé pour le moment.</p>
          )}
        </div>
      </div>
    </ProfileLayout>
  );
};

export default ProfilePage;
