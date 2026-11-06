import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Code,
  CheckCircle,
  HelpCircle,
  Briefcase,
  Users,
} from "lucide-react";
import Footer from "../../components/general/footer";
import Squares from './../../animations/squares'
const AboutUs = () => {
  return (
    <div>
      <Squares></Squares>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black_A  text-white flex flex-col items-center px-6 md:px-16 py-40 tracking-wider">
        <motion.h1
          className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          About Us
        </motion.h1>

        <p className="mt-6 text-gray-300 max-w-4xl text-center text-lg md:text-xl">
          Welcome to AlgoMate, where learning meets innovation. We empower
          learners with comprehensive resources, interactive environments, and
          expert guidance to excel in technical fields.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-gray-700 bg-opacity-20 p-6 rounded-2xl shadow-md border border-gray-700 transition-all hover:border-gray-400 cursor-pointer flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <feature.icon className="text-gray-300 w-10 h-10 mb-4" />
              <h2 className="text-xl font-semibold text-gray-100">
                {feature.title}
              </h2>
              <p className="text-gray-400 mt-2 text-center">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 max-w-4xl text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-3xl font-bold text-gray-200 border-b border-gray-500 pb-2">
            Our Mission
          </h2>
          <p className="mt-4 text-gray-300 text-lg">
            We aim to provide an engaging and effective learning experience by
            offering structured courses, real-world projects, and a supportive
            community of learners and mentors.
          </p>
        </motion.div>

        <motion.div
          className="mt-16 bg-gray-700 bg-opacity-20 text-white py-8 px-12 rounded-xl shadow-md text-center"
          whileHover={{ scale: 1.05 }}
        >
          <h2 className="text-2xl font-semibold">Join Us Today!</h2>
          <p className="mt-2 text-gray-300">
            Start your journey as a student or mentor and unlock a world of
            opportunities.
          </p>
          <Link to="/auth/user">
            <button className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:bg-gray-600 transition-all">
              Get Started
            </button>
          </Link>
        </motion.div>
      </div>
      <Footer></Footer>
    </div>
  );
};

const features = [
  {
    title: "Expert Articles",
    description:
      "Gain in-depth knowledge through well-structured and research-based articles on technical topics.",
    icon: BookOpen,
  },
  {
    title: "Practice Platform",
    description:
      "Enhance your coding skills with our interactive practice environment tailored for real-world challenges.",
    icon: Code,
  },
  {
    title: "Assessment Tests",
    description:
      "Test your understanding with industry-standard assessments to track your progress.",
    icon: CheckCircle,
  },
  {
    title: "Doubt Resolution",
    description:
      "Connect with mentors and get your doubts resolved quickly and efficiently.",
    icon: HelpCircle,
  },
  {
    title: "Job Updates",
    description:
      "Stay updated with the latest job opportunities and hiring trends in the tech industry.",
    icon: Briefcase,
  },
  {
    title: "Mentorship Opportunities",
    description:
      "Join our platform as a mentor and help shape the future of aspiring learners.",
    icon: Users,
  },
];

export default AboutUs;
