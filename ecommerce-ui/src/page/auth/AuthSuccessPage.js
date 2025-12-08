import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { userSlide } from "../../store/user/userSlide";
import { message, Spin } from "antd";
import { getCurrentUser } from "../../api/auth";
import APIBase from "../../api/ApiBase";

/**
 * OAuth2 Success Page
 * Handles Google OAuth2 login callback
 * Extracts tokens from URL, saves them, fetches user info, and updates Redux state
 */
function AuthSuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const processOAuthCallback = async () => {
            try {
                // Extract tokens from URL immediately
                const accessToken = searchParams.get("access");
                const refreshToken = searchParams.get("refresh");

                // Clear URL parameters IMMEDIATELY for security (before any processing)
                window.history.replaceState({}, document.title, "/auth/success");

                if (!accessToken || !refreshToken) {
                    console.error("[OAuth2] Missing tokens in URL");
                    setError("Authentication failed: Missing tokens");
                    message.error("Authentication failed: Missing tokens");
                    setTimeout(() => navigate("/login"), 2000);
                    return;
                }

                // Save tokens to localStorage
                console.log("[OAuth2] Saving tokens to localStorage");
                window.localStorage.setItem("AUTH_TOKEN", accessToken);
                window.localStorage.setItem("REFRESH_TOKEN", refreshToken);

                // Verify tokens were saved
                const savedAccess = window.localStorage.getItem("AUTH_TOKEN");
                const savedRefresh = window.localStorage.getItem("REFRESH_TOKEN");

                if (savedAccess !== accessToken || savedRefresh !== refreshToken) {
                    console.error("[OAuth2] Failed to save tokens");
                    setError("Failed to save authentication tokens");
                    message.error("Failed to save authentication tokens");
                    setTimeout(() => navigate("/login"), 2000);
                    return;
                }

                console.log("[OAuth2] ✓ Tokens saved successfully");

                // Fetch user info to update Redux state
                console.log("[OAuth2] Fetching user information...");
                try {
                    const userData = await getCurrentUser();
                    console.log("[OAuth2] ✓ User data received:", userData?.id);

                    // Normalize roles (ensure format: [{name: "USER"}, {name: "ADMIN"}])
                    // CRITICAL: Ensure roles are always in format [{name: "ADMIN"}, {name: "USER"}]
                    let normalizedRoles = [];
                    if (userData?.account?.roles && Array.isArray(userData.account.roles)) {
                        const normalizedRoleNames = userData.account.roles
                            .map((r) => {
                                const roleName = r?.name || r;
                                return (roleName || "")
                                    .toUpperCase()
                                    .replace(/^ROLE_/, "");
                            })
                            .filter(Boolean);
                        normalizedRoles = normalizedRoleNames.map((name) => ({ name }));
                    }

                    // Update Redux state with user data
                    dispatch(userSlide.actions.create({
                        ...userData,
                        account: {
                            ...userData.account,
                            roles: normalizedRoles
                        }
                    }));

                    console.log("[OAuth2] ✓ Redux state updated");
                    console.log("[OAuth2] User roles:", normalizedRoles);

                    // Determine redirect path based on user role
                    const isAdmin = normalizedRoles.some(role => role.name === "ADMIN");
                    const redirectPath = isAdmin ? "/admin" : "/home";

                    message.success("Login successful!");
                    setLoading(false);

                    // Redirect after short delay
                    setTimeout(() => {
                        navigate(redirectPath);
                    }, 500);
                } catch (userError) {
                    console.error("[OAuth2] Failed to fetch user info:", userError);
                    // Even if user fetch fails, tokens are saved, so redirect to home
                    message.warning("Login successful, but failed to load user details. Please refresh.");
                    setLoading(false);
                    setTimeout(() => {
                        navigate("/home");
                    }, 1500);
                }
            } catch (err) {
                console.error("[OAuth2] Unexpected error:", err);
                setError(err.message || "An unexpected error occurred");
                message.error("Authentication failed. Please try again.");
                setTimeout(() => navigate("/login"), 2000);
            }
        };

        processOAuthCallback();
    }, [searchParams, navigate, dispatch]);

    if (error) {
        return (
            <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                height: "100vh",
                flexDirection: "column"
            }}>
                <h2 style={{ color: "#ff4d4f" }}>Authentication Error</h2>
                <p>{error}</p>
                <p style={{ color: "#999", fontSize: "14px" }}>Redirecting to login...</p>
            </div>
        );
    }

    return (
        <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            height: "100vh",
            flexDirection: "column",
            gap: "20px"
        }}>
            <Spin size="large" />
            <div style={{ textAlign: "center" }}>
                <h2>Completing login...</h2>
                <p style={{ color: "#666" }}>Please wait while we finish setting up your account.</p>
            </div>
        </div>
    );
}

export default AuthSuccessPage;

