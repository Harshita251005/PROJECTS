import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        
        {/* 🧁 Left Section - About */}
        <div className="footer-content-left">
          <img src={assets.logo} alt="Harshita Food Hub Logo" />
          <p>
            Welcome to <strong>Harshita Food Hub</strong> — your one-stop destination for delicious food delivered fast! 
            We’re passionate about great taste, quick service, and spreading smiles with every meal. 🍔🍕
          </p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="Facebook" />
            <img src={assets.twitter_icon} alt="Twitter" />
            <img src={assets.linkedin_icon} alt="LinkedIn" />
          </div>
        </div>

        {/* 🏢 Center Section - Links */}
        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li>Home</li>
            <li>About Us</li>
            <li>Menu</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        {/* 📞 Right Section - Contact */}
        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>📞 +91 9876543210</li>
            <li>📧 harshitafoodhub@gmail.com</li>
          </ul>
        </div>
      </div>

      <hr />
      <p className="footer-copyright">
        © 2024 <strong>Harshita Food Hub</strong>. Built with ❤️ by Harshita Goyal.
      </p>
    </div>
  )
}

export default Footer
