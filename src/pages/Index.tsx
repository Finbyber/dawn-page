import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-800 text-white">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold tracking-tight">
          HSE Management System
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Comprehensive Health, Safety & Environment management platform. Report incidents, conduct inspections, and maintain safety standards.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/login">
            <Button size="lg" className="text-lg px-8 py-3">
              Access Portal
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-gray-900">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
