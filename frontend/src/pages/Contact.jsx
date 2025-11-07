import { assets } from "../assets/assets_frontend/assets";

const Contact = () => {
  return (
    <section className="py-16 px-6 md:px-20 bg-gray-50">
      {/* ---------- Section Title ---------- */}
      <div className="text-center text-3xl font-bold text-gray-800 mb-12 uppercase">
        Contact <span className="text-primary">Us</span>
      </div>

      {/* ---------- Main Content ---------- */}
      <div className="flex flex-col md:flex-row gap-12 justify-center items-start">
        {/* Image / Illustration */}
        <img
          className="w-full md:max-w-[400px] rounded-lg shadow-md"
          src={assets.contact_image}
          alt="Contact Illustration"
        />

        {/* Contact Details */}
        <div className="flex flex-col justify-center gap-6 max-w-md">
          <p className="font-semibold text-lg text-gray-700 uppercase">Our Office</p>
          <p className="text-gray-600">
            123 Greenway Street, Suite 402<br />
            New York, NY 10001, USA
          </p>
          <p className="text-gray-600">Email: contact@medibook.com</p>
          <p className="text-gray-600">Phone: +1 (555) 123-4567</p>

          <p className="font-semibold text-lg text-gray-700 uppercase mt-6">Careers at MediBook</p>
          <p className="text-gray-600">
            Interested in joining our team? Explore current job openings and learn more about working with us.
          </p>

          <button className="border border-primary text-primary px-8 py-3 text-sm rounded hover:bg-primary hover:text-white transition-all duration-500">
            Explore Jobs
          </button>
        </div>
      </div>
    </section>
  );
};

export default Contact;
