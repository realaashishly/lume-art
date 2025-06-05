import { authClient } from "@/app/(auth)/auth-client";
import { toast } from "sonner";

export const handleSignIn = async () => {
    try {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/dashboard",
            // errorCallbackURL: "/error",
            // newUserCallbackURL: "/welcome",
            // disableRedirect: true,
        });
        toast.success("Sign in successful! Redirecting...");
    } catch (error) {
        console.error("Sign in failed:", error);
    }
};
