import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "@/app/store";

/**
 * GuestRoute — redirects any authenticated party away from auth pages.
 * Checks both user and merchant auth so the back button never lands
 * a logged-in user OR merchant on a login/register page.
 */
export const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const isUserAuthenticated     = useSelector((state: RootState) => state.user.isAuthenticated);
  const isMerchantAuthenticated = useSelector((state: RootState) => state.merchant.isAuthenticated);

  if (isUserAuthenticated)     return <Navigate to="/"                    replace />;
  if (isMerchantAuthenticated) return <Navigate to="/merchant/dashboard"  replace />;

  return <>{children}</>;
};
