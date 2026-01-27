import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password reset logic here
    if (password === confirmPassword) {
      console.log("Password reset:", { password });
      // Navigate to login or success page
      navigate("/login");
    } else {
      alert("Passwords do not match!");
    }
  };

  return (
    <div className="min-h-screen bg-white font-spartan flex flex-col">
      {/* Status Bar */}
      <div className="h-7 bg-[#ECF2FF] bg-opacity-66 flex items-center px-7">
        <span className="text-[13px] font-medium">16:04</span>
      </div>

      {/* Header */}
      <div
        className="h-[99px] flex items-center justify-center relative"
        style={{
          background: "linear-gradient(180deg, #33E4DB 0%, #00BBD3 100%)",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute left-8 top-1/2 -translate-y-1/2"
        >
          <svg
            width="8"
            height="14"
            viewBox="0 0 8 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 0L0 7L8 14"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="text-white text-2xl font-semibold">Set Password</h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 pt-6">
        {/* Description */}
        <p className="text-xs font-light text-[#252525] mb-8">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Input */}
          <div>
            <label className="block text-xl font-medium text-[#252525] mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="*************"
                className="w-full h-[45px] rounded-[13px] bg-[#E9F6FE] border border-[#E9F6FE] px-4 text-xl text-[#13CAD6] placeholder:text-[#13CAD6] focus:outline-none focus:ring-2 focus:ring-[#33E4DB]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <svg
                  width="20"
                  height="16"
                  viewBox="0 0 20 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.7949 4.67235C18.7613 6.0357 20 7.62848 20 8.30975C20 9.61123 15.8904 13.4876 10 13.4876C9.19558 13.4876 8.42437 13.4153 7.69231 13.2872M14.4872 3.37524C13.1341 2.77891 11.6084 2.38017 10 2.38017C4.52055 2.38017 0 7.00826 0 8.30975C0 9.24597 2.12656 11.5146 5.51282 12.7142M9.82788 10.9909C10.508 11.0554 11.2134 10.9119 11.8499 10.5343C12.8121 9.96355 13.4024 8.98506 13.5333 7.93388M7.94872 10.1913C7.64727 9.93332 7.38422 9.61722 7.1766 9.24775C6.23189 7.56656 6.79252 5.41683 8.42882 4.4462C9.85836 3.5982 11.636 3.93071 12.6923 5.14932M17.8205 0L2.30769 16"
                    stroke="url(#paint0_linear_pwd1)"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_pwd1"
                      x1="10"
                      y1="0"
                      x2="10"
                      y2="16"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#33E4DB" />
                      <stop offset="1" stopColor="#00BBD3" />
                    </linearGradient>
                  </defs>
                </svg>
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-xl font-medium text-[#252525] mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="*************"
                className="w-full h-[45px] rounded-[13px] bg-[#E9F6FE] border border-[#E9F6FE] px-4 text-xl text-[#13CAD6] placeholder:text-[#13CAD6] focus:outline-none focus:ring-2 focus:ring-[#33E4DB]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <svg
                  width="20"
                  height="16"
                  viewBox="0 0 20 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.7949 4.67235C18.7613 6.0357 20 7.62848 20 8.30975C20 9.61123 15.8904 13.4876 10 13.4876C9.19558 13.4876 8.42437 13.4153 7.69231 13.2872M14.4872 3.37524C13.1341 2.77891 11.6084 2.38017 10 2.38017C4.52055 2.38017 0 7.00826 0 8.30975C0 9.24597 2.12656 11.5146 5.51282 12.7142M9.82788 10.9909C10.508 11.0554 11.2134 10.9119 11.8499 10.5343C12.8121 9.96355 13.4024 8.98506 13.5333 7.93388M7.94872 10.1913C7.64727 9.93332 7.38422 9.61722 7.1766 9.24775C6.23189 7.56656 6.79252 5.41683 8.42882 4.4462C9.85836 3.5982 11.636 3.93071 12.6923 5.14932M17.8205 0L2.30769 16"
                    stroke="url(#paint0_linear_pwd2)"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_pwd2"
                      x1="10"
                      y1="0"
                      x2="10"
                      y2="16"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#33E4DB" />
                      <stop offset="1" stopColor="#00BBD3" />
                    </linearGradient>
                  </defs>
                </svg>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-[269px] h-[44px] mx-auto block rounded-full text-white text-2xl font-semibold transition-all hover:opacity-90 mt-12"
            style={{
              background: "linear-gradient(180deg, #33E4DB 0%, #00BBD3 100%)",
            }}
          >
            Create New Password
          </button>
        </form>
      </div>
    </div>
  );
}
