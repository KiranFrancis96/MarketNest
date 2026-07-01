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
            const params = new URLSearchParams(window.location.search);
            const step = params.get("step");
            if (step === "register") {
              navigate("/register");
            } else {
              navigate("/login");
            }
          } else {
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
