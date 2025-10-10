
import { useMutation } from "@tanstack/react-query";
import { DoctorCreate, DoctorResponse } from "@/types/doctor";
import { toast } from "sonner";

export function useRegisterDoctor() {
  return useMutation({
    mutationFn: async (doctorData: DoctorCreate): Promise<DoctorResponse> => {
      const response = await fetch("http://localhost:8000/api/register/doctor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(doctorData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Une erreur est survenue lors de l'inscription");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Toast vert pour le succès
      toast.success(data.message || "Inscription réussie ! Vous pouvez maintenant vous connecter.", {
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
