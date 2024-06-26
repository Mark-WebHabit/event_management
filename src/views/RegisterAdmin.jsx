import React, { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaCode } from "react-icons/fa";
import InputGroup from "../components/InputGroup";
import FormButton from "../components/FormButton";

const RegisterAdmin = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    systemCode: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <RegisterContainer>
      <FormContainer>
        <Logo src="/logo.png" alt="School Logo" />
        <Title>Register Admin</Title>
        <Form onSubmit={handleSubmit}>
          <InputGroup
            type="text"
            placeholder="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            icon={FaUser}
          />
          <InputGroup
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            icon={FaEnvelope}
          />
          <InputGroup
            type="number"
            placeholder="System Code"
            name="systemCode"
            value={formData.systemCode}
            onChange={handleChange}
            icon={FaCode}
          />
          <InputGroup
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            icon={FaLock}
          />
          <FormButton type="submit">Register</FormButton>
        </Form>
        <LinksContainer>
          <StyledLink to="/login">I have an account</StyledLink>
        </LinksContainer>
      </FormContainer>
    </RegisterContainer>
  );
};

const RegisterContainer = styled.div`
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
  justify-content: space-between;
`;

const StyledLink = styled(Link)`
  color: #007bff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export default RegisterAdmin;
