import { useDispatch, useSelector } from "react-redux";
import { userApi } from "@/entities/user/api/userApi";
import { logout } from "@/entities/user/model/userSlice";
import { useNavigate } from "react-router-dom";

export const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.user.user);

  const handleLogout = async () => {
    await userApi.logout(); 
    dispatch(logout());
    navigate("/login");
  };

  const mockProducts = [
    {
      id: 1,
      title: "Custom Engraved Wood Watch",
      merchant: "by ArtisanTimbers",
      price: "$120.00",
      image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Personalized Leather Wallet",
      merchant: "by LeatherCraft",
      price: "$45.00",
      image: "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "Hand-Stamped Silver Necklace",
      merchant: "by SilverLinings",
      price: "$65.00",
      image: "https://images.unsplash.com/photo-1599643478524-fb66f70d00cf?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 4,
      title: "Monogrammed Canvas Tote",
      merchant: "by Stitch & Co.",
      price: "$35.00",
      image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=600&auto=format&fit=crop",
    }
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 16V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12"></path>
            <path d="M8 21h8"></path>
            <path d="M12 17v4"></path>
            <path d="M4 16h16"></path>
            <path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
          </svg>
          MarketNest
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Sign Out
        </button>
      </header>

      <main>
        <section className="dashboard-welcome">
          <h1>Discover Unique, Personalized Products</h1>
          <p>Support independent merchants and find something made just for you, {user?.email?.split('@')[0] || "Guest"}.</p>
        </section>

        <section className="product-grid">
          {mockProducts.map((product, index) => (
            <div className="product-card" key={product.id} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="product-image">
                <img src={product.image} alt={product.title} />
              </div>
              <div className="product-info">
                <h3 className="product-title">{product.title}</h3>
                <p className="product-merchant">{product.merchant}</p>
                <div className="product-price">{product.price}</div>
                <button className="btn-customize">Customize & Buy</button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};