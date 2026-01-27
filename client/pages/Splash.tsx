import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-navigate to onboarding after 2 seconds
    const timer = setTimeout(() => {
      navigate("/onboarding");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="min-h-screen font-inter flex flex-col items-center justify-center px-4 md:px-8 overflow-hidden rounded-[30px]"
      style={{
        background: "linear-gradient(180deg, #33E4DB 0%, #00BBD3 100%)",
      }}
    >
      <div className="flex flex-col items-center gap-7">
        {/* Logo */}
        <div className="w-[189px] h-[190px] flex-shrink-0">
          <svg
            width="189"
            height="190"
            viewBox="0 0 189 190"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="94.5" cy="95" r="94.5" fill="white" opacity="0.3" />
            <path
              d="M94.5 30C94.5 30 140 42 140 95C140 148 94.5 160 94.5 160C94.5 160 49 148 49 95C49 42 94.5 30 94.5 30Z"
              fill="white"
            />
            <path
              d="M115 75H102V62C102 58.6863 99.3137 56 96 56C92.6863 56 90 58.6863 90 62V75H77C73.6863 75 71 77.6863 71 81C71 84.3137 73.6863 87 77 87H90V100C90 103.314 92.6863 106 96 106C99.3137 106 102 103.314 102 100V87H115C118.314 87 121 84.3137 121 81C121 77.6863 118.314 75 115 75Z"
              fill="url(#paint0_linear)"
            />
            <circle
              cx="94.5"
              cy="95"
              r="88"
              stroke="white"
              strokeWidth="2"
              opacity="0.6"
            />
            <circle cx="32" cy="58" r="4" fill="white" opacity="0.7" />
            <circle cx="22" cy="73" r="3" fill="white" opacity="0.6" />
            <circle cx="157" cy="127" r="5" fill="white" opacity="0.7" />
            <circle cx="170" cy="107" r="3" fill="white" opacity="0.6" />
            <defs>
              <linearGradient
                id="paint0_linear"
                x1="96"
                y1="56"
                x2="96"
                y2="106"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#33E4DB" />
                <stop offset="1" stopColor="#00BBD3" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Brand Name */}
        <h1 className="text-white text-[32px] font-semibold tracking-tight">
          <span className="font-black">Health</span>
          <span className="font-semibold">Track</span>
        </h1>
      </div>
    </div>
  );
}
