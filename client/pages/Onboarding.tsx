import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MedicalHistoryIllustration = () => (
  <svg
    width="299"
    height="236"
    viewBox="0 0 299 236"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="150" cy="118" r="118" fill="url(#paint0_linear)" opacity="0.15" />
    <rect x="50" y="40" width="80" height="100" rx="8" fill="#FFA500" />
    <rect x="150" y="55" width="80" height="85" rx="8" fill="#33E4DB" />
    <rect x="100" y="160" width="100" height="60" rx="8" fill="#5B6AFF" />

    {/* Laptop */}
    <g>
      <rect x="140" y="100" width="110" height="65" rx="6" fill="#17C9B7" />
      <rect x="145" y="105" width="100" height="50" rx="4" fill="white" opacity="0.9" />
      <circle cx="195" cy="165" r="4" fill="white" />
    </g>

    {/* Person silhouette */}
    <g>
      <circle cx="60" cy="95" r="12" fill="#1a1a1a" />
      <path
        d="M50 110L55 125L50 135M70 110L65 125L70 135M55 125L65 125M60 110L60 120"
        stroke="#1a1a1a"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>

    {/* Medical icons */}
    <g>
      <rect x="35" y="50" width="25" height="25" rx="4" fill="#33E4DB" />
      <path
        d="M45.5 55V65M40 60H51"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>

    <defs>
      <linearGradient
        id="paint0_linear"
        x1="150"
        y1="0"
        x2="150"
        y2="236"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#33E4DB" />
        <stop offset="1" stopColor="#00BBD3" />
      </linearGradient>
    </defs>
  </svg>
);

const onboardingSteps = [
  {
    title: "Choose Your Doctor",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    illustration: "https://api.builder.io/api/v1/image/assets/TEMP/0d217e1939b83108bbfa75501edf91323cd81496?width=598",
    buttonText: "Next",
  },
  {
    title: "Schedule Your Appointments",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    illustration: "https://api.builder.io/api/v1/image/assets/TEMP/4efdbc4acf633ee46888c324af448d27a660dc4c?width=598",
    buttonText: "Next",
  },
  {
    title: "Check Your Medical History",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    illustration: null,
    buttonText: "Get Started",
  },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/auth");
    }
  };

  const handleSkip = () => {
    navigate("/auth");
  };

  const step = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-white font-spartan flex flex-col items-center justify-center px-4 md:px-8 relative">
      {/* Status Bar Background */}
      <div className="absolute top-0 left-0 right-0 h-7 bg-[#E2EAFF] bg-opacity-66 z-10" />

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-10 right-6 md:right-8 z-20 flex items-center gap-1 text-black text-[15px] font-light"
      >
        <span>Skip</span>
        <svg
          width="8"
          height="14"
          viewBox="0 0 8 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 14L8 7L0 0"
            stroke="url(#paint0_linear)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient
              id="paint0_linear"
              x1="8"
              y1="7"
              x2="0"
              y2="7"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#33E4DB" />
              <stop offset="1" stopColor="#00BBD3" />
            </linearGradient>
          </defs>
        </svg>
      </button>

      {/* Top Gradient Background */}
      <div className="absolute top-0 left-0 right-0 h-[350px] rounded-[360px] pointer-events-none">
        <div
          className="w-full h-full rounded-[360px]"
          style={{
            background:
              "linear-gradient(180deg, #ECF2FF 0%, rgba(236, 242, 255, 0.00) 41.5%)",
          }}
        />
      </div>

      {/* Bottom Gradient Background */}
      <div className="absolute bottom-0 left-0 right-0 h-[229px] rounded-[360px] pointer-events-none">
        <div
          className="w-full h-full rounded-[360px]"
          style={{
            background:
              "linear-gradient(180deg, #ECF2FF -11.23%, rgba(236, 242, 255, 0.00) 29.23%)",
            transform: "rotate(180deg)",
          }}
        />
      </div>

      {/* Content Container */}
      <div className="w-full max-w-[360px] relative z-10 flex flex-col items-center">
        {/* Illustration */}
        <div className="w-full flex justify-center mb-8 mt-16 md:mt-20">
          {step.illustration ? (
            <img
              src={step.illustration}
              alt={step.title}
              className="w-[299px] h-auto object-contain"
            />
          ) : currentStep === 2 ? (
            <MedicalHistoryIllustration />
          ) : null}
        </div>

        {/* Title */}
        <h1
          className="text-[32px] font-medium leading-normal text-center capitalize mb-6 px-10"
          style={{ color: "#13CAD6" }}
        >
          {step.title}
        </h1>

        {/* Description */}
        <p
          className="text-xs font-light leading-[15px] text-center px-14 mb-10"
          style={{
            color: "#252525",
            letterSpacing: "-0.06px",
          }}
        >
          {step.description}
        </p>

        {/* Progress Dots */}
        <div className="flex gap-[13px] mb-12">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`w-[9px] h-[9px] rounded-full transition-all duration-300`}
              style={{
                background:
                  index === currentStep
                    ? "linear-gradient(180deg, #33E4DB 0%, #00BBD3 100%)"
                    : "#E9F6FE",
              }}
            />
          ))}
        </div>

        {/* Next/Get Started Button */}
        <button
          onClick={handleNext}
          className="w-[206px] h-[45px] rounded-[100px] text-white text-2xl font-medium flex items-center justify-center transition-all hover:opacity-90"
          style={{
            background: "linear-gradient(180deg, #33E4DB 0%, #00BBD3 100%)",
            border: "1px solid #33E4DB",
          }}
        >
          {step.buttonText}
        </button>
      </div>
    </div>
  );
}
