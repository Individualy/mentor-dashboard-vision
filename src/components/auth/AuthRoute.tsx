
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  
  useEffect(() => {
    // Check if user is authenticated (has token in localStorage)
    const token = localStorage.getItem("token");
    const isAuthenticated = !!token;

    if (authenticationRequired && !isAuthenticated) {
      // Redirect to login if authentication is required but user is not authenticated
      navigate("/login");
    } else if (!authenticationRequired && isAuthenticated) {
      // Redirect to dashboard if user is already authenticated and tries to access auth pages
      navigate("/dashboard");
    }
  }, [navigate, authenticationRequired]);

  return <>{children}</>;
};

export default AuthRoute;
