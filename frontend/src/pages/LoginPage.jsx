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
        <div className="xl:flex md:flex justify-center items-center h-screen bg-blue-gray-50 sm:grid ">
      <Card className="xl:w-1/4 xl:h-2/4 md:w-1/3 md:h-4/5 rounded-xl rounded-r-none sm:w-full h-screen bg-white shadow-2xl relative">
        <CardBody className="flex flex-col  gap-4 2xl:scale-90 2xl:text-2xl -mt-5 justify-center items-center h-full">
          {/* <img src={logo} alt="avatar" className="w-2/4 justify-center items-center" /> */}
          <h1 className="text-black text-xl font-sans font-bold text-center flex justify-center">
            {/* {t("LOGINPAGE.LOGINPAGE")} */}
          </h1>
        </CardBody>

        {/* Language Selector: Positioned at the bottom */}
        <div className="absolute bottom-0 left-1  flex justify-center  text-center mb-1 2xl:ml-5  w-fit">
          {/* <Select
            // label={
            //   (amharic && "ቋንቋ") ||
            //   (english && "language") ||
            //   (oromoo && "afaan")
            // }
            variant="standard"
            color="blue"
            className="w-2/4"
          >
            <Option onClick={handleAmharic} className="focus:text-light-blue-700">
              አማርኛ
            </Option>
            <Option onClick={handleEnglish} className="focus:text-light-blue-700">
              English
            </Option>
          </Select> */}
        </div>
      </Card>

      <Card className="xl:w-1/4 xl:h-2/4  md:w-1/3 md:h-4/5 rounded-md rounded-l-none sm:w-full sm:h-full bg-indigo-700 shadow-2xl">
        <CardBody className="flex  2xl:scale-90 flex-col gap-5 h-screen justify-center">
          {/* <img src="../../tree.png" alt="avatar" className="relative h-full object-cover  justify-start items-start" /> */}
          <div className="absolute left-0 top-0 h-full w-full scale-110 bg-cover bg-no-repeat bg-center transform -rotate-6 opacity-10"
            style={{ backgroundImage: "url('../../tree.png')" }}>
          </div>

          <div>
            <h1 className="text-3xl text-center text-gray-100 font-bold font-sans ">
              {/* {t("LOGINPAGE.LOGIN")} */}
            </h1>
            {/* <p className="text-center text-gray-100 font-sans ">{t("LOGINPAGE.SIGNIN")}</p> */}
          </div>
          <form onSubmit={handleSubmit}>

            <div className="flex flex-col gap-3">
              <Input
                type="text"
                label="EMAIL"
                id="Username"
                size="lg"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                color="white"
              />
              <div className="relative mt-2">
                <Input
                  type={view ? "text" : "password"}
                  id="Password"
                  label="PASSWORD"
                  size="lg"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  color="white"
                />

                {view ? (
                  <div>
                    <FontAwesomeIcon
                      icon={faEye}
                      onClick={() => setView(false)}
                      className="absolute right-2 top-1/4 text-center cursor-pointer"
                    />
                  </div>
                ) : (
                  <div>
                    <FontAwesomeIcon
                      icon={faEyeSlash}
                      onClick={() => setView(true)}
                      className="absolute right-2 top-1/4 text-center cursor-pointer"
                    />
                  </div>
                )}
              </div>
              <h1 className="text-purple-50 font-sans font-bold">
                {errorMessage ? "Email or password Invalid" : undefined}
              </h1>

              <Button
                type="submit"
                size="md"
                className=" w-full hover:bg-blue-600 text-white bg-orange-600 normal-case z-50"
                onClick={handleSubmit}
              >
                "LOGIN"
              </Button>

              <Typography
                as="a"
                onClick={() => navigate("/ForgetPassword")}
                variant="small"
                className="ml-1 text-gray-100 cursor-pointer text-center font-bold underline decoration-light-blue-700 z-50"
              >
                {/* {t("LOGINPAGE.FORGETPASSWORD")} */}
              </Typography>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
    );
};

export default LoginPage;
