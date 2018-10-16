# Sample React App for the 2018 Epic App Orchard Presentation

This respository contains a simple demo [React](https://reactjs.org/) application to access SMART/FHIR-based data from the Epic App Orchard.  This demo was used by [Farhan Ahmad](http://github.com/thebitguru) ([HealthDecision](https://www.healthdecision.com)) during his presentation titled "App Architecture to Reassure CSOs: SPAs in React" at the [2018 Epic App Orchard Conference](https://apporchard.epic.com/Conference).

To keep the demo simple, some values are hard coded after retrieving the actual FHIR resources.  In addition to the actual workflow, the code also contains some dummy data that can used without an actual EHR.

![Screenshot with Sample Data](/Screenshot.png)

## Running the app from Epic App Orchard

1. Clone the repository
2. Install the needed modules (assumes you already have yarn installed): `yarn install`
3. Add your app credentials to `credentials.js`
4. Run using yarn: `yarn start`.  If you need to run HTTPS then use the `start-https` task which depends on `sudo` and will require your administrator password: `yarn start-https`.  You can now browse the sample data at [http://localhost:3000](http://localhost:3000) or continue to the next step.
5. Launch from [Epic App Orchard Simulator](https://apporchard.epic.com).  The launch URL will be `https://YOUR_HOST_NAME/fhir/epic/launch`


#### Disclaimer: The goal of this code was to show a simple approach to getting data using SMART/FHIR. Not much energy was devoted to error handling and oauth/security, so both of these will need a lot of attention if planning for production use.