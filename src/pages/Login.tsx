import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function getOAuthUrl(): string | null {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  if (!kimiAuthUrl || !appID) {
    console.error("[LOGIN] Missing VITE_KIMI_AUTH_URL or VITE_APP_ID at build time");
    return null;
  }
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  const [configError, setConfigError] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              const url = getOAuthUrl();
              if (url) {
                window.location.href = url;
              } else {
                setConfigError(true);
              }
            }}
          >
            Sign in with Kimi
          </Button>
          {configError && (
            <p className="mt-3 text-center text-sm text-red-600">
              Login is temporarily unavailable — configuration error. Please try again later.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
