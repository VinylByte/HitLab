import {Accordion, AccordionItem} from "@heroui/accordion";
import { useState } from "react";
import HeaderNav from "./components/elements/header/Header";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { Pages } from "./components/pages/Settings";

type Themes = "light" | "dark";

function App() {
  const [theme,] = useState<Themes>("light");

  return (
    <main className={theme}>
      <Router />
    </main>
  )
}

function Layout() {
  return (
    <div>
      <HeaderNav />
      {/* Hier wird die jeweilige Seite "hineingeladen" */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};
    


function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {
            Pages.map((page) => (
              <Route key={page.to} path={page.to} element={page.page} />
            ))
          }
        </Route>
        <Route path="/login" element={<div>LOGIN</div>} />
        <Route path="/signup" element={<div>SIGN UP</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
