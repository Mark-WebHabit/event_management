import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { get, ref } from "firebase/database";
import { db, app } from "../app/firebase";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);

        const snapshot = (await get(userRef)).val();

        if (snapshot?.role && snapshot?.role == "admin") {
          navigate("/admin");
        }
      }
    });

    // Clean up the listener to prevent memory leaks
    return () => unsubscribe();
  }, [navigate]);

  return <Outlet />;
};

export default Auth;
