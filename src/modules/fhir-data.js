import moment from "moment";

/***** Actions *****/
export const FHIR_GET_DATA = "FHIR/GET_DATA";
const FHIR_GET_DATA_FAILED = "FHIR/GET_DATA_FAILED";
const FHIR_GET_DATA_SUCCEEDED = "FHIR/GET_DATA_SUCCEEDED";
export const FHIR_LOAD_SAMPLE_DATA = "FHIR/LOAD_SAMPLE_DATA";

const TOGGLE_EXAMPLE_VISIBILITY = "TOGGLE_EXAMPLE_VISIBILITY";

const ADD_EXAMPLE_DATA = "ADD_EXAMPLE_DATA";

/***** Reducers *****/
const defaultFhirDataState = {
  byResource: {
    patient: { title: "Patient", status: "", error: null, icon: "male" },
    conditions: {
      title: "Conditions",
      status: "",
      error: null,
      icon: "numbered list"
    },
    // observations: Immutable.Map({title: "Observations", status: "", error: null, icon: "lab"}),
    familyMemberHistories: {
      title: "Family Member History",
      status: "",
      error: null,
      icon: "numbered list"
    }
  },

  sampleDataLoaded: false,

  allResourcesLoaded: false,

  // This will contain data as
  //    {phi: "", deidentified: "", title: "MRN", need: "Medical Record Number", hidden: true}
  examples: {
    // mrn: {phi: "s123", deidentified: "123123", title: "MRN", hidden: true},
    // dob: {phi: "asdasdsa", deidentified: "123123", title: "Date of Birth", hidden: true}
  }
};

export function fhirDataReducer(state = defaultFhirDataState, action) {
  switch (action.type) {
    case FHIR_LOAD_SAMPLE_DATA:
      return {
        ...state,
        sampleDataLoaded: true,
        allResourcesLoaded: true,
        byResource: {
          patient: {
            ...state.byResource.patient,
            status: "loaded",
            error: null
          },
          conditions: {
            ...state.byResource.conditions,
            status: "loaded",
            error: null
          },
          familyMemberHistories: {
            ...state.byResource.familyMemberHistories,
            status: "loaded",
            error: null
          }
        },
        examples: {
          gender: {
            need: "Gender",
            title: "Gender",
            phi: "male",
            deidentified: "male",
            hidden: true
          },
          dob: {
            need: "Age",
            title: "Date of Birth",
            phi: moment()
              .subtract(48, "years")
              .format("YYYY-MM-DD"),
            deidentified: "48 year old",
            hidden: true
          },
          mrn: {
            need: "Unique key",
            title: "Medical Record Number",
            phi: "E83833",
            deidentified: 'May be possible with "Expert Determination" method',
            hidden: true
          },
          hdl: {
            need: "HDL within the last six months",
            title: "HDL Observation",
            phi:
              "38 mg/dL measured on " +
              moment()
                .subtract(2, "months")
                .format("YYYY-MM-DD"),
            deidentified: "38 mg/dL",
            hidden: true
          },
          radiation: {
            need: "Past chest radiation?",
            title: "Radiation",
            phi:
              "Chest radiation on " +
              moment()
                .subtract(9, "years")
                .format("YYYY-MM-DD"),
            deidentified: "No",
            hidden: true
          },
          diabetes: {
            need: "Is diabetic?",
            title: "Diabetes Condition",
            phi:
              "Type 1 diabetes mellitus (CMS/HCC) with onset date 2010-08-17",
            deidentified: "Has diabetes, ignore the onset date",
            hidden: true
          }
        }
      };

    case FHIR_GET_DATA:
      return {
        ...state,
        allResourcesLoaded: false,
        byResource: {
          ...state.byResource,
          [action.resourceType]: {
            ...state.byResource[action.resourceType],
            error: null,
            status: "loading"
          }
        }
      };

    case FHIR_GET_DATA_FAILED:
      return {
        ...state,
        byResource: {
          ...state.byResource,
          [action.resourceType]: {
            ...state.byResource[action.resourceType],
            error: action.error,
            status: "failed"
          }
        }
      };

    case FHIR_GET_DATA_SUCCEEDED:
      let allResourcesLoaded = !Object.keys(state.byResource).some(
        resourceType => {
          return resourceType === action.resourceType
            ? false
            : state.byResource[resourceType].status !== "loaded";
        }
      );
      return {
        ...state,
        allResourcesLoaded: allResourcesLoaded,
        byResource: {
          ...state.byResource,
          [action.resourceType]: {
            ...state.byResource[action.resourceType],
            error: null,
            status: "loaded"
          }
        }
      };

    case ADD_EXAMPLE_DATA:
      let info = {
        need: action.need,
        title: action.title,
        phi: action.phi,
        deidentified: action.deidentified,
        hidden: true
      };
      return {
        ...state,
        examples: { ...state.examples, [action.key]: info }
      };

    case TOGGLE_EXAMPLE_VISIBILITY:
      return {
        ...state,
        examples: {
          ...state.examples,
          [action.exampleKey]: {
            ...state.examples[action.exampleKey],
            hidden: !state.examples[action.exampleKey].hidden
          }
        }
      };

    default:
      return state;
  }
}

