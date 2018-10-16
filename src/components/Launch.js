import React, { Component } from "react";
import { connect } from "react-redux";
import { initializeSmart } from "modules/fhir-auth.js";
import qs from "qs";
import hdOAuth from "lib/oauth.js";
import { Loader } from "semantic-ui-react";

const mapStateToProps = (state, ownProps) => ({
  fhirAuth: state.fhirAuth
});
const mapDispatchToProps = dispatch => ({
  initializeSmart: (iss, launch) => dispatch(initializeSmart(iss, launch))
});

class Launch extends Component {
  componentDidMount() {
    // Get the issuer from the URL.
    let querystring = qs.parse(window.location.search.slice(1));
    if (typeof querystring.iss === "undefined") {
      alert("Issuer not specified. Aborting.");
      window.location = "/";
      return;
    }

    if (typeof querystring.launch === "undefined") {
      alert("Launch code not specified. Aborting.");
      window.location = "/";
      return;
    }

    this.props.initializeSmart(querystring.iss, querystring.launch);
  }

  render() {
    // Redirect to the token URI if appropriate.
    let fhirAuth = this.props.fhirAuth;
    if (fhirAuth.redirectToTokenUri === true) {
      let oauth = new hdOAuth();
      oauth.setProps(
        fhirAuth.iss,
        fhirAuth.launch,
        fhirAuth.authorizeUrl,
        fhirAuth.tokenUrl
      );
      window.location = oauth.getTokenRedirectUri();
    }

    if (fhirAuth.error !== null) {
      return <div>Error: {fhirAuth.error}</div>;
    }

    return (
      <Loader active inline="centered">
        {this.props.fhirAuth.userFriendlyStatus}
      </Loader>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Launch);
