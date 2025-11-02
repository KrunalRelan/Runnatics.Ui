import { useAuthStore } from "./stores/auth.store";

function RegisterForm() {
  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    try {
      await register({
        email: "newuser@example.com",
        password: "SecurePass123",
        name: "John Doe",
      });
      // Success! User is registered and logged in
      navigate("/");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <button onClick={handleRegister} disabled={isLoading}>
      Create Account
    </button>
  );
}
