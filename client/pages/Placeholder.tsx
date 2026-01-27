import { Link } from "react-router-dom";

interface PlaceholderProps {
  pageName: string;
}

export default function Placeholder({ pageName }: PlaceholderProps) {
  return (
    <div className="min-h-screen bg-white font-spartan flex flex-col items-center justify-center px-4 md:px-8">
      <div className="w-full max-w-[360px] flex flex-col items-center text-center">
        {/* Logo Icon */}
        <div className="mb-8">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="60"
              cy="60"
              r="60"
              fill="url(#paint0_linear)"
              opacity="0.2"
            />
            <path
              d="M75 50H65V40C65 36.6863 62.3137 34 59 34C55.6863 34 53 36.6863 53 40V50H43C39.6863 50 37 52.6863 37 56C37 59.3137 39.6863 62 43 62H53V72C53 75.3137 55.6863 78 59 78C62.3137 78 65 75.3137 65 72V62H75C78.3137 62 81 59.3137 81 56C81 52.6863 78.3137 50 75 50Z"
              fill="url(#paint1_linear)"
            />
            <defs>
              <linearGradient
                id="paint0_linear"
                x1="60"
                y1="0"
                x2="60"
                y2="120"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#33E4DB" />
                <stop offset="1" stopColor="#00BBD3" />
              </linearGradient>
              <linearGradient
                id="paint1_linear"
                x1="59"
                y1="34"
                x2="59"
                y2="78"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#33E4DB" />
                <stop offset="1" stopColor="#00BBD3" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1
          className="text-3xl font-medium mb-4"
          style={{ color: "#13CAD6" }}
        >
          {pageName}
        </h1>

        <p
          className="text-sm font-light leading-relaxed mb-8"
          style={{ color: "#252525" }}
        >
          This page is under construction. Continue prompting to fill in the
          content for this section.
        </p>

        <Link to="/onboarding">
          <button
            className="w-[206px] h-[45px] rounded-[100px] text-white text-xl font-medium transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(180deg, #33E4DB 0%, #00BBD3 100%)",
            }}
          >
            Back to Start
          </button>
        </Link>
      </div>
    </div>
  );
}
