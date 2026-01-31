import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

async function sendToFlow(action: string, data: any) {
  const res = await fetch("/.netlify/functions/flow-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, data }),
  });
  const json = await res.json();
  if (!res.ok || json?.ok === false) {
    throw new Error(json?.message || json?.result?.message || "Flow error");
  }
  return json;
}

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const goBack = () => {
    // kalau user buka /login langsung, history bisa kosong
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!emailOrMobile.trim() || !password.trim()) {
      setError("Email/Mobile dan Password wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      const resp = await sendToFlow("login", {
        emailOrMobile: emailOrMobile.trim(),
        password,
      });

      setSuccessMsg("Login terkirim ke flow ✅");

      // Kalau flow mengembalikan redirect, pakai itu (opsional)
      const redirectTo = resp?.result?.redirectTo;
      if (typeof redirectTo === "string" && redirectTo.length > 0) {
        navigate(redirectTo);
      }
    } catch (err: any) {
      setError(err?.message || "Gagal mengirim login ke flow.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider: "google" | "facebook" | "fingerprint") => {
    setError(null);
    setSuccessMsg(null);
    try {
      setLoading(true);
      await sendToFlow("social_login", { provider });
      setSuccessMsg(`Social login (${provider}) terkirim ke flow ✅`);
    } catch (err: any) {
      setError(err?.message || "Gagal mengirim social login ke flow.");
    } finally {
      setLoading(false);
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
        style={{ background: "linear-gradient(180deg, #33E4DB 0%, #00BBD3 100%)" }}
      >
        <button
          type="button"
          onClick={goBack}
          className="absolute left-8 top-1/2 -translate-y-1/2 z-20 pointer-events-auto"
          aria-label="Back"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 0L0 7L8 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-white text-2xl font-semibold">Log In</h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 pt-10">
        {/* Welcome */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2" style={{ color: "#13CAD6" }}>
            Welcome
          </h2>
          <p className="text-xs font-light leading-[15px] text-[#252525]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        {/* Alert */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email/Mobile */}
          <div>
            <label className="block text-xl font-medium text-[#252525] mb-2">Email or Mobile Number</label>
            <input
              type="text"
              value={emailOrMobile}
              onChange={(e) => setEmailOrMobile(e.target.value)}
              placeholder="example@example.com"
              className="w-full h-[45px] rounded-[13px] bg-[#E9F6FE] px-4 text-xl text-[#13CAD6] placeholder:text-[#13CAD6] focus:outline-none focus:ring-2 focus:ring-[#33E4DB]"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xl font-medium text-[#252525] mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="*************"
                className="w-full h-[45px] rounded-[13px] bg-[#E9F6FE] px-4 pr-12 text-xl text-[#13CAD6] placeholder:text-[#13CAD6] focus:outline-none focus:ring-2 focus:ring-[#33E4DB]"
              />

              {/* Eye button: pastikan di atas input */}
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-auto p-1"
                aria-label="Toggle password"
              >
                <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M16.7949 4.67235C18.7613 6.0357 20 7.62848 20 8.30975C20 9.61123 15.8904 13.4876 10 13.4876C9.19558 13.4876 8.42437 13.4153 7.69231 13.2872M14.4872 3.37524C13.1341 2.77891 11.6084 2.38017 10 2.38017C4.52055 2.38017 0 7.00826 0 8.30975C0 9.24597 2.12656 11.5146 5.51282 12.7142M9.82788 10.9909C10.508 11.0554 11.2134 10.9119 11.8499 10.5343C12.8121 9.96355 13.4024 8.98506 13.5333 7.93388M7.94872 10.1913C7.64727 9.93332 7.38422 9.61722 7.1766 9.24775C6.23189 7.56656 6.79252 5.41683 8.42882 4.4462C9.85836 3.5982 11.636 3.93071 12.6923 5.14932M17.8205 0L2.30769 16"
                    stroke="url(#paint0_linear)"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="paint0_linear" x1="10" y1="0" x2="10" y2="16" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#33E4DB" />
                      <stop offset="1" stopColor="#00BBD3" />
                    </linearGradient>
                  </defs>
                </svg>
              </button>
            </div>

            <Link to="/forgot-password" className="block text-right text-xs font-medium text-[#13CAD6] mt-2">
              Forget Password
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-[191px] h-[45px] mx-auto block rounded-full text-white text-2xl font-semibold transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(180deg, #33E4DB 0%, #00BBD3 100%)" }}
          >
            {loading ? "Loading..." : "Log In"}
          </button>
        </form>

        {/* Social */}
        <div className="mt-8">
          <p className="text-center text-xs font-light text-[#252525] mb-4">or sign up with</p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => handleSocial("google")}
              className="w-10 h-10 rounded-full z-20 pointer-events-auto"
              style={{ background: "linear-gradient(180deg, #33E4DB 0%, #00BBD3 100%)" }}
              aria-label="Google login"
            >
              {/* svg sama seperti punyamu */}
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="url(#paint0_linear_g)" />
                <path
                  d="M27.0978 13.3805C25.578 11.9805 23.6227 11.1461 21.5603 11.0175C19.498 10.8888 17.4542 11.4738 15.7722 12.674C14.0902 13.8743 12.8724 15.6169 12.3234 17.609C11.7745 19.6011 11.9277 21.7214 12.7574 23.6139C13.5872 25.5063 15.0428 27.0556 16.88 28.0016C18.7171 28.9475 20.8238 29.2325 22.8462 28.8086C24.8686 28.3847 26.6836 27.2778 27.9863 25.6738C29.289 24.0698 30 22.0664 30 20L21 20"
                  stroke="#E9F6FE"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="paint0_linear_g" x1="20" y1="0" x2="20" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#33E4DB" />
                    <stop offset="1" stopColor="#00BBD3" />
                  </linearGradient>
                </defs>
              </svg>
            </button>

            <button
              type="button"
              onClick={() => handleSocial("facebook")}
              className="w-10 h-10 rounded-full z-20 pointer-events-auto"
              style={{ background: "linear-gradient(180deg, #33E4DB 0%, #00BBD3 100%)" }}
              aria-label="Facebook login"
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="url(#paint0_linear_f)" />
                <circle cx="20" cy="20" r="12" stroke="#E9F6FE" />
                <path d="M24 15H23C21.5 15 20 15.8 20 19C20 22.2 20 28.8333 20 32M24 22H16" stroke="#E9F6FE" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="paint0_linear_f" x1="20" y1="0" x2="20" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#33E4DB" />
                    <stop offset="1" stopColor="#00BBD3" />
                  </linearGradient>
                </defs>
              </svg>
            </button>

            <button
              type="button"
              onClick={() => handleSocial("fingerprint")}
              className="w-10 h-10 rounded-full z-20 pointer-events-auto"
              style={{ background: "linear-gradient(180deg, #33E4DB 0%, #00BBD3 100%)" }}
              aria-label="Fingerprint login"
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="url(#paint0_linear_fp)" />
                <path
                  d="M17.7621 19.9692C18.3305 21.8564 21.9229 27.3292 26.2882 28.4615M24.583 30.5846C21.1726 29.5231 17.7246 26.9122 15.7158 22.4461C13.3285 17.1385 18.7852 15.0153 20.8315 19.6154C21.6185 21.3846 22.8778 23.3307 26.6293 25.2769C30.3808 27.223 32.7681 21.3847 29.3577 19.6154C24.3919 17.0394 23.2188 9.63693 16.0569 11.1231C5.99636 13.2108 8.21284 27.0462 13.3285 30.9385M28.3345 22.4461C22.1957 20.323 22.3443 11.4942 15.7158 14.3076C8.21281 17.4922 13.6696 30.2308 20.4905 32M21.5136 9C25.2651 9.35385 26.2883 13.2462 30.3808 16.7846"
                  stroke="#E9F6FE"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="paint0_linear_fp" x1="20" y1="0" x2="20" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#33E4DB" />
                    <stop offset="1" stopColor="#00BBD3" />
                  </linearGradient>
                </defs>
              </svg>
            </button>
          </div>
        </div>

        {/* Sign Up link */}
        <p className="text-center text-xs mt-8">
          <span className="font-light text-[#252525]">Don't have an account? </span>
          <Link to="/signup" className="font-medium text-[#13CAD6]">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
