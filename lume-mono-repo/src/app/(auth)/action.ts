import { toast } from "sonner";
import { authClient } from "./auth-client";

export const handleSignIn = async () => {
    try {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/explore",
            // errorCallbackURL: "/error",
            // newUserCallbackURL: "/welcome",
            // disableRedirect: true,
        });
        toast.success("Sign in successful! Redirecting...");
    } catch (error) {
        console.error("Sign in failed:", error);
    }
};
