import React from "react";
import { motion } from "framer-motion";
import {
  Facebook,
  Twitter,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from "@mui/icons-material";
import Footer from "../../components/general/footer";
import Squares from '../../animations/squares'
const ContactUs = () => {
  return (
    <div>

      <Squares></Squares>
      <div className="min-h-screen flex items-center justify-center p-6 pt-20 bg-gradient-to-b from-gray-900 to-black_A ">
        <motion.div
          className="w-full max-w-5xl bg-white bg-opacity-10 backdrop-blur-md p-10 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center gap-12 border border-gray-600"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Left Side - Contact Info */}
          <div className="flex-1 text-white space-y-6 text-center md:text-left">
            <h1 className="text-4xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-600">
              Contact Us
            </h1>
            <p className="text-gray-300 text-lg">
              Have questions? We’d love to hear from you! Drop us a message and
              we’ll get back as soon as possible.
            </p>
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-gray-300">
                <Phone className="text-blue-400" /> +123 456 7890
              </p>
              <p className="flex items-center gap-2 text-gray-300">
                <Email className="text-red-400" /> support@example.com
              </p>
              <p className="flex items-center gap-2 text-gray-300">
                <LocationOn className="text-green-400" /> 123 Street, City,
                Country
              </p>
            </div>
            <div className="flex justify-center md:justify-start gap-4 text-3xl">
              <a href="#" className="hover:text-blue-400 transition-all">
                <Facebook />
              </a>
              <a href="#" className="hover:text-blue-300 transition-all">
                <Twitter />
              </a>
              <a href="#" className="hover:text-blue-500 transition-all">
                <LinkedIn />
              </a>
            </div>
          </div>

          {/* Right Side - Form */}
          <motion.div
            className="flex-1 bg-gray-800 bg-opacity-50 p-6 rounded-xl shadow-lg backdrop-blur-3xl w-full max-w-md"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-3 bg-gray-900 bg-opacity-50 text-white rounded-md outline-none border border-transparent focus:border-blue-400"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-3 bg-gray-900 bg-opacity-50 text-white rounded-md outline-none border border-transparent focus:border-blue-400"
              />
              <textarea
                placeholder="Your Message"
                rows="4"
                className="w-full p-3 bg-gray-900 bg-opacity-50 text-white rounded-md outline-none border border-transparent focus:border-blue-400"
              ></textarea>
              <motion.button
                type="submit"
                className="w-full py-3 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 transition-all"
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default ContactUs;
