"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { useState, createContext, useContext, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CheckSquare,
  Key,
  FileSpreadsheet,
  Settings,
  Home,
  X,
  Lock,
  Menu,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

// --- Definição dos Itens de Navegação ---
const navItems = [
  { title: "Início", href: "/", icon: <Home className="h-5 w-5" /> },
  { title: "Base de Conhecimento", href: "/base-conhecimento", icon: <BookOpen className="h-5 w-5" /> },
  { title: "Pendências", href: "/pendencias", icon: <CheckSquare className="h-5 w-5" /> },
  { title: "Acessos", href: "/acessos", icon: <Key className="h-5 w-5" /> },
  { title: "SPEDs", href: "https://eprosyssped.vercel.app/", icon: <FileSpreadsheet className="h-5 w-5" />, external: true },
  { title: "Configuração", href: "/configuracao", icon: <Settings className="h-5 w-5" /> },
];

// --- Contexto do Sidebar (da sua base) ---
interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

// --- Componente Principal do Sidebar ---
export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {isMobile ? <MobileSidebar /> : <DesktopSidebar />}
    </SidebarContext.Provider>
  );
}

// --- Sidebar para Desktop ---
const DesktopSidebar = () => {
  const { open, setOpen } = useSidebar();
  const pathname = usePathname();

  return (
    <motion.div
      className="h-full hidden md:flex flex-col border-r bg-gray-100/50 dark:bg-gray-900/50 transition-shadow duration-300"
      animate={{ width: open ? "256px" : "72px" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <SidebarHeader open={open} />
      <nav className="flex-1 px-3 py-4 space-y-2">
        {navItems.map((item) => (
          <SidebarLink key={item.title} link={item} isActive={pathname === item.href} />
        ))}
      </nav>
      <SidebarFooter open={open} />
    </motion.div>
  );
};

// --- Sidebar para Mobile ---
const MobileSidebar = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="md:hidden flex items-center justify-between px-4 h-14 border-b bg-gray-100/50 dark:bg-gray-900/50">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <span className="text-gray-800 dark:text-gray-200">E-PROSYS</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 h-full w-full bg-white dark:bg-gray-950 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
               <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                 <BarChart3 className="h-6 w-6 text-blue-600" />
                 <span>E-PROSYS</span>
               </Link>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => (
                <SidebarLink key={item.title} link={item} isActive={pathname === item.href} isMobile={true} />
              ))}
            </nav>
            <SidebarFooter open={true} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Componentes Internos do Sidebar ---
const SidebarHeader = ({ open }: { open: boolean }) => (
  <div className="flex items-center justify-center h-16 border-b">
    <motion.div
      initial={false}
      animate={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }}
      transition={{ duration: 0.2 }}
    >
      <Link href="/" className={cn("flex items-center gap-2 font-bold text-lg whitespace-nowrap", !open && "hidden")}>
        <BarChart3 className="h-6 w-6 text-blue-600 flex-shrink-0" />
        <span className="text-gray-800 dark:text-gray-200">E-PROSYS</span>
      </Link>
    </motion.div>
    <AnimatePresence>
      {!open && (
        <motion.div initial={{ opacity: 0}} animate={{ opacity: 1}} exit={{ opacity: 0}}>
           <BarChart3 className="h-7 w-7 text-blue-600" />
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const SidebarLink = ({ link, isActive, isMobile = false }: { link: (typeof navItems)[0]; isActive: boolean; isMobile?: boolean; }) => {
  const { open } = useContext(SidebarContext)!;
  const commonClasses = "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 transition-all duration-200";
  const activeClasses = "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold";
  const hoverClasses = "hover:bg-gray-200 dark:hover:bg-gray-800";

  const content = (
    <>
      {link.icon}
      <AnimatePresence>
        {(open || isMobile) && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="whitespace-nowrap"
          >
            {link.title}
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={cn(commonClasses, hoverClasses)}>
        {content}
      </a>
    );
  }

  return (
    <Link href={link.href} className={cn(commonClasses, isActive ? activeClasses : hoverClasses)}>
      {content}
    </Link>
  );
};

const SidebarFooter = ({ open }: { open: boolean }) => {
  const [dailyPassword, setDailyPassword] = useState("");

  useEffect(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const dateNumber = parseInt(`${day}${month}`);
    const password = (Math.floor(dateNumber / 8369 * 10000) % 10000).toString();
    setDailyPassword(password);
  }, []);

  return (
    <div className="p-3 border-t">
       <AnimatePresence>
        {(open) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500">E-PROSYS v2.0.0</span>
                  <div onMouseEnter={(e) => e.stopPropagation()}>
                    <ModeToggle />
                  </div>
              </div>
              <Separator className="mb-4" />
              <div className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                  <Lock className="h-5 w-5 text-blue-600" />
                  <div>
                      <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">Senha diária</div>
                      <div className="text-lg font-bold text-blue-800 dark:text-blue-200">{dailyPassword}</div>
                  </div>
              </div>
            </motion.div>
        )}
       </AnimatePresence>
    </div>
  );
};

// Hook para verificar se está em ambiente mobile (para evitar erros de SSR)
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);
    return isMobile;
}
