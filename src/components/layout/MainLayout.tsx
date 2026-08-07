import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <img src="/logo-full.png" alt="DeLAPLAK" className="mx-auto mb-3 h-8 w-auto" />
        © {new Date().getFullYear()} <span className="font-semibold text-foreground">DeLAPLAK</span> — PVC Decorative Wall Panels
      </footer>
    </div>
  );
};
