
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { useRegisterDoctor } from "@/hooks/useRegisterDoctor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DoctorCreate } from "@/types/doctor";
import { AlertNotification } from "@/components/ui/alert-notification";

const registerSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().optional(),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  specialite: z.string().min(2, "La spécialité est requise"),
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const { mutate: registerDoctor, isPending } = useRegisterDoctor();

  const form = useForm<DoctorCreate>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      password: "",
      specialite: "",
    },
  });

  const onSubmit = (data: DoctorCreate) => {
    registerDoctor(data, {
      onSuccess: () => {
        navigate("/login");
      },
    });
  };

  // Liste des spécialités communes
  const specialties = [
    "Psychiatre",
    "Psychologue",
    "Neurologue",
    "Thérapeute",
    "Médecin généraliste",
    "Pédopsychiatre",
    "Psychothérapeute",
    "Autre"
  ];

  return (
    <div className="min-h-screen flex items-center justify-center therapy-gradient">
      <div className="absolute top-6 left-6">
        <Link to="/" className="text-2xl font-bold text-white hover:text-white/80 transition-colors">
          MindInsight
        </Link>
      </div>
      
      <Card className="w-[500px] calm-overlay border border-blue-100/20">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-[#2E7D32]">Créer un compte</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertNotification
            variant="success"
            title="Rejoignez-nous !"
            description="Créez votre compte pour accéder à toutes les fonctionnalités de l'application."
            className="bg-green-100/70"
          />
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="nom"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Dupont" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="prenom"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Prénom (optionnel)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Marie" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="docteur@exemple.fr" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="••••••••" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="specialite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spécialité</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre spécialité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-[#4CAF50] hover:bg-[#2E7D32]"
                disabled={isPending}
              >
                {isPending ? "Inscription en cours..." : "S'inscrire"}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Vous avez déjà un compte ?{" "}
                <Link to="/login" className="text-[#4CAF50] hover:underline">
                  Se connecter
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
