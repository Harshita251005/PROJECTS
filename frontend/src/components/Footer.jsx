import { assets } from "../assets/assets_frontend/assets";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";
const Footer = () => {
  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        {/* ---------- Section 01 ---------- */}
        <div>
          <img className="mb-5 w-40" src={assets.logo} alt="" />
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
             Welcome to <span className="font-semibold">Harshita</span>, where we
            turn ideas into reality. Our mission is to deliver exceptional 
            digital experiences with creativity and precision.
          </p>
        </div>

        {/* ---------- Section 02 ---------- */}
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>Home</li>
            <li>About us</li>
            <li>Contact us</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        {/* ---------- Section 03 ---------- */}
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>📞 +1 (555) 123-4567</li>
           <li>✉️ info@harshita.com</li>
            <li>🌐 <a href="https://harshita.com" className="hover:text-primary">www.harshita.com</a></li>
          </ul>
        </div>
      </div>
      {/* ---------- Copyright Section ---------- */}
      <div>
        <div className="flex justify-center gap-5 mb-5 text-gray-600">
  <a
    href="https://facebook.com"
    target="_blank"
    rel="noreferrer"
    className="hover:text-blue-600 transition-colors text-lg"
  >
    <FaFacebookF />
  </a>
  <a
    href="https://twitter.com"
    target="_blank"
    rel="noreferrer"
    className="hover:text-blue-400 transition-colors text-lg"
  >
    <FaTwitter />
  </a>
  <a
    href="https://linkedin.com"
    target="_blank"
    rel="noreferrer"
    className="hover:text-blue-700 transition-colors text-lg"
  >
    <FaLinkedinIn />
  </a>
</div>
        <hr />
        <p className="py-5 text-sm text-center ">
          Copyright © {new Date().getFullYear()}{" "}
          <a className="hover:text-primary font-bold" href="https://mahmudalam.com/">Harshita</a>.
        </p>
      </div>
    </div>
  );
};

export default Footer;
