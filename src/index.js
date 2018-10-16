import "react-app-polyfill/ie11";
import React from "react";
import ReactDOM from "react-dom";
import "components/index.css";
import "semantic-ui-css/semantic.min.css";
import App from "components/App";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
// import { HashRouter as Router } from 'react-router-dom';
import configureStore from "configureStore";
import * as serviceWorker from "./serviceWorker";

let store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>,
  document.getElementById("root")
);

serviceWorker.unregister();
