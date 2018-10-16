import hdOAuth from "../lib/oauth.js";
import fhir from "fhir.js";
import { FHIR_CLIENT_ID, FHIR_REDIRECT_URI } from "../credentials.js";
import {
  getFHIRData,
  FHIR_GET_DATA,
  FHIR_LOAD_SAMPLE_DATA
} from "./fhir-data.js";
import axios from "axios";

/***** Actions *****/
const FHIR_SMART_INITIALIZE = "FHIR/SMART_INITIALIZE";

const FHIR_GET_METADATA = "FHIR/GET_METADATA";
const FHIR_GET_METADATA_FAILED = "FHIR/GET_METADATA_FAILED";
const FHIR_GET_METADATA_SUCCEEDED = "FHIR/GET_METADATA_SUCCEEDED";

const FHIR_GET_ACCESS_TOKEN = "FHIR/GET_ACCESS_TOKEN";
const FHIR_ACCESS_TOKEN_RECEIVED = "FHIR/ACCESS_TOKEN_RECEIVED";

const FHIR_ERROR = "FHIR/ERROR";

// Used to set the basic SMART/FHIR properties.
const FHIR_SET_ISSUER = "FHIR/SET_ISSUER";

// Sent if the redirection page was loaded and no existing
// session was found.
// const FHIR_SESSION_NOT_FOUND = 'FHIR_SESSION_NOT_FOUND';

/***** Reducers *****/
const defaultFhirAuthState = {
  credentials: { clientId: FHIR_CLIENT_ID, redirectURI: FHIR_REDIRECT_URI },
  isFetching: false,
  iss: null,
  launch: null,
  authorizeUrl: null,
  tokenUrl: null,
  userFriendlyStatus: "Waiting...",

  // This is set to instruct the launch component to redirect the user to the Token URI.
  redirectToTokenUri: false,

  error: null,
  accessToken: null,
  patientId: null,

  // Reference to the initialized FHIR.js client.
  client: null
};

export function fhirAuthReducer(state = defaultFhirAuthState, action) {
  switch (action.type) {
    case FHIR_LOAD_SAMPLE_DATA:
      return { ...state, accessToken: { dummy: true } };

    case FHIR_SMART_INITIALIZE:
      return {
        ...state,
        iss: action.iss,
        launch: action.launch,
        userFriendlyStatus: "Initializing..."
      };

    case FHIR_SET_ISSUER:
      return { ...state, iss: action.iss };

    case FHIR_ERROR:
      return {
        ...state,
        error: { code: action.code, description: action.description }
      };

    case FHIR_GET_METADATA:
      return {
        ...state,
        isFetching: true,
        accessToken: null,
        userFriendlyStatus: "Fetching metadata..."
      };

    case FHIR_GET_METADATA_SUCCEEDED:
      return {
        ...state,
        isFetching: false,
        authorizeUrl: action.authorizeUrl,
        tokenUrl: action.tokenUrl,
        redirectToTokenUri: true,
        userFriendlyStatus: "Redirecting...",
        accessToken: null,
        error: null
      };

    case FHIR_GET_METADATA_FAILED:
      return { ...state, isFetching: false, error: action.error };

    case FHIR_GET_ACCESS_TOKEN:
      return state;
    // return state.set("isFetching", true)
    //   .set("accessToken", null)
    //   .set("userFriendlyStatus", "Fetching metadata...");

    case FHIR_ACCESS_TOKEN_RECEIVED:
      // console.log(action.tokenResponsePayload);
      let response = action.tokenResponsePayload;
      let config = {
        baseUrl: state.iss,
        auth: { bearer: response.accessToken }
      };
      let client = fhir(config);

      return {
        ...state,
        isFetching: false,
        userFriendlyStatus: "Access token received...",
        error: null,
        patientId: response.data.patient,
        client: client,
        accessToken: { expires: response.expires, data: response.data }
      };

    case FHIR_GET_DATA:
      return { ...state, userFriendlyStatus: "Getting data..." };

    default:
      return state;
  }
}

/***** Action Creators *****/
export const initializeSmart = (iss, launch) => dispatch => {
  dispatch({ type: FHIR_SMART_INITIALIZE, iss, launch });
  dispatch(fhirGetMetadata(iss));
};
// const fhirError = (message) => ({ type: FHIR_ERROR, message });

const fhirGetMetadata = iss => (dispatch, getState) => {
  dispatch({ type: FHIR_GET_METADATA, iss });

  axios
    .get(`${iss}/metadata`)
    .then(response => {
      // Get the authorize and token URLs.
      // TODO: Add error checking.
      let conformance = response.data;
      let secExtensions = conformance.rest[0].security.extension.find(
        ext =>
          ext.url ===
          "http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris"
      ).extension;
      let authorizeExt = secExtensions.find(ext => ext.url === "authorize");
      let tokenExt = secExtensions.find(ext => ext.url === "token");

      // Find out the EHR.
      if (
        conformance.software &&
        conformance.software.name &&
        conformance.software.name === "Fnd 2018"
      ) {
        window.sessionStorage.setItem("ehr", "Epic");
      } else {
        window.sessionStorage.setItem("ehr", "Unknown");
      }

      dispatch(
        fhirGetMetadataSucceeded(authorizeExt.valueUri, tokenExt.valueUri)
      );
    })
    .catch(error => {
      dispatch(fhirGetMetadataFailed(error.toString()));
    });
};
const fhirGetMetadataSucceeded = (authorizeUrl, tokenUrl) => ({
  type: FHIR_GET_METADATA_SUCCEEDED,
  authorizeUrl,
  tokenUrl
});
const fhirGetMetadataFailed = error => ({
  type: FHIR_GET_METADATA_FAILED,
  error
});

const setIssuer = iss => ({ type: FHIR_SET_ISSUER, iss });

export const getAccessToken = uri => (dispatch, getState) => {
  dispatch({ type: FHIR_GET_ACCESS_TOKEN, uri });

  let oauth = new hdOAuth();
  let accessTokenPromise = oauth.getAccessToken(uri);

  if (accessTokenPromise === null) {
    dispatch(
      fhirError("FHIR_AT_1", "Could not request token, missing FHIR session.")
    );
    return;
  }

  accessTokenPromise.then(response => {
    dispatch(setIssuer(oauth.iss));
    dispatch(accessTokenReceived(response));
    dispatch(getFHIRData("patient"));
    setTimeout(() => {
      dispatch(getFHIRData("conditions"));
    }, 100);
    setTimeout(() => {
      dispatch(getFHIRData("familyMemberHistories"));
    }, 200);
    // dispatch(getFHIRData("patient"));
    // dispatch(getFHIRData("conditions"));
    // dispatch(getFHIRData("familyMemberHistories"));
    // dispatch(getFHIRData("observations"));
  });

  // TODO: handle errors?
  // .catch((err) => {
  //   // TODO: Properly handle this.
  //   console.log(err);
  //   console.log("error!");
  // });
};
const accessTokenReceived = tokenResponsePayload => ({
  type: FHIR_ACCESS_TOKEN_RECEIVED,
  tokenResponsePayload
});

// Used to signify an error.
const fhirError = (code, description) => ({
  type: FHIR_ERROR,
  code,
  description
});
