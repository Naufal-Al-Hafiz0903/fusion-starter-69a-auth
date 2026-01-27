import { Link } from "react-router-dom";

export default function Auth() {
  return (
    <div className="min-h-screen bg-white font-spartan flex flex-col items-center justify-center px-4 md:px-8">
      <div className="w-full max-w-[360px] flex flex-col items-center">
        {/* Logo Container */}
        <div className="mb-8">
          <svg
            width="189"
            height="190"
            viewBox="0 0 189 190"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="94.5" cy="95" r="94.5" fill="url(#paint0_linear)" />
            <path
              d="M94.5 40C94.5 40 130 50 130 95C130 140 94.5 150 94.5 150C94.5 150 59 140 59 95C59 50 94.5 40 94.5 40Z"
              fill="white"
            />
            <path
              d="M110 80H99V69C99 66.2386 96.7614 64 94 64C91.2386 64 89 66.2386 89 69V80H78C75.2386 80 73 82.2386 73 85C73 87.7614 75.2386 90 78 90H89V101C89 103.761 91.2386 106 94 106C96.7614 106 99 103.761 99 101V90H110C112.761 90 115 87.7614 115 85C115 82.2386 112.761 80 110 80Z"
              fill="url(#paint1_linear)"
            />
            <circle
              cx="94.5"
              cy="95"
              r="88"
              stroke="url(#paint2_linear)"
              strokeWidth="2"
            />
            <circle cx="35" cy="60" r="4" fill="url(#paint3_linear)" />
            <circle cx="25" cy="75" r="3" fill="url(#paint4_linear)" />
            <circle cx="155" cy="125" r="5" fill="url(#paint5_linear)" />
            <circle cx="168" cy="105" r="3" fill="url(#paint6_linear)" />
            <defs>
              <linearGradient
                id="paint0_linear"
                x1="94.5"
                y1="0"
                x2="94.5"
                y2="190"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#33E4DB" />
                <stop offset="1" stopColor="#00BBD3" />
              </linearGradient>
              <linearGradient
                id="paint1_linear"
                x1="94"
                y1="64"
                x2="94"
                y2="106"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#33E4DB" />
                <stop offset="1" stopColor="#00BBD3" />
              </linearGradient>
              <linearGradient
                id="paint2_linear"
                x1="94.5"
                y1="5"
                x2="94.5"
                y2="185"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#33E4DB" />
                <stop offset="1" stopColor="#00BBD3" />
              </linearGradient>
              <linearGradient
                id="paint3_linear"
                x1="35"
                y1="56"
                x2="35"
                y2="64"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#33E4DB" />
                <stop offset="1" stopColor="#00BBD3" />
              </linearGradient>
              <linearGradient
                id="paint4_linear"
                x1="25"
                y1="72"
                x2="25"
                y2="78"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#33E4DB" />
                <stop offset="1" stopColor="#00BBD3" />
              </linearGradient>
              <linearGradient
                id="paint5_linear"
                x1="155"
                y1="120"
                x2="155"
                y2="130"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#33E4DB" />
                <stop offset="1" stopColor="#00BBD3" />
              </linearGradient>
              <linearGradient
                id="paint6_linear"
                x1="168"
                y1="102"
                x2="168"
                y2="108"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#33E4DB" />
                <stop offset="1" stopColor="#00BBD3" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Brand Name */}
        <h1 className="font-inter text-[32px] font-semibold mb-12 bg-gradient-to-br from-brand-cyan to-brand-cyan-dark bg-clip-text text-transparent tracking-tight">
          <span className="font-black">Health</span>
          <span className="font-semibold">Track</span>
        </h1>

        {/* Description */}
        <p
          className="text-xs font-light leading-normal text-center mb-12 px-8"
          style={{ color: "#070707" }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>

        {/* Log In Button */}
        <Link to="/login">
          <button
            className="w-[207px] h-[45px] rounded-[30px] text-white text-2xl font-medium mb-3 transition-all hover:opacity-90"
            style={{
              background: "#33E4DB",
            }}
          >
            Log In
          </button>
        </Link>

        {/* Sign Up Button */}
        <Link to="/signup">
          <button
            className="w-[207px] h-[45px] rounded-[30px] text-2xl font-medium transition-all hover:opacity-90"
            style={{
              background: "#E9F6FE",
              color: "#13CAD6",
            }}
          >
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
}
