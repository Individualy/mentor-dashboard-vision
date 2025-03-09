
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

type AuthRouteProps = {
  children: ReactNode;
  authenticationRequired?: boolean;
};

/**
 * AuthRoute component handles authentication-based routing logic:
 * - If authenticationRequired=true: redirects to login if not authenticated
 * - If authenticationRequired=false: redirects to dashboard if already authenticated
 */
const AuthRoute = ({ children, authenticationRequired = false }: AuthRouteProps) => {
  const navigate = useNavigate();
  const { user, loading } = useUser();
  
  useEffect(() => {
    if (loading) return; // Wait until user data is loaded

    const isAuthenticated = !!user;

    if (authenticationRequired && !isAuthenticated) {
      // Redirect to login if authentication is required but user is not authenticated
      navigate("/login");
    } else if (!authenticationRequired && isAuthenticated) {
      // Redirect to dashboard if user is already authenticated and tries to access auth pages
      navigate("/dashboard");
    }
  }, [navigate, authenticationRequired, user, loading]);

  if (loading) {
    // Simple loading indicator while checking authentication status
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthRoute;