/***** Action Creators *****/
const getFHIRDataFailed = resourceType => ({
  type: FHIR_GET_DATA_FAILED,
  resourceType
});
const getFHIRDataSucceeded = (resourceType, response) => ({
  type: FHIR_GET_DATA_SUCCEEDED,
  resourceType,
  response
});

export const loadSampleData = () => dispatch => {
  dispatch({ type: FHIR_LOAD_SAMPLE_DATA });
};

export const toggleExampleVisibility = exampleKey => ({
  type: TOGGLE_EXAMPLE_VISIBILITY,
  exampleKey
});

export const addExampleData = (key, need, title, phi, deidentified) => ({
  type: ADD_EXAMPLE_DATA,
  key,
  need,
  phi,
  deidentified,
  title
});

export const getFHIRData = resourceType => (dispatch, getState) => {
  dispatch({ type: FHIR_GET_DATA, resourceType });

  let state = getState();
  let patientId = state.fhirAuth.patientId;
  let client = state.fhirAuth.client;

  if (resourceType === "patient") {
    client
      .read({ type: "Patient", id: patientId })
      .then(response => {
        // Calculate age
        let today = new Date();
        let dob = response.data.birthDate;
        let birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        if (age >= 90) {
          age = "Greater than 90";
        } else {
          age = age + " year old";
        }

        dispatch(
          addExampleData(
            "gender",
            "Gender",
            "Gender",
            response.data.gender,
            response.data.gender
          )
        );
        dispatch(
          addExampleData(
            "dob",
            "Age",
            "Date of Birth",
            response.data.birthDate,
            age
          )
        );
        dispatch(
          addExampleData(
            "mrn",
            "Unique key",
            "MRN",
            response.data.identifier.find(
              element =>
                element.system ===
                "urn:oid:1.2.840.114350.1.13.0.1.7.5.737384.0"
            ).value,
            'May be possible with "Expert Determination" method'
          )
        );
        dispatch(
          addExampleData(
            "hdl",
            "HDL within the last six months",
            "HDL Observation",
            "38 mg/dL measured on " +
              moment()
                .subtract(2, "months")
                .format("YYYY-MM-DD"),
            "38 mg/dL"
          )
        );
        dispatch(
          addExampleData(
            "radiation",
            "Past chest radiation?",
            "Radiation",
            "Chest radiation on " +
              moment()
                .subtract(9, "years")
                .format("YYYY-MM-DD"),
            "No"
          )
        );
        dispatch(getFHIRDataSucceeded(resourceType, response));
      })
      .catch(err => {
        console.log("Error!");
        console.log(err);
        dispatch(getFHIRDataFailed(resourceType));
      });
  } else if (
    resourceType === "conditions" ||
    resourceType === "observations" ||
    resourceType === "familyMemberHistories"
  ) {
    let typeMap = {
      conditions: "Condition",
      observations: "Observation",
      familyMemberHistories: "FamilyMemberHistory"
    };
    client
      .search({ type: typeMap[resourceType], patient: patientId })
      .then(response => {
        // For conditions, check diabetes
        if (resourceType === "conditions") {
          let diabetes = response.data.entry.find(
            element =>
              typeof element.resource.code.coding.find(
                code =>
                  code.system === "http://snomed.info/sct" &&
                  code.code === "46635009"
              ) !== "undefined"
          );
          // console.log(diabetes);
          if (diabetes !== null) {
            dispatch(
              addExampleData(
                "diabetes",
                "Is diabetic?",
                "Diabetes Condition",
                diabetes.resource.code.text +
                  " with onset date " +
                  diabetes.resource.onsetDateTime,
                "Has diabetes, ignore the onset date"
              )
            );
            dispatch(getFHIRDataSucceeded(resourceType, response));
          } else {
            dispatch(getFHIRDataSucceeded(resourceType, response));
          }
        } else {
          dispatch(getFHIRDataSucceeded(resourceType, response));
        }
      })
      .catch(err => {
        console.log("Error!");
        console.log(err);
        return dispatch(getFHIRDataFailed(resourceType));
      });
  } else {
    alert("Unexpected resource type requested '" + resourceType + "'.");
    return dispatch(getFHIRDataFailed(resourceType));
  }
};
