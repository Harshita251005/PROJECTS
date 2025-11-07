import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token"); // read inside useEffect
    if (!token || token === "undefined" || token === "null") {
      navigate("/login"); // redirect if not logged in
    }
  }, [navigate]);

  return <div>Protected Content</div>;
};

export default ProtectedPage;
