import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { backendUrl, setToken, token } = useContext(AppContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState("Login"); // "Login" or "Sign Up"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "Sign Up") {
        const { data } = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password,
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success("Account created successfully!");
        } else {
          toast.error(data.message || "Failed to create account");
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password,
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success("Logged in successfully!");
        } else {
          toast.error(data.message || "Failed to log in");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  useEffect(() => {
    if (token) navigate("/");
  }, [token]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-8 min-w-[340px] sm:min-w-96 border rounded-xl shadow-lg text-zinc-700"
      >
        <h2 className="text-2xl font-semibold text-center">
          {mode === "Sign Up" ? "Create Account" : "Login"}
        </h2>
        {mode === "Sign Up" && (
          <div className="flex flex-col">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded mt-1"
              required
            />
          </div>
        )}
        <div className="flex flex-col">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded mt-1"
            required
          />
        </div>
        <div className="flex flex-col">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded mt-1"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-white py-2 rounded-md mt-2"
        >
          {mode === "Sign Up" ? "Create Account" : "Login"}
        </button>
        <p className="text-center text-sm mt-2">
          {mode === "Sign Up"
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <span
            onClick={() => setMode(mode === "Sign Up" ? "Login" : "Sign Up")}
            className="text-primary underline cursor-pointer"
          >
            {mode === "Sign Up" ? "Login here" : "Sign-up here"}
          </span>
        </p>
      </form>

      <p className="mt-10 text-zinc-600 text-center w-full">
        Are you a Doctor or Admin?{" "}
        <a
          href="https://localhost:5174"
          className="text-primary underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Login here
        </a>
      </p>
    </div>
  );
};

export default Login;
