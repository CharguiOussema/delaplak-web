import { Modal } from "antd";
import { useAuthModal } from "../../hooks";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

// Rendered once at the app root; opened from the Navbar's "Sign in" button or from any
// protected action (e.g. Checkout) instead of navigating to dedicated /login /signup pages.
export const AuthModal = () => {
  const { isOpen, mode, setMode, close, handleSuccess } = useAuthModal();

  return (
    <Modal open={isOpen} onCancel={close} footer={null} centered width={420} destroyOnClose>
      {mode === "login" ? (
        <LoginForm onSuccess={handleSuccess} onSwitchToSignup={() => setMode("signup")} />
      ) : (
        <SignupForm onSuccess={handleSuccess} onSwitchToLogin={() => setMode("login")} />
      )}
    </Modal>
  );
};
