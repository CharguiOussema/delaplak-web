import { useContext } from "react";
import { AuthModalContext } from "../contexts/AuthModalContext";

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
};
