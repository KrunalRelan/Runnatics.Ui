import { useAuthStore } from "../../components/auth/stores";

function LoginForm() {
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login({
        email: "user@example.com",
        password: "password123",
        rememberMe: true,
      });
      // Success! User is now authenticated
      navigate("/dashboard");
    } catch (error) {
      // Error is automatically set in store
      console.error("Login failed:", error);
    }
  };

  return (
    <button onClick={handleLogin} disabled={isLoading}>
      {isLoading ? "Signing in..." : "Sign in"}
    </button>
  );
}
