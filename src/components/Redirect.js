import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { getAccessToken } from "modules/fhir-auth.js";
import { toggleExampleVisibility } from "modules/fhir-data.js";
import { Icon, Message, Divider, Button, Container } from "semantic-ui-react";
import Grid from "./Grid.js";

const mapStateToProps = (state, ownProps) => ({
  fhirAuth: state.fhirAuth,
  fhirData: state.fhirData
});
const mapDispatchToProps = dispatch => ({
  getAccessToken: uri => dispatch(getAccessToken(uri)),
  toggleExampleVisibility: exampleKey =>
    dispatch(toggleExampleVisibility(exampleKey))
});

class Redirect extends Component {
  componentDidMount() {
    this.props.getAccessToken(window.location.href);
  }

  render() {
    let fhirAuth = this.props.fhirAuth;

    if (fhirAuth.error !== null) {
      return (
        <Container style={{ paddingTop: "10px" }}>
          <Message negative icon>
            <Icon name="warning sign" />
            <Message.Content>
              <Message.Header>Error</Message.Header>
              <div>{fhirAuth.error.description}</div>
              <Divider />
              <Button basic as={Link} size="small" to="/">
                &lt; Home
              </Button>
            </Message.Content>
          </Message>
        </Container>
      );
    }

    return <Grid />;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Redirect);
