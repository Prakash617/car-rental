"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api/client";

function GoogleAuthBridgeContent() {
  const searchParams = useSearchParams();
  const tenant = searchParams.get("tenant") || "apex";
  const returnTo = searchParams.get("return_to");

  const [status, setStatus] = useState<"loading" | "ready" | "authorizing" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const tokenClientRef = useRef<any>(null);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "917746573259-kdmeuhf2oe3us7fmgiqc0bcvojb0qt1o.apps.googleusercontent.com";

  const triggerGoogleSignIn = () => {
    if (tokenClientRef.current) {
      setStatus("authorizing");
      try {
        tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "Failed to launch Google Sign-In.");
      }
    }
  };

  useEffect(() => {
    let checkInterval: NodeJS.Timeout;
    let attempts = 0;

    const handleGoogleToken = async (accessToken: string) => {
      setStatus("loading");
      try {
        const res = await apiFetch<any>("/api/v1/customers/auth/google/", {
          method: "POST",
          tenantHost: `${tenant}.localhost:3000`,
          body: JSON.stringify({ access_token: accessToken }),
        });

        const customer = res?.customer || res;
        setStatus("success");

        if (returnTo) {
          const targetUrl = new URL(returnTo);
          const rawJson = JSON.stringify(customer);
          const encoded = btoa(encodeURIComponent(rawJson));
          targetUrl.searchParams.set("auth_session", encoded);
          window.location.replace(targetUrl.toString());
          return;
        }

        if (window.opener) {
          window.opener.postMessage({ type: "GOOGLE_AUTH_SUCCESS", customer }, "*");
          setTimeout(() => window.close(), 300);
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "Failed to complete customer authentication.");
      }
    };

    const initClient = () => {
      const google = (window as any).google;
      if (google?.accounts?.oauth2) {
        clearInterval(checkInterval);
        try {
          const client = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: "email profile openid",
            callback: (response: any) => {
              if (response?.error) {
                const msg = response.error_description || response.error;
                setStatus("error");
                setErrorMessage(msg);
                return;
              }

              if (response?.access_token) {
                handleGoogleToken(response.access_token);
              }
            },
            error_callback: (err: any) => {
              const msg = err?.message || "Google authorization error";
              setStatus("error");
              setErrorMessage(msg);
            },
          });

          tokenClientRef.current = client;
          setStatus("ready");
          // Prompt account selector directly in place
          client.requestAccessToken({ prompt: "select_account" });
        } catch (e: any) {
          setStatus("error");
          setErrorMessage(e.message || "Failed to initialize Google client.");
        }
        return true;
      }
      return false;
    };

    if (!initClient()) {
      checkInterval = setInterval(() => {
        attempts++;
        if (initClient() || attempts > 20) {
          clearInterval(checkInterval);
          if (attempts > 20 && !tokenClientRef.current) {
            setStatus("error");
            setErrorMessage("Google Identity Services script timed out. Please check your network or ad blocker.");
          }
        }
      }, 200);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [clientId, tenant, returnTo]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 max-w-sm w-full shadow-2xl backdrop-blur-md">
        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-5 shadow-lg">
          <svg className="w-7 h-7" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        </div>

        <h1 className="text-lg font-bold text-slate-100">Sign in with Google</h1>
        <p className="text-xs text-slate-400 mt-1.5 mb-6">
          Authenticating securely for <span className="font-semibold text-slate-200 uppercase">{tenant}</span> rentals.
        </p>

        {status === "loading" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-7 h-7 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400">Verifying credentials with Google...</span>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-7 h-7 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-emerald-300 font-semibold">Redirecting to your account...</span>
          </div>
        )}

        {(status === "ready" || status === "authorizing") && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={triggerGoogleSignIn}
              className="w-full h-11 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Click to choose Google Account</span>
            </button>
            <p className="text-[11px] text-slate-400">
              The Google popup should open automatically. Click above if it was blocked.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-3">
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-xs text-left">
              <strong className="block font-bold mb-0.5">Authorization Notice:</strong>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={triggerGoogleSignIn}
              className="w-full h-10 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GoogleAuthBridgePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <GoogleAuthBridgeContent />
    </Suspense>
  );
}
