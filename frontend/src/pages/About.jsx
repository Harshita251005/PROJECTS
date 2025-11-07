import { assets } from "../assets/assets_frontend/assets";

const About = () => {
  return (
    <div>
      <div className="text-center text-2xl pt-10 text-gray-500">
        <p>
          ABOUT <span className="text-gray-700 font-medium">US</span>
        </p>
      </div>

      <div className="my-10 flex flex-col md:flex-row gap-12">
        <img
          className="w-full md:max-w-[360px]"
          src={assets.about_image}
          alt=""
        />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600 capitalize">
          <p>
            Welcome to MediBook. MediBook is designed to simplify healthcare
            management by providing a seamless and efficient platform for
            patients. We understand the challenges of scheduling appointments,
            tracking medical records, and staying on top of personal health, and
            our mission is to make this process as smooth as possible.
          </p>
          <p>
            At MediBook, we are dedicated to delivering a reliable and
            user-friendly experience. We continuously enhance our platform with
            the latest technological advancements to ensure that managing your
            healthcare is convenient, secure, and efficient. Whether you are
            booking your first appointment or managing ongoing care, MediBook
            supports you every step of the way.
          </p>
          <b className="text-gray-800">Our Vision</b>
          <p>
            Our vision is to create a seamless healthcare experience for every
            user. MediBook aims to bridge the gap between patients and
            healthcare providers, making access to quality care simple, timely,
            and hassle-free.
          </p>
        </div>
      </div>

      <div className="text-xl my-4">
        <p className="uppercase">
          Why <span className="text-gray-700 font-semibold">Choose Us</span>
        </p>
      </div>
      <div className="flex flex-col md:flex-row mb-20">
        <div className="border border-gray-300 px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer">
          <b>Efficiency:</b>
          <p>
            Streamlined appointment scheduling that fits into your busy
            lifestyle.
          </p>
        </div>
        <div className="border border-gray-300 px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer">
          <b>Convenience:</b>
          <p>
            Access to a network of trusted healthcare professionals in your
            area.
          </p>
        </div>
        <div className="border border-gray-300 px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer">
          <b>Personalization:</b>
          <p>
            Tailored recommendations and reminders to help you stay on top of
            your health.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
