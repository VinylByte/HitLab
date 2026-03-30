import HeaderNav from "../components/elements/Header";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import { Pages, ProtectedPages } from "./routes";
import LoginPage from "../components/pages/LoginPage";
//import { FooterSocial } from "./components/elements/Footer/Footer";
import { useSession } from "../hooks/useSession";
import { useAppTheme } from "../hooks/useAppTheme";
import Error404Page from "../components/pages/404ErrorPage/404ErrorPage";
import GeneralPlayPage from "../components/pages/PlayPage/GeneralPlayPage";
import { Loader } from "../components/elements/PageLoader";
import { useEffect } from "react";

function App() {
    useAppTheme(); // Initialize theme hook

    return (
        <main style={{ height: "100%", width: "100%" }}>
            <Router />
        </main>
    );
}

function RouteUiGuards() {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });

        // Defensive reset in case a previous page locked global scrolling.
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
    }, [location.pathname, location.search]);

    return null;
}

function Layout() {
    return (
        <div>
            <HeaderNav />
            {/* Hier wird die jeweilige Seite "hineingeladen" */}
            <div>
                <Outlet />
            </div>
            {/* <FooterSocial /> */}
        </div>
    );
}

/**
 * Wrapper that requires authentication.
 * Shows a loader while the session is resolving.
 * Redirects to /login when no session exists.
 */
function ProtectedRoute() {
    const session = useSession();
    const location = useLocation();

    if (session === undefined) {
        return (
            <Loader />
        );
    }

    if (session === null) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}

function Router() {
    return (
        <BrowserRouter>
            <RouteUiGuards />
            <Routes>
                <Route element={<Layout />}>
                    {Pages.map(page => (
                        <Route key={page.to} path={page.to} element={page.page} />
                    ))}
                    <Route path="/play/:currentTrackId" element={<GeneralPlayPage />} />
                    <Route element={<ProtectedRoute />}>
                        {ProtectedPages.map(page => (
                            <Route key={page.to} path={page.to} element={page.page} />
                        ))}
                    </Route>
                    {/* Fallback-Route für alle nicht definierten Pfade, aber mit Header und Footer */}
                    <Route path="*" element={<Error404Page />} />
                </Route>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
