import React, { Component } from "react";
import { connect } from "react-redux";
import { getAccessToken } from "modules/fhir-auth.js";
import { toggleExampleVisibility } from "modules/fhir-data.js";
import { Icon, Step, Table, Checkbox, Loader } from "semantic-ui-react";

const mapStateToProps = (state, ownProps) => ({
  fhirAuth: state.fhirAuth,
  fhirData: state.fhirData
});
const mapDispatchToProps = dispatch => ({
  getAccessToken: uri => dispatch(getAccessToken(uri)),
  toggleExampleVisibility: exampleKey =>
    dispatch(toggleExampleVisibility(exampleKey))
});

class Grid extends Component {
  render() {
    return (
      <React.Fragment>
        <Step.Group size="mini" fluid>
          <Step completed={this.props.fhirAuth.accessToken !== null}>
            <Icon name="address card" />
            <Step.Content>
              <Step.Title>Get Access Token</Step.Title>
              <Step.Description>
                {this.props.fhirAuth.accessToken === null
                  ? "Retrieving..."
                  : "Retrieved"}
              </Step.Description>
            </Step.Content>
          </Step>

          {Object.keys(this.props.fhirData.byResource).map(resourceKey => {
            let resource = this.props.fhirData.byResource[resourceKey];
            return (
              <Step key={resourceKey} completed={resource.status === "loaded"}>
                <Icon name={resource.icon} />
                <Step.Content>
                  <Step.Title>{resource.title}</Step.Title>
                  <Step.Description>
                    {resource.status === "loading" && (
                      <React.Fragment>
                        <Loader size="mini" active inline />
                        &nbsp;Retrieving...
                      </React.Fragment>
                    )}
                    {resource.status === "loaded" && "Retrieved"}
                    {resource.status === "failed" && "Failed"}
                  </Step.Description>
                </Step.Content>
              </Step>
            );
          })}
        </Step.Group>

        {this.props.fhirData.allResourcesLoaded && (
          <React.Fragment>
            <h2>Examples</h2>
            <Table celled definition size="small">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell />
                  <Table.HeaderCell width="four">
                    Application Need
                  </Table.HeaderCell>
                  <Table.HeaderCell>FHIR Data Point</Table.HeaderCell>
                  <Table.HeaderCell>PHI</Table.HeaderCell>
                  <Table.HeaderCell width="four">
                    Possible De-identification
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {Object.keys(this.props.fhirData.examples).map(itemKey => {
                  let item = this.props.fhirData.examples[itemKey];
                  return (
                    <Table.Row key={itemKey}>
                      <Table.Cell collapsing>
                        <Checkbox
                          toggle
                          size="mini"
                          onClick={() =>
                            this.props.toggleExampleVisibility(itemKey)
                          }
                        />
                      </Table.Cell>
                      <Table.Cell>{item.need}</Table.Cell>
                      <Table.Cell>{item.title}</Table.Cell>
                      <Table.Cell>{item.phi}</Table.Cell>
                      <Table.Cell>
                        {item.hidden ? (
                          <React.Fragment>******</React.Fragment>
                        ) : (
                          <React.Fragment>
                            {item.deidentified}
                            {itemKey === "radiation" && (
                              <React.Fragment>
                                <sup style={{ float: "right" }}>
                                  * No Observations within the last 5 years
                                </sup>
                              </React.Fragment>
                            )}
                            {itemKey === "dob" && (
                              <React.Fragment>
                                <sup style={{ float: "right" }}>
                                  * for &gt;=90 assume 90
                                </sup>
                              </React.Fragment>
                            )}
                          </React.Fragment>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Grid);
