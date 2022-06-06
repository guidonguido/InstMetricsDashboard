import { useState, useEffect } from 'react';
import { getFakeResources } from "../../API/fakeResources";
import InstanceMetrics, { InstaceMetricsContent } from "./InstanceMetrics"

const InstanceList = () => {
  // Map<instanceUID, InstanceMetricsContent>
  const [instanceMap, setInstanceMap] = useState<Map<string, InstaceMetricsContent>>(new Map<string, InstaceMetricsContent>());
  const [fakeMapIndex, setFakeMapIndex] = useState(0);
  const [isStateInitialized, setIsStateInitialized] = useState(false);

  useEffect(() => {
    let newInstanceMap = new Map(instanceMap);

    newInstanceMap = newInstanceMap.set("inst-asdasdas", { 
      instanceUID: "inst-asdasdas",
      resourcesHistory: [],
      studentName: "Guido Ricioppo",
      studentId: "s279127",
    } as InstaceMetricsContent);

    newInstanceMap = newInstanceMap.set("inst-asdda2s", { 
      instanceUID: "inst-asdda2s",
      resourcesHistory: [],
      studentName: "Petre Ricioppo",
      studentId: "s283341",
      instMetricsHost: "192.168.122.251:6080"
    } as InstaceMetricsContent);

    setInstanceMap(newInstanceMap);
  
    /** 
    if ( newInstanceMap.has("inst-asdasdas") ) {
      newInstanceMap.get("inst-asdasdas")!.resourcesHisory.push(resList[0]);
      if(newInstanceMap.get("inst-asdda2s")!.resourcesHisory.length > 10) {
        newInstanceMap.get("inst-asdda2s")!.resourcesHisory.shift();
      }
    } else {
      newInstanceMap = newInstanceMap.set("inst-asdasdas", { 
        instanceUID: "inst-asdasdas",
        resourcesHisory: [resList[0]],
        studentName: "Guido Ricioppo",
        studentId: "s279127",
      } as InnstaceMetricsContent);
    }

    if ( newInstanceMap.has("inst-asdda2s") ) {
      newInstanceMap.get("inst-asdda2s")!.resourcesHisory.push(resList[2]);
      if(newInstanceMap.get("inst-asdda2s")!.resourcesHisory.length > 10) {
        newInstanceMap.get("inst-asdda2s")!.resourcesHisory.shift();
      }
    } else {
      newInstanceMap = newInstanceMap.set("inst-asdda2s", { 
        instanceUID: "inst-asdda2s",
        resourcesHisory: [],
        studentName: "Petre Ricioppo",
        studentId: "s283341",
      } as InnstaceMetricsContent);
    }*/

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect( () => {

    if( instanceMap.has("inst-asdda2s") && !isStateInitialized ) {
      /* Setup WS connection(s) */
      const updatePeriod = 2; // seconds
      const url = `ws://${instanceMap.get("inst-asdda2s")!.instMetricsHost}/usages?updatePeriod=${updatePeriod}`;
      const ws = new WebSocket(url);
      
      setIsStateInitialized(true);

      //WebSocket management
      ws.onopen = () => {
        console.log(`WebSocket connected: ${ws.url}`);
      }
      
      ws.onerror = (error) => {
        console.log(`WebSocket error: ${error}`);
      }
      
      ws.onmessage = (e) => {
        try {
          console.log(`WebSocket message: ${e.data.toString()}`);

          setInstanceMap( (oldIM) => {
            const newIM = new Map(oldIM);
            newIM.get("inst-asdda2s")!.resourcesHistory.push(JSON.parse(e.data.toString()));
            if( newIM.get("inst-asdda2s")!.resourcesHistory.length > 10 )  newIM.get("inst-asdda2s")!.resourcesHistory.shift();
            return newIM;
          })
          setFakeMapIndex((oldIndex) => oldIndex+1);
        } catch (error) {
          console.log(`WebSocket onmessage error: ${error}`);
        }
      }
    }
  }, [instanceMap, isStateInitialized])

  useEffect( () => {
    if( isStateInitialized ){
      let newInstanceMap = new Map(instanceMap);
      let fr1 = getFakeResources(fakeMapIndex%30);
      // let fr2 = getFakeResources(29- fakeMapIndex%30);
      console.log(fr1);
      newInstanceMap.get("inst-asdasdas")!.resourcesHistory.push(JSON.parse(fr1));
      if(newInstanceMap.get("inst-asdasdas")!.resourcesHistory.length > 10) {
        newInstanceMap.get("inst-asdasdas")!.resourcesHistory.shift();
      };

      // newInstanceMap.get("inst-asdda2s")!.resourcesHisory.push(JSON.parse(fr2));
      // if(newInstanceMap.get("inst-asdda2s")!.resourcesHisory.length > 10) {
      //   newInstanceMap.get("inst-asdda2s")!.resourcesHisory.shift();
      // };
      setInstanceMap(newInstanceMap);
    } 
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fakeMapIndex, isStateInitialized]);

  return (
    <>
      {Array.from(instanceMap.values()).map((imc: InstaceMetricsContent) => < InstanceMetrics key={imc.instanceUID} {...imc} />)}
    </>
  );
}

export default InstanceList;