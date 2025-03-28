import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store"; // Correct path to the store
import App from "./App"; // Correct path to the App component

const rootElement = document.getElementById("root");
ReactDOM.createRoot(rootElement).render(
  <Provider store={store}>
    <App />
  </Provider>
);
