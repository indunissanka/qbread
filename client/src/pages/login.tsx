import { Button } from "@/components/ui/button";
import { SiLine } from "react-icons/si";

export default function Login() {
  return (
    <div className="container mx-auto p-4 min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-8">Welcome to Sweet Delights</h1>
        <div className="space-y-4">
          <p className="text-center text-muted-foreground mb-6">
            Sign in to track your orders and manage your delivery preferences
          </p>
          <Button
            className="w-full bg-[#00B900] hover:bg-[#00A000] text-white"
            onClick={() => window.location.href = '/api/auth/line'}
          >
            <SiLine className="mr-2 h-5 w-5" />
            Continue with LINE
          </Button>
        </div>
      </div>
    </div>
  );
}
