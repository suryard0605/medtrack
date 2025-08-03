import { FaHeart, FaUsers, FaShieldAlt, FaMobileAlt, FaBrain, FaChartLine, FaGlobe, FaStar, FaArrowLeft } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo medicare.png";

export default function AboutUs() {
  const [animatedElements, setAnimatedElements] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAnimatedElements(prev => [...prev, entry.target.dataset.animate]);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: FaHeart,
      title: "Health First",
      description: "Your well-being is our top priority. We believe in making healthcare accessible and manageable for everyone.",
      color: "from-red-400 to-pink-500"
    },
    {
      icon: FaUsers,
      title: "Family Care",
      description: "Manage medications for your entire family with ease. Keep everyone healthy and on track.",
      color: "from-blue-400 to-purple-500"
    },
    {
      icon: FaShieldAlt,
      title: "Secure & Private",
      description: "Your health data is protected with enterprise-grade security. Your privacy is our commitment.",
      color: "from-green-400 to-teal-500"
    },
    {
      icon: FaMobileAlt,
      title: "Smart Notifications",
      description: "Never miss a dose with intelligent reminders that adapt to your schedule and preferences.",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: FaBrain,
      title: "AI-Powered",
      description: "Advanced OCR technology reads prescriptions instantly, making medication management effortless.",
      color: "from-purple-400 to-indigo-500"
    },
    {
      icon: FaChartLine,
      title: "Progress Tracking",
      description: "Monitor your health journey with detailed analytics and insights to stay motivated.",
      color: "from-indigo-400 to-blue-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-6"
        >
          <FaArrowLeft size={16} />
          <span className="font-medium">Back to Dashboard</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            <h1 
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6"
              data-animate="fadeInUp"
            >
              About MedTrack
            </h1>
            <p 
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed"
              data-animate="fadeInUp"
            >
              We're revolutionizing how people manage their medications. Our mission is to make healthcare 
              accessible, manageable, and stress-free for everyone.
            </p>
            <div 
              className="flex flex-wrap justify-center gap-4"
              data-animate="fadeInUp"
            >
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <FaShieldAlt className="text-green-400" />
                <span className="text-sm font-medium">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <FaMobileAlt className="text-blue-400" />
                <span className="text-sm font-medium">Available 24/7</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <FaBrain className="text-purple-400" />
                <span className="text-sm font-medium">AI-Powered</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div data-animate="fadeInLeft">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                At MedTrack, we believe that managing medications shouldn't be complicated. Our platform 
                combines cutting-edge technology with human-centered design to create a seamless experience 
                that puts your health first.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Whether you're managing medications for yourself or your entire family, we're here to 
                make sure you never miss a dose and always stay on track with your health journey.
              </p>
            </div>
            <div 
              className="relative"
              data-animate="fadeInRight"
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Why Choose MedTrack?</h3>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <FaHeart className="text-red-300" />
                    <span>Personalized medication reminders</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <FaUsers className="text-blue-300" />
                    <span>Family management features</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <FaBrain className="text-purple-300" />
                    <span>AI-powered prescription reading</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <FaChartLine className="text-green-300" />
                    <span>Health progress tracking</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl font-bold text-gray-800 mb-4"
              data-animate="fadeInUp"
            >
              What Makes Us Special
            </h2>
            <p 
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              data-animate="fadeInUp"
            >
              Discover the features that set MedTrack apart from the rest
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                  animatedElements.includes(`feature-${index}`) ? 'animate-fadeInUp' : ''
                }`}
                data-animate={`feature-${index}`}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 
            className="text-4xl font-bold text-white mb-6"
            data-animate="fadeInUp"
          >
            Ready to Take Control of Your Health?
          </h2>
          <p 
            className="text-xl text-indigo-100 mb-8"
            data-animate="fadeInUp"
          >
            Start managing your medications effectively with MedTrack
          </p>
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            data-animate="fadeInUp"
          >
            <Link to="/" className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Started Today
            </Link>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center">
                  <img src={logo} alt="MedTrack Logo" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-xl font-bold">MedTrack</h3>
              </div>
              <p className="text-blue-100">
                Making healthcare accessible and manageable for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-blue-100">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-blue-100">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-blue-100">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-500 mt-8 pt-8 text-center text-blue-100">
            <p>&copy; 2024 MedTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 