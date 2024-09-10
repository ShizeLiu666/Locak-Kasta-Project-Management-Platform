import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import { Form, FormGroup, Input, Button, Label } from "reactstrap";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./LoginPage.css";
import kastaLogo from "../../assets/images/logos/kasta_logo.png";
import CreateAccountModal from "./CreateAccountModal"; // 引入 CreateAccountModal 组件

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [alert, setAlert] = useState({
    severity: "",
    message: "",
    open: false,
  });
  const [isCreatingAccount, setIsCreatingAccount] = useState(false); // 用于控制显示注册表单
  const navigate = useNavigate();

  useEffect(() => {
    setUsername("");
    setPassword("");
  }, []);

  const handleLogin = async () => {
    try {
      const response = await axios.post("/api/users/login", {
        username,
        password,
      });

      if (response.data && response.data.success) {
        const token = response.data.data.token;
        if (rememberMe) {
          localStorage.setItem("authToken", token);
        } else {
          sessionStorage.setItem("authToken", token);
        }

        setAlert({
          severity: "success",
          message: "Login successful! Redirecting...",
          open: true,
        });

        setTimeout(() => {
          setAlert({ open: false });
          navigate("/admin/projects");
        }, 1000);
      } else {
        setAlert({
          severity: "error",
          message: response.data.errorMsg || "Login failed. Please try again.",
          open: true,
        });

        setTimeout(() => {
          setAlert({ open: false });
        }, 3000);
      }
    } catch (error) {
      setAlert({
        severity: "error",
        message: "There was an error logging in. Please try again.",
        open: true,
      });

      setTimeout(() => {
        setAlert({ open: false });
      }, 3000);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCreateAccountClick = () => {
    setIsCreatingAccount(true); // 切换到创建账号表单
  };

  return (
    <section className="h-100 gradient-form">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-xl-10">
            <div className="card rounded-3 text-black">
              <div className="row g-0">
                {/* 左半边 */}
                <div className="col-lg-6">
                  <div className="card-body p-md-5 mx-md-4">
                    <div className="text-center">
                      <img
                        src={kastaLogo}
                        className="logo-margin-bottom"
                        style={{ width: "150px" }}
                        alt="logo"
                      />
                      <h4 className="mt-1 mb-5 pb-1 custom-title">
                        Project Management Platform
                      </h4>
                    </div>

                    {alert.open && (
                      <Alert
                        severity={alert.severity}
                        style={{
                          position: "fixed",
                          top: 0,
                          left: "50%",
                          transform: "translateX(-50%)",
                          zIndex: 9999,
                        }}
                      >
                        {alert.message}
                      </Alert>
                    )}

                    {/* 这里根据 isCreatingAccount 的值决定显示登录表单还是注册表单 */}
                    {isCreatingAccount ? (
                      <CreateAccountModal />
                    ) : (
                      <div className="form-container">
                        <Form onSubmit={(e) => e.preventDefault()}>
                          <FormGroup className="mb-4">
                            <Input
                              type="text"
                              id="username"
                              name="username"
                              placeholder="Username"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              autoComplete="off"
                              required
                            />
                          </FormGroup>

                          <FormGroup
                            className="mb-4"
                            style={{ position: "relative" }}
                          >
                            <Input
                              type={showPassword ? "text" : "password"}
                              id="password"
                              name="password"
                              placeholder="Password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              autoComplete="new-password"
                              required
                            />
                            <span
                              onClick={togglePasswordVisibility}
                              style={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                cursor: "pointer",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={showPassword ? faEyeSlash : faEye}
                                style={{ color: "#68696a" }}
                              />
                            </span>
                          </FormGroup>

                          <FormGroup className="d-flex justify-content-between align-items-center mb-4">
                            <Label check className="text-dark">
                              <Input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                                style={{
                                  backgroundColor: rememberMe
                                    ? "#fbcd0b"
                                    : "white",
                                  border: "none",
                                }}
                              />{" "}
                              Remember Me
                            </Label>
                            <botton
                              className="text-primary"
                              style={{
                                border: "none",
                                background: "transparent",
                              }}
                            >
                              Forgot Password?
                            </botton>
                          </FormGroup>

                          <div className="text-center pt-1 mb-2 pb-0 move-down">
                            <Button
                              className="btn-block fa-lg mb-3 login-button"
                              style={{
                                backgroundColor: "#fbcd0b",
                                borderColor: "#fbcd0b",
                                fontWeight: "bold",
                              }}
                              type="submit"
                              onClick={handleLogin}
                            >
                              Log in
                            </Button>
                          </div>

                          <div className="d-flex justify-content-center align-items-center mb-2">
                            <p className="mb-0">New Member?</p>
                            <button
                              className="text-primary ms-1" // 减少 margin-left 的值，保持适当的间距
                              onClick={handleCreateAccountClick}
                              style={{
                                display: "inline-block",
                                textDecoration: "none",
                                fontSize: "1rem",
                                border: "none",
                                background: "transparent",
                              }}
                            >
                              Create an account
                            </button>
                          </div>
                        </Form>
                      </div>
                    )}
                  </div>
                </div>

                {/* 右半边不动 */}
                <div className="col-lg-6 d-flex align-items-center gradient-custom-2">
                  <div className="text-gradient">
                    <h4 className="mb-4">Living Enhanced</h4>
                    <p className="small mb-0">
                      KASTA offers smart control solutions with products
                      designed in Australia. Our seamless integration and
                      modular form ensure connectivity and scalability,
                      enhancing lifestyles with tailored applications
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
