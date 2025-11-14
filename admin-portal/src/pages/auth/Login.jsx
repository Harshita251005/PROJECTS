import { useState } from "react";
import { assets } from "../../assets/assets";
import { useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import axios from "axios";
import { toast } from "react-toastify";
import { DoctorContext } from "../../context/DoctorContext";

const Login = () => {
  const [state, setState] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      if (state === "Admin") {
        const { data } = await axios.post(backendUrl + "/api/admin/login", {
          email,
          password,
        });

        if (data.success) {
          localStorage.setItem("aToken", data.token);
          setAToken(data.token);
          toast.success("Admin logged in successfully");
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/doctor/login", {
          email,
          password,
        });

        if (data.success) {
          localStorage.setItem("dToken", data.token);
          setDToken(data.token);
          toast.success("Doctor logged in successfully");
        }
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Invalid credentials");
    }
  };

  const handleCredentialsInfo = () => {
    if (state === "Admin") {
      toast.info("Admin Credentials:\nEmail: admin123@mail.com\nPassword: admin1234");
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border border-gray-100 rounded-xl text-[#5E5E5E] text-sm shadow-lg">
        <p className="text-2xl font-semibold m-auto">
          <span className="text-primary">{state}</span> Login
        </p>
        <div className="w-full">
          <p>Email</p>
          <input
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            required
          />
        </div>
        <div className="w-full">
          <p>Password</p>
          <input
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            required
          />
        </div>
        <button className="bg-primary text-white w-full py-2 rounded-md text-base cursor-pointer">
          Login
        </button>
        {state === "Admin" && (
          <div className="w-full text-xs bg-blue-50 border border-blue-200 p-2 rounded text-blue-800">
            <p className="font-semibold mb-1">Demo Admin Credentials:</p>
            <p>📧 Email: <code>admin123@mail.com</code></p>
            <p>🔐 Password: <code>admin1234</code></p>
          </div>
        )}
        {state === "Admin" ? (
          <p className="text-xs text-gray-500 mt-2">
            Are you a Doctor?{" "}
            <span
              className="text-primary underline cursor-pointer"
              onClick={() => setState("Doctor")}
            >
              Click here
            </span>
          </p>
        ) : (
          <p className="text-xs text-gray-500 mt-2">
            Are you an Admin?{" "}
            <span
              className="text-primary underline cursor-pointer"
              onClick={() => setState("Admin")}
            >
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
