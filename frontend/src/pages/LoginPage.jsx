// src/pages/LoginPage.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // If you're using React Router for navigation
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import {
  Card,
  CardBody,
  Typography,
  Input,
  Button,
  Select,
  Option,
} from "@material-tailwind/react";
import { useTranslation } from "react-i18next";
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [view, setView] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/users/api/login/', {
        username,
        password
      });

      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;

      // Store tokens in localStorage
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);

      // Set Axios default headers for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      navigate('/orders'); // Redirect to requests page
    } catch (err) {
      setError('Invalid credentials, please try again.');
    }
  };


  return (
    <section className="gradient-form h-full bg-neutral-200 dark:bg-neutral-700 flex justify-center items-center min-h-screen">
    <div className="container h-full p-10">
      <div className="flex h-full flex-wrap items-center justify-center text-neutral-800 dark:text-neutral-200">
        <div className="w-full max-w-4xl">
          <div className="block rounded-lg bg-white shadow-lg dark:bg-neutral-800">
            <div className="lg:flex lg:flex-wrap">
              
              {/* Left column container */}
              <div className="px-4 md:px-0 lg:w-6/12">
                <div className="md:mx-6 md:p-12">
                  
                  {/* Logo */}
                  <div className="text-center">
                    <img
                      className="mx-auto w-48"
                      src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/lotus.webp"
                      alt="logo"
                    />
                    <h4 className="mb-12 mt-1 pb-1 text-xl font-semibold">
                      We are The Lotus Team
                    </h4>
                  </div>

                  {/* Login Form */}
                  <form onSubmit={handleSubmit}>
                    <p className="mb-4">Please login to your account</p>

                    {/* Username Input */}
                    <div className="relative mb-4">
                      <input
                        type="text"
                        className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        id="username"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>

                    {/* Password Input */}
                    <div className="relative mb-4">
                      <input
                        type={view ? "text" : "password"}
                        className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        id="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <FontAwesomeIcon
                        icon={view ? faEye : faEyeSlash}
                        onClick={() => setView(!view)}
                        className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="mb-6 text-center">
                      <button
                        className="w-full rounded px-6 py-2 text-white font-medium uppercase shadow-md transition duration-150 ease-in-out"
                        style={{
                          background:
                            "linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)",
                        }}
                        type="submit"
                      >
                        Log in
                      </button>
                    </div>

                    {/* Forgot Password */}
                    <div className="text-center">
                      <a href="#!" className="text-blue-500">Forgot password?</a>
                    </div>

                    {/* Register Button */}
                    <div className="flex items-center justify-between pt-6">
                      <p className="mb-0">Don't have an account?</p>
                      <button
                        type="button"
                        className="rounded border-2 border-red-500 px-4 py-2 text-red-500 transition duration-150 ease-in-out hover:bg-red-500 hover:text-white"
                      >
                        Register
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column with Background */}
              <div
                className="hidden lg:flex items-center justify-center lg:w-6/12 rounded-r-lg"
                style={{
                  background:
                    "linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)",
                }}
              >
                <div className="px-4 py-6 text-white md:mx-6 md:p-12">
                  <h4 className="mb-6 text-xl font-semibold">
                    We are more than just a company
                  </h4>
                  <p className="text-sm">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
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
