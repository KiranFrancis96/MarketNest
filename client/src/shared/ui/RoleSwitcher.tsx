import { useNavigate } from "react-router-dom";

interface Props {
  activeRole: "user" | "merchant";
}

export const RoleSwitcher = ({ activeRole }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="role-switcher">
      <button
        className={`role-option ${activeRole === "user" ? "active" : ""}`}
        onClick={() => {
          if (activeRole === "merchant") {
            // Check current path or state to decide where to go back
            // Since we're using query params now, we can check those
            const params = new URLSearchParams(window.location.search);
            const step = params.get("step");
            if (step === "register") {
              navigate("/register");
            } else {
              navigate("/login");
            }
          } else {
            // Already user, just ensure we're on the right sub-page (though switch is usually hidden if active)
            navigate(window.location.pathname.includes("register") ? "/register" : "/login");
          }
        }}
      >
        Buyer
      </button>
      <button
        className={`role-option ${activeRole === "merchant" ? "active" : ""}`}
        onClick={() => {
          const isRegister = window.location.pathname.includes("register");
          navigate(`/merchant/auth?step=${isRegister ? "register" : "login"}`);
        }}
      >
        Merchant
      </button>
    </div>
  );
};
