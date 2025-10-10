
import { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider
} from "@/components/ui/sidebar";
import { User, FileText, FileSearch, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileLayoutProps {
  children: ReactNode;
  activePage: "patients" | "analyses" | "rapports";
}

const ProfileLayout = ({ children, activePage }: ProfileLayoutProps) => {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState<string | null>(null);

  useEffect(() => {
    const storedName = localStorage.getItem("doctorName");
    const doctorId = localStorage.getItem("doctorId");
    
    if (!doctorId) {
      navigate("/login");
    }
    
    if (storedName) {
      setDoctorName(storedName);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("doctorId");
    localStorage.removeItem("doctorName");
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-gray-100 p-4">
            <h2 className="text-xl font-semibold text-[#4CAF50]">MindInsight</h2>
            <p className="text-sm text-gray-500">Dr. {doctorName}</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={activePage === "patients"} 
                  onClick={() => navigate("/profile")}
                >
                  <User size={20} />
                  <span>Mes patients</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={activePage === "analyses"} 
                  onClick={() => navigate("/analyses")}
                >
                  <FileSearch size={20} />
                  <span>Analyses en cours</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={activePage === "rapports"} 
                  onClick={() => navigate("/rapports")}
                >
                  <FileText size={20} />
                  <span>Rapports</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <div className="mt-auto p-4 border-t border-gray-100">
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
            </Button>
          </div>
        </Sidebar>
        <div className="flex-1 p-6 bg-gray-50">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ProfileLayout;
