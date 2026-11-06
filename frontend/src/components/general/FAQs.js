import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto p-10 px-6 ">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-100 mb-8">
        ❓Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <motion.div
            key={index}
            className="bg-gray-900 bg-opacity-60 p-5 rounded-lg shadow-md border border-gray-500 duration-150 hover:bg-opacity-90 "
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{ once: true }}
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="flex items-center justify-between w-full text-left focus:outline-none"
            >
              <h3 className="text-lg font-semibold text-blue-100">
                {faq.question}
              </h3>
              {openIndex === index ? (
                <ChevronUp className="text-gray-400" />
              ) : (
                <ChevronDown className="text-gray-400" />
              )}
            </button>
            {openIndex === index && (
              <motion.p
                className="text-gray-400 mt-3 text-sm leading-relaxed"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                {faq.answer}
              </motion.p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
const faqData = [
  {
    question: "What mentor support options are available on AlgoMate?",
    answer:
      "At AlgoMate, we understand the importance of personalized guidance to clear doubts and boost learning. We offer mentor support via live chat for quick queries and doubt clarification. In addition, we provide one-on-one doubt session meetings, where you can book a time slot to discuss complex topics or any questions you may have. Our mentors are experienced professionals in various domains like DSA, web development, and competitive programming, ensuring that you get the best guidance for your learning journey.",
  },
  {
    question: "How can I find jobs easily on AlgoMate?",
    answer:
      "AlgoMate is more than just a learning platform; it also helps you in your job search. We provide a job portal that aggregates trending and relevant job opportunities from top companies. These job postings are regularly updated, ensuring you always have access to the latest openings in the tech industry. You can filter the job listings based on your skillset, location, and career level. Additionally, we offer guidance on creating standout resumes, preparing for interviews, and how to apply for jobs effectively.",
  },
  {
    question:
      "What resources are available for learning DSA, Web Development, and other core subjects?",
    answer:
      "AlgoMate offers a comprehensive collection of free articles and tutorials to help you learn various subjects such as Data Structures and Algorithms (DSA), Web Development, Competitive Programming (CP), and other core subjects. Our articles break down concepts in a clear and easy-to-understand way, and we also provide practical exercises that allow you to apply what you've learned. From basic algorithms to complex coding structures, we ensure that you have access to the best learning material to strengthen your understanding of key technical subjects.",
  },
  {
    question: "Can I practice DSA and coding questions on AlgoMate?",
    answer:
      "Yes! AlgoMate provides a robust platform where you can practice a wide range of DSA and coding problems. Whether you’re a beginner or an experienced coder, you’ll find problems sorted by difficulty and topic to help you build and improve your skills. Our problem sets cover everything from basic algorithms to advanced DSA topics, including dynamic programming, graph theory, sorting, and more. Additionally, we offer curated practice sheets that will guide you through a set of problems designed to enhance your problem-solving abilities and prepare you for coding interviews.",
  },
  {
    question: "What are practice sheets, and how do they help me?",
    answer:
      "Practice sheets on AlgoMate are carefully curated collections of coding problems that are designed to target specific topics, skills, or concepts. These sheets help you systematically work through a variety of problems to improve your understanding and proficiency in particular areas, such as dynamic programming, graph algorithms, or arrays. They are designed to ensure comprehensive learning and effective preparation for coding interviews, competitive programming contests, and technical exams. Completing these sheets will enhance your problem-solving abilities and boost your confidence in tackling coding challenges.",
  },
  {
    question: "Are there any assessment tests to evaluate my knowledge?",
    answer:
      "Yes, AlgoMate provides assessment tests designed to evaluate your knowledge and understanding of key topics. These tests are structured to simulate real-life coding interviews and competitive programming contests, offering a great way to track your progress and identify areas for improvement. The tests cover a variety of subjects, including Data Structures and Algorithms (DSA), Web Development, Competitive Programming (CP), and Core Technical Concepts. After completing the tests, you receive detailed feedback on your performance, helping you pinpoint strengths and weaknesses. These assessments are a valuable tool for anyone looking to get a job in tech or improve their coding skills.",
  },
];

export default FAQSection;
