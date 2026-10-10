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

  const width = 500;
  const height = 650;
  const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
  const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);

  const port = window.location.port ? `:${window.location.port}` : "";
  // Central origin that matches the Google Cloud Console Authorized JavaScript origins
  const centralOrigin = `http://localhost${port}`;
  const popupUrl = `${centralOrigin}/auth/google`;

  let popup: Window | null = null;
  try {
    popup = window.open(
      popupUrl,
      "google_oauth_bridge",
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
    );
  } catch (e) {
    console.warn("Popup blocked or failed:", e);
  }

  if (!popup || popup.closed) {
    // Popup was blocked by browser or failed, fallback to modal
    onFallback();
    return;
  }

  setLoading?.(true);

  const handleMessage = async (event: MessageEvent) => {
    // Only accept messages from our trusted central origin
    if (
      event.origin !== centralOrigin &&
      !event.origin.includes("localhost")
    ) {
      return;
    }

    if (event.data?.type === "GOOGLE_AUTH_SUCCESS" && event.data?.access_token) {
      window.removeEventListener("message", handleMessage);
      clearInterval(timer);
      try {
        const customer = await authenticateWithGoogleToken({
          access_token: event.data.access_token,
        });
        onSuccess(customer);
      } catch (err: any) {
        onError(err.message || "Failed to authenticate with Google.");
      } finally {
        setLoading?.(false);
      }
    } else if (event.data?.type === "GOOGLE_AUTH_ERROR") {
      window.removeEventListener("message", handleMessage);
      clearInterval(timer);
      setLoading?.(false);
      onError(event.data?.error || "Google authentication failed.");
    }
  };

  window.addEventListener("message", handleMessage);

  // Poll for popup closing without sending message
  const timer = setInterval(() => {
    if (popup && popup.closed) {
      clearInterval(timer);
      window.removeEventListener("message", handleMessage);
      setLoading?.(false);
    }
  }, 1000);
}
