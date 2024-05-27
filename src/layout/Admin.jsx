import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { get, ref } from "firebase/database";
import { app, db } from "../app/firebase.js";

import { handleSetEvents } from "../app/features/eventSlice";

// slices
import { setUser } from "../app/features/userSlice.js";

// dummy data
import { events } from "../../events";

const Admin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);

        const snapshot = (await get(userRef)).val();

        if (snapshot?.role != "admin") {
          navigate("/student");
        } else {
          dispatch(setUser({ email: user.email, uid: user.uid }));
        }
      } else {
        navigate("/login");
        await signOut(auth);
      }
    });

    // Clean up the listener to prevent memory leaks
    return () => unsubscribe();
  }, [navigate]);

  // initialize the events state for all admin pages
  useEffect(() => {
    dispatch(handleSetEvents(events));
  }, []);

  return (
    <Container>
      <AdminHeader />
      <Wrapper className="adminWrapper">
        <Outlet />
      </Wrapper>
    </Container>
  );
};

export default Admin;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Wrapper = styled.div`
  &.adminWrapper {
    flex: 1;
    display: flex;

    & > div {
      flex: 1;
    }
  }
`;
