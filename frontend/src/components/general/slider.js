import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";

// Import images explicitly
import IMG1 from "./../../assets/Logos/slider/adobe-44195.svg";
import IMG2 from "./../../assets/Logos/slider/autodesk-4.svg";
import IMG3 from "./../../assets/Logos/slider/cisco-svgrepo-com.svg";
import IMG4 from "./../../assets/Logos/slider/dell-2.svg";
import IMG5 from "./../../assets/Logos/slider/flipkart.svg";
import IMG6 from "./../../assets/Logos/slider/google-g-2015.svg";
import IMG7 from "./../../assets/Logos/slider/ibm.svg";
import IMG8 from "./../../assets/Logos/slider/intel.svg";
import IMG9 from "./../../assets/Logos/slider/linkedin-icon-2.svg";
import IMG10 from "./../../assets/Logos/slider/logo-amazon.svg";
import IMG11 from "./../../assets/Logos/slider/microsoft-6.svg";
import IMG12 from "./../../assets/Logos/slider/myntra-1.svg";
import IMG14 from "./../../assets/Logos/slider/notion-svgrepo-com.svg";
import IMG15 from "./../../assets/Logos/slider/oracle-logo-1.svg";
import IMG16 from "./../../assets/Logos/slider/salesforce-2.svg";
import IMG17 from "./../../assets/Logos/slider/samsung-svgrepo-com.svg";
import IMG18 from "./../../assets/Logos/slider/sap-3.svg";
import IMG19 from "./../../assets/Logos/slider/tiktok-icon-2.svg";
import IMG20 from "./../../assets/Logos/slider/twitter-6.svg";
import IMG21 from "./../../assets/Logos/slider/yahoo-7.svg";
import IMG22 from "./../../assets/Logos/slider/zoom-communications-logo-1.svg";

// Store all images in an array
const logos = [
  IMG1,
  IMG2,
  IMG3,
  IMG4,
  IMG5,
  IMG6,
  IMG7,
  IMG8,
  IMG9,
  IMG10,
  IMG11,
  IMG12,
  IMG14,
  IMG15,
  IMG16,
  IMG17,
  IMG18,
  IMG19,
  IMG20,
  IMG21,
  IMG22,
];

const CompanySlider = () => {
  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-300 mt-8">
        🚀 Kickstart Your Career with Top Tech Giants!
      </h2>
      <p className="text-slate-200 opacity-80 text-center mt-2 mb-6">
        Master DSA, development, and core concepts on AlgoMate, and land
        opportunities in these leading companies.
      </p>

      <div className="w-5/6 py-4 bg-slate-300 bg-opacity-80 mb-10 mt-4 pl-4 pr-4 scale-105">
        {/* Top row - Left to Right */}
        <Swiper
          slidesPerView={window.innerWidth > 768 ? 12 : 4}
          spaceBetween={30}
          loop={true}
          speed={2000}
          autoplay={{ delay: 1, disableOnInteraction: false }}
          modules={[Autoplay]}
          className="mb-6 m-4"
        >
          {logos.map((logo, index) => (
            <SwiperSlide
              key={index}
              className="flex justify-center items-center"
            >
              <img
                src={logo}
                alt="Company Logo"
                className="h-10 w-auto mx-auto"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Bottom row - Right to Left */}
        <div dir="rtl">
          <Swiper
            slidesPerView={window.innerWidth > 768 ? 12 : 4}
            spaceBetween={30}
            loop={true}
            speed={2000}
            autoplay={{ delay: 1, disableOnInteraction: false }}
            modules={[Autoplay]}
            className="m-4"
          >
            {logos.map((logo, index) => (
              <SwiperSlide
                key={index}
                className="flex justify-center items-center"
              >
                <img
                  src={logo}
                  alt="Company Logo"
                  className="h-10 w-auto mx-auto"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default CompanySlider;
