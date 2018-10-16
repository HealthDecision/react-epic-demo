import React, { Component } from "react";
import "./App.css";
import { Switch, Route, withRouter } from "react-router-dom";
import { Menu, Button, Container, Message, Divider, Icon } from "semantic-ui-react";
import { loadSampleData } from "modules/fhir-data.js";
import { connect } from "react-redux";

import Redirect from "./Redirect.js";
import Launch from "./Launch.js";
import NotFound from "./NotFound.js";
import Grid from "./Grid.js";

const mapStateToProps = state => ({
  sampleDataLoaded: state.fhirData.sampleDataLoaded,
  credentials: state.fhirAuth.credentials
});
const mapDispatchToProps = dispatch => ({
  loadSampleData: () => dispatch(loadSampleData())
});

class App extends Component {
  render() {
    let credentials = this.props.credentials;

    return (
      <React.Fragment>
        <Menu inverted color="red" attached>
          <Menu.Item header>HealthDecision &ndash; Browser-Based FHIR Integration</Menu.Item>
        </Menu>
        <Container style={{ paddingTop: "10px" }}>
          <Switch>
            <Route
              path="/"
              exact
              render={() => {
                if (this.props.sampleDataLoaded === true) {
                  return (
                    <React.Fragment>
                      <h3>Sample Data</h3>
                      <Grid />
                    </React.Fragment>
                  );
                }

                return (
                  <React.Fragment>
                    <h3>Root URL</h3>
                    <div>
                      {(credentials.clientId === null ||
                        credentials.clientId === "" ||
                        credentials.redirectURI === null ||
                        credentials.redirectURI === "") && (
                        <Message error>
                          <Message.Header>Configuration Error</Message.Header>
                          <ul>
                            {(credentials.clientId === null || credentials.clientId === "") && (
                              <li>clientID is missing.</li>
                            )}
                            {(credentials.redirectURI === null || credentials.redirectURI === "") && (
                              <li>redirectURI is missing.</li>
                            )}
                          </ul>
                          <p>Please set in credentials.js.</p>
                        </Message>
                      )}
                      Note that there is nothing at the root URL. This app must be called from{" "}
                      <a href="https://apporchard.epic.com" target="_blank" rel="noopener noreferrer">
                        Epic App Orchard Simulator
                      </a>{" "}
                      (or Epic Hyperspace) using the SMART launch workflow.
                      <br />
                      <Divider />
                      <Button icon onClick={this.props.loadSampleData} labelPosition="left">
                        <Icon name="microchip" /> Load Sample Data
                      </Button>
                      {/* <a target="_blank" rel="noopener noreferrer"
                      href="https://launch.smarthealthit.org/?auth_error=&fhir_version_1=r2&fhir_version_2=r2&iss=&launch_ehr=1&launch_url=http%3A%2F%2Flocalhost%3A3000%2F%23%2Flaunch&patient=6638c5fe-0e89-442f-a970-2228d61b141c&prov_skip_auth=1&prov_skip_login=1&provider=SMART-1234&pt_skip_auth=1&public_key=&sb=&sde=&sim_ehr=1&token_lifetime=15&user_pt="
                      >Sample</a> */}
                    </div>
                  </React.Fragment>
                );
              }}
            />
            <Route path="/fhir/epic/launch" exact component={Launch} />
            <Route path="/fhir/epic/redirect" exact component={Redirect} />
            <Route path="*" component={NotFound} />
          </Switch>
        </Container>
      </React.Fragment>
    );
  }
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(App)
);
