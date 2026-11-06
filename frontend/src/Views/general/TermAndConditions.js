import React from "react";
import Footer from "../../components/general/footer";
import Squares from './../../animations/squares'
const TermsOfService = () => {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-black_A">
      <Squares></Squares>

      <div className="max-w-4xl mx-auto p-6 text-gray-200 pt-32">
        <h1 className="text-4xl text-center font-bold mb-3 pb-3 border-b-2 border-slate-600 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-600">
          Terms of Service
        </h1>

        <p className="mb-4 text-sm">[ Last Updated: March 2025 ]</p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p className="ml-6 opacity-80 mt-2">
            Welcome to AlgoMate! By accessing or using our platform, you agree
            to abide by the terms outlined in this agreement. These terms govern
            your use of our website, services, and any associated content.
          </p>
          <p className="ml-6 opacity-80 mt-2">
            AlgoMate is designed to help users enhance their coding skills
            through interactive challenges, problem-solving exercises, and
            competitive programming contests. Your continued use of our services
            signifies your acceptance of these terms.
          </p>
          <p className="ml-6 opacity-80 mt-2">
            If you do not agree to these terms, please refrain from using our
            services.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">
            2. Eligibility and Registration
          </h2>
          <p className="ml-6 opacity-80 mt-2">
            To access certain features of AlgoMate, you may be required to
            create an account. You must provide accurate and complete
            information during registration and keep your account credentials
            secure.
          </p>
          <p className="ml-6 opacity-80 mt-2">
            By using AlgoMate, you affirm that you are at least 13 years old. If
            you are under 18, you must have parental consent.
          </p>
          <p className="ml-6 opacity-80 mt-2">
            AlgoMate reserves the right to suspend or terminate accounts that
            violate these terms or engage in fraudulent activities.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">3. Acceptable Use Policy</h2>
          <p className="ml-6 opacity-80 mt-2">
            You agree not to misuse our platform in any way, including but not
            limited to:
          </p>
          <ul className="list-disc ml-10 opacity-80">
            <li>Attempting to gain unauthorized access to our systems</li>
            <li>
              Distributing malware, harmful code, or engaging in hacking
              activities
            </li>
            <li>Posting offensive, illegal, or harmful content</li>
            <li>
              Using automated tools to scrape or copy our data without
              permission
            </li>
            <li>Impersonating another user or entity</li>
          </ul>
          <p className="ml-6 opacity-80 mt-2">
            Any violation of our acceptable use policy may result in the
            termination of your access to AlgoMate.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">4. User-Generated Content</h2>
          <p className="ml-6 opacity-80 mt-2">
            Users may submit content, including code solutions, comments, and
            discussions. By submitting content, you grant AlgoMate a
            non-exclusive, worldwide, royalty-free license to use, distribute,
            and modify your content to improve the platform.
          </p>
          <p className="ml-6 opacity-80 mt-2">
            You are responsible for ensuring that your submitted content does
            not infringe upon any copyrights or violate any laws. AlgoMate
            reserves the right to remove any content that breaches these terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">5. Intellectual Property</h2>
          <p className="ml-6 opacity-80 mt-2">
            All materials provided on AlgoMate, including text, graphics, logos,
            and software, are the intellectual property of AlgoMate.
            Unauthorized reproduction or distribution of our content is strictly
            prohibited.
          </p>
          <p className="ml-6 opacity-80 mt-2">
            You may use our services for personal, non-commercial purposes. Any
            other use requires prior written consent from AlgoMate.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">6. Termination</h2>
          <p className="ml-6 opacity-80 mt-2">
            AlgoMate reserves the right to terminate or suspend your access at
            any time if you violate these terms.
          </p>
          <p className="ml-6 opacity-80 mt-2">
            If you wish to delete your account, you may do so by contacting our
            support team at support@algomate.com.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">
            7. Disclaimers and Limitation of Liability
          </h2>
          <p className="ml-6 opacity-80 mt-2">
            AlgoMate is provided "as is" without any warranties. We do not
            guarantee that the platform will be error-free or always available.
          </p>
          <p className="ml-6 opacity-80 mt-2">
            AlgoMate shall not be liable for any direct, indirect, or incidental
            damages arising from the use of our platform.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">8. Changes to These Terms</h2>
          <p className="ml-6 opacity-80 mt-2">
            AlgoMate may update these terms periodically. Continued use of the
            platform after changes are made constitutes acceptance of the
            updated terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">9. Contact Us</h2>
          <p className="ml-6 opacity-80 mt-2">
            If you have any questions or concerns regarding these terms, you can
            contact us at:
          </p>
          <p className="ml-6 opacity-80 mt-2">Email: support@algomate.com</p>
        </section>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default TermsOfService;
