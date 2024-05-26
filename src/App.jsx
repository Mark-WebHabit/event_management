import { useState } from "react";

import Register from "./views/Register";
import Login from "./views/Login";
import RegisterAdmin from "./views/RegisterAdmin";
import Dashboard from "./views/Dashboard";
// layout
import Auth from "./layout/Auth";
import Admin from "./layout/Admin";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        {/* auth pages */}
        <Route path="/" Component={Auth}>
          <Route path="/" Component={Login} />
          <Route path="login" Component={Login} />
          <Route path="register" Component={Register} />
          <Route path="register-admin" Component={RegisterAdmin} />
        </Route>

        {/* admin pages */}
        <Route path="/admin" Component={Admin}>
          <Route index path="" Component={Dashboard} />
          <Route index path="dashboard" Component={Dashboard} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
