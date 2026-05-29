import { useEffect } from "react";
import { Eye, KeyRound, Mail, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { urls } from "../services/api";

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.6 14.5 2.7 12 2.7 6.9 2.7 2.8 6.8 2.8 12S6.9 21.3 12 21.3c6.2 0 9.2-4.3 9.2-6.5 0-.4 0-.7-.1-1H12z"
      />
      <path
        fill="#34A853"
        d="M2.8 12c0 1.7.5 3.2 1.4 4.6l3.4-2.6c-.2-.6-.4-1.2-.4-2s.1-1.4.4-2L4.2 7.4A9.2 9.2 0 0 0 2.8 12z"
      />
      <path
        fill="#FBBC05"
        d="M12 21.3c2.5 0 4.6-.8 6.2-2.3l-3-2.3c-.8.6-1.9 1-3.3 1-2.5 0-4.6-1.7-5.3-4l-3.4 2.6c1.6 3 4.8 5 8.8 5z"
      />
      <path
        fill="#4285F4"
        d="M18.2 19c1.8-1.7 3-4.2 3-7.2 0-.6-.1-1.1-.2-1.6H12v3.9h5.4c-.3 1.3-1.1 2.2-2.2 3l3 2.3z"
      />
    </svg>
  );
}


function IllustrationPanel() {
  return (
    <div className="relative flex h-full min-h-[520px] flex-col overflow-hidden rounded-[34px] bg-[#ff623d] px-8 pb-6 pt-9 text-white lg:px-10 lg:pt-10">
      <div className="absolute inset-x-0 bottom-0 h-32 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.22),transparent_65%)]" />

      <div className="relative z-10 max-w-[380px]">
        <h1 className="text-[2.55rem] font-bold leading-[1.08] text-white lg:text-[3rem]">
          Simplify management with our dashboard
        </h1>
        <p className="mt-5 max-w-[340px] text-sm leading-6 text-white/88 lg:text-base">
          Simplify your e-commerce management with our user friendly admin
          dashboard
        </p>
      </div>

      <div className="relative mt-auto h-[300px] lg:h-[330px]">
        <div className="absolute bottom-2 left-8 right-8 h-px bg-[#c74323]/70" />
        <div className="absolute bottom-24 left-[10%] right-[10%] h-4 rounded-full bg-[#dc4f2d]" />
        <div className="absolute bottom-28 left-[14%] h-40 w-4 rounded-full bg-[#b9361d]" />
        <div className="absolute bottom-28 right-[14%] h-40 w-4 rounded-full bg-[#b9361d]" />

        <div className="absolute bottom-36 left-[16%] h-24 w-28 rounded-[14px] bg-[#53586b] shadow-[0_20px_40px_rgba(31,44,153,0.28)]">
          <div className="absolute -top-6 left-1/2 h-6 w-1.5 -translate-x-1/2 rounded-full bg-white/80" />
          <div className="absolute -top-5 left-[40%] h-5 w-1 rotate-[-26deg] rounded-full bg-white/70" />
          <div className="absolute -top-5 left-[58%] h-5 w-1 rotate-[26deg] rounded-full bg-white/70" />
          <div className="absolute -bottom-14 left-[44%] h-14 w-5 rounded-t-[8px] bg-[#c3cbf1]" />
          <div className="absolute -bottom-[3.8rem] left-[28%] h-3 w-16 rounded-full bg-[#ffb199]" />
        </div>

        <div className="absolute bottom-40 right-[18%] h-16 w-20 rotate-[7deg] rounded-[14px] bg-[#7d2d53] shadow-[0_16px_32px_rgba(48,18,104,0.22)]">
          <div className="absolute -bottom-3 left-6 h-3 w-10 rounded-b-[8px] bg-[#ff9b7f]" />
        </div>

        <div className="absolute bottom-28 left-1/2 h-36 w-36 -translate-x-1/2 rounded-[78px_78px_62px_62px] bg-[#f3f6ff]" />
        <div className="absolute bottom-[13rem] left-1/2 h-12 w-20 -translate-x-1/2 rounded-[36px_36px_18px_18px] bg-[#2c3045]" />
        <div className="absolute bottom-[15.2rem] left-1/2 h-12 w-16 -translate-x-1/2 rounded-[32px_32px_8px_8px] bg-[#d59279]" />
        <div className="absolute bottom-[17.4rem] left-1/2 h-7 w-32 -translate-x-1/2 rounded-full border-[8px] border-[#dca0bb] border-b-[12px] border-b-[#bb6b95]" />
        <div className="absolute bottom-[13.6rem] left-[46%] h-3 w-3 rounded-full bg-[#28304b]" />
        <div className="absolute bottom-[13.6rem] left-[54%] h-3 w-3 rounded-full bg-[#28304b]" />
        <div className="absolute bottom-[12.8rem] left-1/2 h-3 w-9 -translate-x-1/2 rounded-full border-b-[3px] border-[#d67e97]" />

        <div className="absolute bottom-40 left-[37%] h-14 w-7 rotate-[22deg] rounded-full bg-[#f6f8ff]" />
        <div className="absolute bottom-32 left-[31%] h-20 w-5 rotate-[72deg] rounded-full bg-[#edf1ff]" />
        <div className="absolute bottom-32 left-[27%] h-10 w-3 rotate-[22deg] rounded-full bg-[#da8a7f]" />

        <div className="absolute bottom-40 right-[37%] h-14 w-7 rotate-[-18deg] rounded-full bg-[#f6f8ff]" />
        <div className="absolute bottom-48 right-[30%] h-20 w-5 rotate-[-10deg] rounded-full bg-[#edf1ff]" />
        <div className="absolute bottom-[15.5rem] right-[28%] h-9 w-3 rotate-[8deg] rounded-full bg-[#da8a7f]" />

        <div className="absolute bottom-14 left-[40%] h-24 w-14 rotate-[7deg] rounded-[22px] bg-[#d94825]" />
        <div className="absolute bottom-14 right-[40%] h-24 w-14 rotate-[-8deg] rounded-[22px] bg-[#bd351c]" />
        <div className="absolute bottom-12 left-[34%] h-5 w-16 rotate-[18deg] rounded-full border-[4px] border-[#ffc0ad]" />
        <div className="absolute bottom-12 right-[34%] h-5 w-16 rotate-[-22deg] rounded-full border-[4px] border-[#ffc0ad]" />

        <div className="absolute bottom-16 left-1/2 h-24 w-3 -translate-x-1/2 rounded-full bg-[#ffc0ad]" />
        <div className="absolute bottom-9 left-1/2 h-10 w-10 -translate-x-1/2 rounded-full border border-[#ffc0ad] bg-white/20" />
        <div className="absolute bottom-5 left-[11%] h-16 w-10 rounded-[22px_22px_10px_10px] bg-[#82b971]" />
        <div className="absolute bottom-2 left-[10%] h-4 w-12 rounded-[6px] bg-[#ad6178]" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const backendUrl = urls.getBackendUrl();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleGoogleLogin = () => {
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  if (loading) {
    return null;
  }

  return (
    <div className="relative mx-auto flex max-h-[calc(100dvh-3.5rem)] min-h-[calc(100dvh-3.5rem)] max-w-[1500px] rounded-[34px] bg-white px-4  shadow-[0_22px_64px_rgba(17,24,39,0.08)] md:max-h-[calc(100dvh-2.5rem)] md:min-h-[calc(100dvh-2.5rem)] lg:px-6 lg:py-6">
      <div className="pointer-events-none absolute right-[8%] top-[5%] hidden h-40 w-40 rounded-full bg-[#cdb3ff]/50 blur-[82px] lg:block" />
      <div className="relative grid min-h-0 flex-1 gap-6 lg:grid-cols-[1.03fr_0.97fr] lg:gap-8">
        <IllustrationPanel />

        <section className="flex relative min-h-0 items-center justify-center px-2 py-4 lg:px-5">
          <div className="w-full max-w-[500px]">
            
            <div className="flex items-center justify-center gap-3 text-[#ff623d]">
              <Sparkles className="h-8 w-8" />
              <span className="text-md font-bold">
                AI Teams Assistant
              </span>
            </div>
            
            <div className="mt-4 text-2xl font-bold text-slate-800">
              Sign in to your account
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Welcome back! Please enter your details.
            </p>


            <form className="mt-8 space-y-5" onSubmit={(event) => event.preventDefault()}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Email
                </label>
                <div className="flex h-14 items-center gap-3 rounded-[10px] border border-[#d9d9d9] bg-white px-4 text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors focus-within:border-[#ff623d]">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Airspace@info.com"
                    className="h-full w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Password
                </label>
                <div className="flex h-14 items-center gap-3 rounded-[10px] border border-[#d9d9d9] bg-white px-4 text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors focus-within:border-[#ff623d]">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="************"
                    className="h-full w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300"
                  />
                  <Eye className="h-5 w-5 text-slate-700" />
                </div>
              </div>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 rounded border-slate-300 accent-[#ff623d]"
                  defaultChecked
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-800">
                    Remember me
                  </span>
                  <span className="mt-1 block text-sm text-slate-500">
                    Save my login details for next time.
                  </span>
                </span>
              </label>

              <button
                type="submit"
                className="h-14 w-full rounded-[10px] bg-[#ff623d] text-base font-semibold text-white shadow-[0_12px_24px_rgba(255,98,61,0.18)] transition-colors hover:bg-[#ff744f]"
              >
                Sign In
              </button>
            </form>

            <div className="relative my-5 flex items-center justify-center">
              <div className="absolute inset-x-0 h-px bg-[#dddddd]" />
              <span className="relative bg-white px-4 text-sm text-[#777777]">
                or continue with
              </span>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-[16px] border border-[#dedede] bg-white text-sm font-semibold text-[#444444] transition-colors hover:bg-slate-50"
              >
                <GoogleMark />
                Continue with Google
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
