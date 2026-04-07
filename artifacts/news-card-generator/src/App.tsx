import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";

function App() {
  const [showTool, setShowTool] = useState(false);
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  if (showTool) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowTool(false)}
          className="fixed top-3 start-3 z-50 flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-600 rounded-xl text-sm text-slate-300 transition-colors backdrop-blur-sm shadow-lg"
        >
          ←{" "}
          {i18n.language === "ar"
            ? "الرئيسية"
            : i18n.language === "fr"
            ? "Accueil"
            : "Home"}
        </button>
        <Home />
      </div>
    );
  }

  return <Landing onOpenTool={() => setShowTool(true)} />;
}

export default App;
