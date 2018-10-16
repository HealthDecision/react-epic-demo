import { combineReducers } from "redux";
import { fhirAuthReducer } from "modules/fhir-auth.js";
import { fhirDataReducer } from "modules/fhir-data.js";

const rootReducer = combineReducers({
  fhirAuth: fhirAuthReducer,
  fhirData: fhirDataReducer
});

export default rootReducer;
