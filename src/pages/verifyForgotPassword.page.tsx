// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate, Link } from 'react-router-dom';
// import { Shield, ArrowLeft } from 'lucide-react';
// import toast from 'react-hot-toast';
// import { api } from '../lib/api';

// const ForgotPasswordVerifyPage: React.FC = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const [email, setEmail] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

//   useEffect(() => {
//     if (location.state?.email) {
//       setEmail(location.state.email);
//     } else {
//       // If no email in state, redirect to email input page
//       navigate('/forgot-password');
//     }
//   }, [location, navigate]);

//   useEffect(() => {
//     if (timeLeft > 0) {
//       const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [timeLeft]);

//   const handleOtpChange = (index: number, value: string) => {
//     if (value.length <= 1 && /^\d*$/.test(value)) {
//       const newOtp = [...otp];
//       newOtp[index] = value;
//       setOtp(newOtp);

//       // Auto-focus next input
//       if (value && index < 5) {
//         const nextInput = document.getElementById(`otp-${index + 1}`);
//         if (nextInput) nextInput.focus();
//       }
//     }
//   };

//   const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
//     if (e.key === 'Backspace' && !otp[index] && index > 0) {
//       const prevInput = document.getElementById(`otp-${index - 1}`);
//       if (prevInput) prevInput.focus();
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const otpString = otp.join('');
    
//     if (otpString.length !== 6) {
//       toast.error('Please enter 6-digit OTP');
//       return;
//     }

//     setIsLoading(true);

//     try {
//       // Verify OTP with backend
//       const response = await api.post('/auth/verify-otp', { 
//         email, 
//         otp: otpString 
//       });
      
//       // Assuming backend returns a token or success message
//       const token = response.data.token || response.data.resetToken;
      
//       toast.success('OTP verified successfully!');
      
//       // Navigate to reset password page with email and token
//       navigate('/reset-password', { 
//         state: { 
//           email, 
//           token: token || 'verified' // Fallback if no token
//         } 
//       });
//     } catch (error: any) {
//       console.error('OTP verification error:', error);
//       toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleResendOtp = async () => {
//     try {
//       await api.post('/auth/forgot-password', { email });
//       setTimeLeft(300);
//       toast.success('OTP resent successfully!');
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Failed to resend OTP');
//     }
//   };

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
//       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
//         <Link
//           to="/forgot-password"
//           className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6"
//         >
//           <ArrowLeft className="w-4 h-4 mr-2" />
//           Back
//         </Link>

//         <div className="text-center mb-8">
//           <div className="inline-flex p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
//             <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
//           </div>
//           <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
//             Verify OTP
//           </h1>
//           <p className="text-gray-600 dark:text-gray-300 mt-2">
//             Enter the 6-digit code sent to <br />
//             <span className="font-semibold">{email}</span>
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
//               Verification Code
//             </label>
//             <div className="flex justify-between space-x-2">
//               {otp.map((digit, index) => (
//                 <input
//                   key={index}
//                   id={`otp-${index}`}
//                   type="text"
//                   value={digit}
//                   onChange={(e) => handleOtpChange(index, e.target.value)}
//                   onKeyDown={(e) => handleKeyDown(index, e)}
//                   className="w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 outline-none transition"
//                   maxLength={1}
//                   autoFocus={index === 0}
//                 />
//               ))}
//             </div>
//           </div>

//           <div className="text-center">
//             <div className={`text-sm font-medium ${timeLeft > 0 ? 'text-gray-500' : 'text-red-500'}`}>
//               Time remaining: {formatTime(timeLeft)}
//             </div>
//             <button
//               type="button"
//               onClick={handleResendOtp}
//               disabled={timeLeft > 0}
//               className={`mt-2 text-sm font-medium ${timeLeft > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'}`}
//             >
//               Didn't receive code? Resend OTP
//             </button>
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading || otp.join('').length !== 6}
//             className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
//           >
//             {isLoading ? 'Verifying...' : 'Verify OTP'}
//           </button>
//         </form>

//         <div className="mt-6 text-center">
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             Entered wrong email?{' '}
//             <Link
//               to="/forgot-password"
//               className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
//             >
//               Go back
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ForgotPasswordVerifyPage;



import { useState } from "react";
import { authService } from "../lib/authService";
import { useLocation, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../lib/handleApiError";

export default function VerifyResetOtp() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    try {
      const res = await authService.verifyResetOtp(email, otp);
      navigate("/reset-password", { state: { token: res.resetToken } });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (!email) return <p>Unauthorized access</p>;

  return (
    <div className="auth-container">
      <h2>Verify OTP</h2>
      {error && <p className="error">{error}</p>}
      <input placeholder="OTP" value={otp} onChange={e => setOtp(e.target.value)} />
      <button onClick={handleVerify}>Verify</button>
    </div>
  );
}
