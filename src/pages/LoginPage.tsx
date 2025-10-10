
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { useLoginDoctor } from "@/hooks/useLoginDoctor";
import { DoctorLogin } from "@/types/doctor";
import { AlertNotification } from "@/components/ui/alert-notification";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { mutate: loginDoctor, isPending } = useLoginDoctor();

  const form = useForm<DoctorLogin>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: DoctorLogin) => {
    loginDoctor(data, {
      onSuccess: () => {
        navigate("/profile");
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center therapy-gradient">
      <div className="absolute top-6 left-6">
        <Link to="/" className="text-2xl font-bold text-white hover:text-white/80 transition-colors">
          MindInsight
        </Link>
      </div>
      
      <Card className="w-[400px] calm-overlay border border-blue-100/20">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-[#2E7D32]">Connexion</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertNotification
            variant="info"
            title="Pas encore inscrit ?"
            description="Vous pouvez vous inscrire en cliquant sur le lien ci-dessous."
            className="bg-blue-100/70"
          />
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="votre@email.com" />
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

              <Button 
                type="submit" 
                className="w-full bg-[#4CAF50] hover:bg-[#2E7D32]"
                disabled={isPending}
              >
                {isPending ? "Connexion..." : "Se connecter"}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Pas encore de compte ?{" "}
                <Link to="/register" className="text-[#4CAF50] hover:underline">
                  S'inscrire
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
