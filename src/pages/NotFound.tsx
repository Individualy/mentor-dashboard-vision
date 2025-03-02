
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100 p-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
        <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
          <h1 className="text-8xl font-bold mb-2 animate-[pulse_3s_ease-in-out_infinite]">404</h1>
          <p className="text-xl opacity-90">Page not found</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            <p className="text-gray-600 animate-[fadeIn_0.8s_ease-out]">
              We couldn't find the page you're looking for. The page might have been removed, 
              renamed, or is temporarily unavailable.
            </p>
            
            <div className="h-1 w-full bg-gradient-to-r from-primary/20 via-secondary/60 to-primary/20 rounded animate-[pulse_3s_ease-in-out_infinite]"></div>
            
            <div className="animate-[fadeIn_1s_ease-out]">
              <p className="text-sm text-gray-500 mb-4">
                Attempted path: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{location.pathname}</span>
              </p>
              
              <Link 
                to="/" 
                className="group flex items-center justify-center gap-2 bg-primary text-white py-3 px-6 rounded-lg shadow-md hover:bg-primary/90 transition-all duration-300 hover:shadow-lg"
              >
                <Home className="w-5 h-5 group-hover:animate-[pulse_1s_ease-in-out]" />
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
