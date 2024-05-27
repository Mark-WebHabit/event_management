import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import InputGroup from "../components/InputGroup";
import FormButton from "../components/FormButton";
import ErrorModal from "../components/ErrorModal.jsx";

import { app, db } from "../app/firebase.js";
import {
  fetchSignInMethodsForEmail,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { ref, get } from "firebase/database";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const auth = getAuth(app);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      setError("All fields required.");
      return;
    }

    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred?.user;

      if (!user.emailVerified) {
        await signOut(auth);
        setError("Please verify your email to login.");
        setLoading(false);
        return;
      }

      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        await signOut(auth);
        setError("Forbidden User");
        setLoading(false);
        return;
      }

      const role = snapshot.val();

      if (role.role == "admin") {
        navigate("/admin");
      } else if (role.role == "student") {
        navigate("student");
      }
    } catch (error) {
      let errorMessage = error.message;
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        errorMessage = "Invalid Email or Password";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const closeErrorModal = () => {
    setError("");
  };

  return (
    <LoginContainer>
      <FormContainer>
        <Logo src="/logo.png" alt="School Logo" />
        <Title>Login</Title>
        <Form onSubmit={handleSubmit}>
          <InputGroup
            type="text"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            icon={FaUser}
          />
          <InputGroup
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            icon={FaLock}
          />
          <FormButton type="submit" loading={loading}>
            {loading ? "Loading..." : "Login"}
          </FormButton>
        </Form>
        <LinksContainer>
          <StyledLink to="/register">Create account</StyledLink>
        </LinksContainer>
      </FormContainer>
      {error && <ErrorModal message={error} onClose={closeErrorModal} />}
    </LoginContainer>
  );
};

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f4f4f4;
`;

const FormContainer = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;

  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const Logo = styled.img`
  width: 100px;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const LinksContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: center;
`;

const StyledLink = styled(Link)`
  color: #007bff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export default Login;
