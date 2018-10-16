import React, { Component } from "react";
import { Button, Icon } from "semantic-ui-react";
import { Link } from "react-router-dom";

export default class NotFound extends Component {
  render() {
    return (
      <React.Fragment>
        <h1>404 - Page not found</h1>
        <pre>{window.location.href}</pre>
        <Button as={Link} to="/">
          <Icon name="home" /> Home
        </Button>
      </React.Fragment>
    );
  }
}
