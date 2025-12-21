import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, Key, ArrowRight } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); 
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    otp: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- HELPER: SAFE ERROR MESSAGE ---
  // This prevents "Objects are not valid as React child" crashes
  const getErrorMessage = (err) => {
    if (err.response && err.response.data) {
      if (typeof err.response.data === "string") return err.response.data;
      if (typeof err.response.data === "object") return "Error: Username or Email might be taken.";
    }
    return "Something went wrong. Please try again.";
  };

  // --- 1. HANDLE REGISTER / LOGIN ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "login" : "register";
    
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, formData);

      if (isLogin) {
        if (!res.data.token || !res.data.user) {
           toast.error("Login failed: Incomplete data from server.");
           return;
        }
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        window.location.href = '/'; 
      } else {
        toast.success("OTP Sent! Check your server console.");
        setStep(2); 
      }

    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err)); // Use safe error helper
    }
  };

  // --- 2. HANDLE OTP VERIFICATION ---
  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify", {
        email: formData.email,
        otp: formData.otp
      });

      if (!res.data.user || !res.data.token) {
        toast.error("Verification worked, but Login failed. Missing Token.");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      toast.success("Account Verified!");
      window.location.href = '/'; 

    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err)); // Use safe error helper
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        
        <div className="bg-campus-red p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">CampusConnect</h2>
          <p className="text-red-100">Student Community Platform</p>
        </div>

        <div className="p-8">
          {step === 2 ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Verify Email</h3>
                <p className="text-sm text-gray-500">Enter code sent to {formData.email}</p>
              </div>
              
              <div className="relative">
                <Key className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 4-digit OTP"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-campus-red outline-none"
                  onChange={handleChange}
                  required
                />
              </div>
              
              <button type="submit" className="w-full bg-campus-red text-white py-2 rounded-lg font-bold hover:bg-red-700 transition flex items-center justify-center gap-2">
                Verify & Login <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 text-center mb-6">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h3>

              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    name="username"
                    placeholder="Full Name"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-campus-red outline-none"
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  placeholder="Student Email"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-campus-red outline-none"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-campus-red outline-none"
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="w-full bg-campus-red text-white py-2 rounded-lg font-bold hover:bg-red-700 transition">
                {isLogin ? "Login" : "Get OTP"}
              </button>
            </form>
          )}

          {step === 1 && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? "New here? " : "Already have an account? "}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-campus-red font-bold hover:underline"
                >
                  {isLogin ? "Create Account" : "Login"}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;