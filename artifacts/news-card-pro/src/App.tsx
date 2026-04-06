import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { AuthGuard } from "./components/layout/AuthGuard";
import { AppLayout } from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Generate from "./pages/Generate";
import History from "./pages/History";
import Templates from "./pages/Templates";
import Keys from "./pages/Keys";
import Admin from "./pages/Admin";
import TelegramBot from "./pages/TelegramBot";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <AuthGuard>
      <AppLayout>
        <Component />
      </AppLayout>
    </AuthGuard>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/generate">
        <AuthGuard>
          <Generate />
        </AuthGuard>
      </Route>
      <Route path="/history"><ProtectedRoute component={History} /></Route>
      <Route path="/templates"><ProtectedRoute component={Templates} /></Route>
      <Route path="/keys"><ProtectedRoute component={Keys} /></Route>
      <Route path="/telegram"><ProtectedRoute component={TelegramBot} /></Route>
      <Route path="/admin" component={Admin} />
      
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
