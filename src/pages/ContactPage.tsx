import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ContactPage = () => {
  return (
    <div className="min-h-screen therapy-gradient py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="calm-overlay border border-blue-100/20">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-[#2E7D32]">Contactez-nous</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1A1F2C]">Nom</label>
                  <Input 
                    type="text" 
                    placeholder="Jean Dupont" 
                    className="focus:ring-[#4CAF50]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1A1F2C]">Email</label>
                  <Input 
                    type="email" 
                    placeholder="votre@email.com" 
                    className="focus:ring-[#4CAF50]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1A1F2C]">Message</label>
                <Textarea 
                  placeholder="Votre message..." 
                  className="min-h-[150px] focus:ring-[#4CAF50]" 
                />
              </div>
              <Button className="w-full bg-[#4CAF50] hover:bg-[#2E7D32]">
                Envoyer le message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactPage;
