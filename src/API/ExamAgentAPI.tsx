import { InstanceAdapter } from "../models/InstanceAdapter";
import { InstanceMetricsContent } from "../components/Instance/InstanceMetrics";

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

const getInstances = async (): Promise<InstanceMetricsContent[]> => {

  const API_URL = "https://exercise.crownlabs.polito.it/api/instances/";

  return getInstanceAdapter(fetch(API_URL)).then( json => {
    return json.map( (e: InstanceAdapter) => { 
      let labels = new Map(Object.entries(e.labels));
      return {
        running: e.running,
        submitted: labels.get("crownlabs.polito.it/instance-submission-completed") || false,
        instanceUID: ( e.url != null && e.url.split('/').at(-3) ) || "unknown",
        instMetricsHost: ( e.url != null && e.url.split('//')[1] ) || "unknown",
        resourcesHistory: [],
        studentName: "",
        studentId: labels.get("crownlabs.qtype.moodle.org/matricola") || "none",
      } as InstanceMetricsContent })
  })
}

export { getInstances }