
import { useMutation } from "@tanstack/react-query";
import { DoctorLogin, LoginSuccessResponse } from "@/types/doctor";
import { toast } from "sonner";

export function useLoginDoctor() {
  return useMutation({
    mutationFn: async (loginData: DoctorLogin): Promise<LoginSuccessResponse> => {
      const response = await fetch("http://localhost:8000/api/login/doctor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Une erreur est survenue lors de la connexion");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Stocker l'ID du docteur dans le localStorage pour la persistance
      localStorage.setItem("doctorId", data.doctorId);
      localStorage.setItem("doctorName", data.nom);
      localStorage.setItem("doctorToken", data.access_token);
      
      // Toast vert pour le succès
      toast.success("Connexion réussie", {
        style: { 
          backgroundColor: "#F2FCE2", 
          color: "#2E7D32",
          border: "1px solid #4CAF50"
        },
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
