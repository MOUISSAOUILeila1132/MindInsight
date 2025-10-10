
import { AlertTriangle, Check, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface AlertNotificationProps {
  title?: string
  description?: string
  variant?: "info" | "warning" | "success"
  className?: string
}

export function AlertNotification({
  title,
  description,
  variant = "info",
  className,
}: AlertNotificationProps) {
  return (
    <Alert 
      className={cn(
        "mb-4 transition-all",
        variant === "info" && "border-blue-400 bg-blue-50 text-blue-800",
        variant === "warning" && "border-amber-400 bg-amber-50 text-amber-800",
        variant === "success" && "border-green-400 bg-green-50 text-green-800",
        className
      )}
    >
      <div className="flex items-center">
        {variant === "info" && <Info className="h-4 w-4 mr-2" />}
        {variant === "warning" && <AlertTriangle className="h-4 w-4 mr-2" />}
        {variant === "success" && <Check className="h-4 w-4 mr-2 text-green-600" />}
        <div>
          {title && <AlertTitle className={cn(variant === "success" && "text-green-700")}>{title}</AlertTitle>}
          {description && <AlertDescription className={cn(variant === "success" && "text-green-700")}>{description}</AlertDescription>}
        </div>
      </div>
    </Alert>
  )
}
