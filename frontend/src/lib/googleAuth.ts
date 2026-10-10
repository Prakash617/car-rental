import { apiFetch } from "@/lib/api";

export interface CustomerAuthData {
  id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  phone?: string;
  driver_license_number?: string;
  is_verified?: boolean;
  country?: string;
  created_at?: string;
}

export async function authenticateWithGoogleToken(tokenOrProfile: {
  access_token?: string;
  id_token?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  google_id?: string;
  phone?: string;
}): Promise<CustomerAuthData> {
  const res = await apiFetch<any>("/api/v1/customers/auth/google/", {
    method: "POST",
    body: JSON.stringify(tokenOrProfile),
  });

  const customer = (res?.customer || res) as CustomerAuthData;
  if (!customer || !customer.id) {
    throw new Error("Invalid response from Google authentication server.");
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("apex_customer_auth", JSON.stringify(customer));
    localStorage.removeItem("apex_user_logged_out");
    window.dispatchEvent(new Event("apex_customer_auth_changed"));
  }

  return customer;
}

export function triggerGoogleOAuth({
  onSuccess,
  onError,
  onFallback,
  setLoading,
}: {
  onSuccess: (customer: CustomerAuthData) => void;
  onError: (error: string) => void;
  onFallback: () => void;
  setLoading?: (loading: boolean) => void;
}) {
  if (typeof window === "undefined") return;

  const hostname = window.location.hostname.toLowerCase();
  const isSubdomain =
    hostname.endsWith(".localhost") &&
    hostname !== "localhost" &&
    hostname !== "admin.localhost";

  // When on a tenant subdomain (*.localhost), Google Cloud Console strictly forbids
  // registering subdomains of localhost. We navigate the current tab smoothly to
  // the central origin http://localhost:3000/auth/google (authorized in Google Console).
  // This guarantees EXACTLY ONE popup window (Google's official account chooser).
  if (isSubdomain) {
    const tenant = hostname.split(".")[0];
    const returnTo = window.location.href;
    const centralPort = window.location.port ? `:${window.location.port}` : "";
    window.location.href = `http://localhost${centralPort}/auth/google?tenant=${tenant}&return_to=${encodeURIComponent(returnTo)}`;
    return;
  }

  // When directly on localhost:3000, trigger Google Identity Services directly in place
  if ((window as any).google?.accounts?.oauth2) {
    try {
      const clientId =
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        "917746573259-kdmeuhf2oe3us7fmgiqc0bcvojb0qt1o.apps.googleusercontent.com";

      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "email profile openid",
        callback: async (tokenResponse: any) => {
          if (tokenResponse?.error) {
            onError(tokenResponse.error_description || tokenResponse.error || "Google authentication was cancelled.");
            return;
          }

          if (tokenResponse?.access_token) {
            setLoading?.(true);
            try {
              const customer = await authenticateWithGoogleToken({
                access_token: tokenResponse.access_token,
              });
              onSuccess(customer);
            } catch (err: any) {
              onError(err.message || "Failed to authenticate with Google.");
            } finally {
              setLoading?.(false);
            }
          }
        },
        error_callback: (err: any) => {
          onError(err?.message || "Google authorization error. Please try again.");
        },
      });

      client.requestAccessToken({ prompt: "select_account" });
      return;
    } catch (e: any) {
      onError(e.message || "Failed to open Google Sign-In.");
      return;
    }
  }

  onFallback();
}
