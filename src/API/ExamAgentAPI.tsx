import { InstanceAdapter } from "../models/InstanceAdapter";
import { InstanceMetricsContent } from "../components/Instances/InstanceList";

const getInstanceAdapter = async (httpResponsePromise: Promise<any>): Promise<any> => {
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response: { ok: any; json: () => Promise<any>; }) => {
        if (response.ok) {
         // always return {} from server, never null or non json, otherwise it will fail
         response.json()
            .then( json => resolve(json) )
            .catch( (err: string) => reject({ error: "Cannot parse server response: " + err }))

        } else {
          // analyze the cause of error
          response.json()
            .then((obj: any) => reject(obj)) // error msg in the response body
            .catch((err: any) => reject({ error: "Cannot parse server response" })) // something else
        }
      })
      .catch((err: any) => reject({ error: "Cannot communicate"  })) // connection error
  });
}

// getInstances returns a Promise of a InstanceMetricsContent list where each element
// contains all the instance information useful for the dashboard
const getInstances = async (): Promise<InstanceMetricsContent[]> => {
  let API_URL = "https://cldashboard.guidongui.it/api/instances/";
  // let API_URL = `${process.env.PUBLIC_URL}/api/instances/`;
  if(window.codIns !== null && window.quizID !== null) 
    API_URL += `?crownlabs.qtype.moodle.org/quizid=${window.quizID}&crownlabs.qtype.moodle.org/codins=${window.codIns}`;

  return getInstanceAdapter(fetch(API_URL)).then( json => {
    return json.map( (e: InstanceAdapter) => { 
      let labels = new Map(Object.entries(e.labels));
      return {
        running: e.running,
        phase: ( e.phase != null && e.phase ) || "unknown",
        submitted: labels.get("crownlabs.polito.it/instance-submission-completed") || false,
        instanceUID: ( e.id != null && e.id ) || "unknown",
        instMetricsHost: ( e.url != null && e.url.split('//')[1] ) || "unknown",
        resourcesHistory: [],
        studentName: undefined,
        studentId: labels.get("crownlabs.qtype.moodle.org/matricola") || undefined,
        quizID: labels.get("crownlabs.qtype.moodle.org/quizid") || undefined,
        codIns: labels.get("crownlabs.qtype.moodle.org/codins") || undefined,
      } as InstanceMetricsContent })
  })
}

export { getInstances }
