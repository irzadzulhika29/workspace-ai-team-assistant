import { Link } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const normalized = (value) => String(value || "").toLowerCase();

export const isIntegrationLockedError = (error, provider = "") => {
  const message = normalized(error?.message || error);
  const target = normalized(provider);
  const status = Number(error?.response?.status || error?.status || 0);

  if (!message) return false;

  const authStatusLocked =
    status === 401 ||
    status === 403 ||
    message.includes("status code 401") ||
    message.includes("status code 403");

  const googleLocked =
    message.includes("google account not connected") ||
    message.includes("google belum terhubung") ||
    message.includes("connect your google account") ||
    authStatusLocked;

  const jiraLocked =
    message.includes("jira belum terhubung") ||
    message.includes("jira not connected") ||
    message.includes("jira integration not found") ||
    authStatusLocked;

  if (target === "google") return googleLocked;
  if (target === "jira") return jiraLocked;

  return googleLocked || jiraLocked;
};

function LockedIntegrationState({
  title,
  description,
  actionLabel = "Koneksikan di Settings",
  to = "/settings",
  className,
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border border-slate-200 bg-white",
        className,
      )}
    >
      <div className="grid gap-4 p-6 opacity-35 blur-[2px] sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-6"
          >
            <div className="h-4 w-20 rounded-full bg-slate-200" />
            <div className="mt-4 h-10 w-14 rounded-xl bg-slate-200" />
            <div className="mt-4 h-3 w-full rounded-full bg-slate-200" />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/75 px-6 text-center backdrop-blur-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4ef] text-[#ff623d]">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-950">{title}</p>
          <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
        <Button asChild className="rounded-xl">
          <Link to={to}>{actionLabel}</Link>
        </Button>
      </div>
    </div>
  );
}

export { LockedIntegrationState };
