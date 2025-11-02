import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "../src/main/src/theme";
//"./theme/ThemeProvider";
import DashboardLayout from "../src/main/src/components/DashboardLayout";
import routes from "./Routes";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <DashboardLayout>
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/events/events-dashboard" replace />}
            />
            {routes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element}>
                {route.children?.map((child, childIndex) => (
                  <Route
                    key={childIndex}
                    path={child.path}
                    element={child.element}
                  />
                ))}
              </Route>
            ))}
          </Routes>
        </DashboardLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
