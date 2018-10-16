import ClientOAuth2 from "client-oauth2";
import qs from "qs";
import uuid from "uuid/v4";
import { FHIR_CLIENT_ID, FHIR_REDIRECT_URI } from "../credentials.js";

let instance = null;

// This class encapsulates the OAuth functionality.
export default class hdOAuth {
  constructor() {
    if (instance) {
      return instance;
    }

    this.scopes = ["launch", "openid profile", "patient/*.read"];
    this.redirectUri = FHIR_REDIRECT_URI;
    this.clientId = FHIR_CLIENT_ID;
    instance = this;
  }

  // Sets the given properties on this object and saves it in the session storage.
  setProps(iss, launch, authorizeUrl, tokenUrl) {
    this.iss = iss;
    this.launch = launch;
    this.authorizeUrl = authorizeUrl;
    this.tokenUrl = tokenUrl;
    this.state = uuid();

    this.oauth = new ClientOAuth2({
      clientId: this.clientId,
      authorizationUri: authorizeUrl,
      accessTokenUri: tokenUrl,
      redirectUri: this.redirectUri,
      state: this.state,
      scopes: this.scopes
    });

    // Save the parameters in session storage
    let stateToSave = JSON.stringify({ iss, authorizeUrl, tokenUrl });
    window.sessionStorage.setItem(this.state, stateToSave);
  }

  getTokenRedirectUri() {
    let uri = this.oauth.code.getUri({
      query: { aud: this.iss, launch: this.launch }
    });
    return uri;
  }

  // Initializes the request to get a token. This will return a null if the expected data
  // is not found in the session storage.  Otherwise, it will return a promise that will
  // return the access token.
  getAccessToken(uri) {
    let querystring = qs.parse(uri);
    let params = window.sessionStorage.getItem(querystring.state);
    if (params === null) {
      return null;
    }
    params = JSON.parse(params);
    window.sessionStorage.removeItem(querystring.state);
    this.iss = params.iss;
    this.authorizeUrl = params.authorizeUrl;
    this.tokenUrl = params.tokenUrl;

    this.oauth = new ClientOAuth2({
      clientId: this.clientId,
      authorizationUri: this.authorizeUrl,
      accessTokenUri: this.tokenUrl,
      redirectUri: this.redirectUri,
      scopes: this.scopes
    });

    return this.oauth.code.getToken(uri);
  }
}
