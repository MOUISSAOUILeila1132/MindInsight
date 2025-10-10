
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProfileLayout from "@/components/ProfileLayout";
import { FileText } from "lucide-react";
import { toast } from "sonner";

interface Patient {
  id: string;
  patient_name: string;
  twitter_username: string;
  created_at: string;
  data?: any;
}

const RapportsPage = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      // First try to get from backend if user is logged in
      const doctorToken = localStorage.getItem("doctorToken");
      if (doctorToken) {
        try {
          console.log("Récupération des patients pour les rapports depuis MongoDB...");
          const response = await fetch('http://127.0.0.1:8000/api/patients/', {
            headers: {
              'Authorization': `Bearer ${doctorToken}`
            }
          });
          
          if (response.ok) {
            const backendPatients = await response.json();
            console.log("Patients récupérés de MongoDB pour rapports:", backendPatients);
            
            // Merge with local storage data to get the full analysis data
            const storedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
            
            const mergedPatients = backendPatients.map((backendPatient: any) => {
              // Try to find matching patient in localStorage
              const localPatient = storedPatients.find((p: any) => 
                p.patient_name === backendPatient.patient_name || 
                p.twitter_username === backendPatient.twitter_username
              );
              
              return {
                ...backendPatient,
                data: localPatient?.data || null
              };
            });
            
            setPatients(mergedPatients);
            setIsLoading(false);
            return;
          } else {
            console.error("Erreur lors de la récupération des patients depuis MongoDB pour rapports:", response.status);
          }
        } catch (err) {
          console.error("Erreur MongoDB pour rapports:", err);
          // Continue to use localStorage if backend fails
        }
      }
      
      // Fallback to localStorage
      console.log("Utilisation des données locales pour les rapports");
      const storedPatients = localStorage.getItem('patients');
      if (storedPatients) {
        setPatients(JSON.parse(storedPatients));
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des patients pour rapports:", err);
      toast.error("Impossible de charger les données des patients depuis MongoDB.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProfileLayout activePage="rapports">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#2E7D32]">Rapports</h1>

        {/* Liste des rapports */}
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
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
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Rapport de {patient.patient_name}</h3>
                      <p className="text-sm text-gray-500">@{patient.twitter_username}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(patient.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      if (patient.data) {
                        navigate('/results', { 
                          state: { 
                            analysisData: patient.data,
                            patientName: patient.patient_name
                          } 
                        });
                      } else {
                        // Try to find data in localStorage
                        const storedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
                        const localPatient = storedPatients.find((p: any) => 
                          p.patient_name === patient.patient_name || 
                          p.twitter_username === patient.twitter_username
                        );
                        
                        if (localPatient?.data) {
                          navigate('/results', { 
                            state: { 
                              analysisData: localPatient.data,
                              patientName: patient.patient_name
                            } 
                          });
                        } else {
                          toast.error("Données d'analyse non disponibles");
                        }
                      }
                    }}
                    variant="outline" 
                    size="sm"
                  >
                    Voir le rapport
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">Aucun rapport disponible.</p>
          )}
        </div>
      </div>
    </ProfileLayout>
  );
};

export default RapportsPage;
