import HeaderNav from "./components/elements/header/Header";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { Pages, ProtectedPages } from "./components/pages/Settings";
import LoginPage from "./components/pages/LoginPage";
//import SignUpPage from "./components/pages/Authentication/SignUpPage";
import { FooterSocial } from "./components/elements/Footer/Footer";
import { useSession } from "./hooks/useSession";
import { useAppTheme } from "./hooks/useAppTheme";
import { Center, Loader } from "@mantine/core";
import Error404Page from "./components/pages/404ErrorPage/404ErrorPage";


function App() {
    useAppTheme(); // Initialize theme hook

    return (
        <main style={{ height: "100%", width: "100%" }}>
            <Router />
        </main>
    );
}

function Layout() {
    return (
        <div>
            <HeaderNav />
            {/* Hier wird die jeweilige Seite "hineingeladen" */}
            <div>
                <Outlet />
            </div>
            <FooterSocial />
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

    if (session === undefined) {
        return (
            <Center style={{ height: "100vh" }}>
                <Loader size="lg" />
            </Center>
        );
    }

    if (session === null) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    {Pages.map(page => (
                        <Route
                            key={page.to}
                            path={page.to}
                            element={page.page}
                        />
                    ))}
                    <Route element={<ProtectedRoute />}>
                        {ProtectedPages.map(page => (
                            <Route
                                key={page.to}
                                path={page.to}
                                element={page.page}
                            />
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
