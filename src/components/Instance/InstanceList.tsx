import { useState, useEffect } from 'react';
import { getFakeResources } from "../../API/fakeResources";
import InstanceMetrics, { InstaceMetricsContent } from "./InstanceMetrics"
import "./InstanceList.css"

const InstanceList = () => {
  // Map<instanceUID, InstanceMetricsContent>
  const [instanceMap, setInstanceMap] = useState<Map<string, InstaceMetricsContent>>(new Map<string, InstaceMetricsContent>());
  const [fakeMapIndex, setFakeMapIndex] = useState(0);

  useEffect(() => {
    let newInstanceMap = new Map(instanceMap);

    newInstanceMap = newInstanceMap.set("inst-asdasdas", { 
      instanceUID: "inst-asdasdas",
      resourcesHisory: [],
      studentName: "Guido Ricioppo",
      studentId: "s279127",
      instMetricsHost: "192.168.122.251:6080"
    } as InstaceMetricsContent);

    newInstanceMap = newInstanceMap.set("inst-asdda2s", { 
      instanceUID: "inst-asdda2s",
      resourcesHisory: [],
      studentName: "Petre Ricioppo",
      studentId: "s283341"
    } as InstaceMetricsContent);
      
    let fr1 = getFakeResources(fakeMapIndex%30);
    let fr2 = getFakeResources(29- fakeMapIndex%30);
    console.log(fr1, fr2);
    newInstanceMap.get("inst-asdasdas")!.resourcesHisory.push(JSON.parse(fr1));
    if(newInstanceMap.get("inst-asdasdas")!.resourcesHisory.length > 10) {
      newInstanceMap.get("inst-asdasdas")!.resourcesHisory.shift();
    };

    newInstanceMap.get("inst-asdda2s")!.resourcesHisory.push(JSON.parse(fr2));
    if(newInstanceMap.get("inst-asdda2s")!.resourcesHisory.length > 10) {
      newInstanceMap.get("inst-asdda2s")!.resourcesHisory.shift();
    };
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
    setTimeout(() => {
      let index = fakeMapIndex + 1;
      let newInstanceMap = new Map(instanceMap);
      let fr1 = getFakeResources(fakeMapIndex%30);
      let fr2 = getFakeResources(29- fakeMapIndex%30);
      console.log(fr1, fr2);
      newInstanceMap.get("inst-asdasdas")!.resourcesHisory.push(JSON.parse(fr1));
      if(newInstanceMap.get("inst-asdasdas")!.resourcesHisory.length > 10) {
        newInstanceMap.get("inst-asdasdas")!.resourcesHisory.shift();
      };

      newInstanceMap.get("inst-asdda2s")!.resourcesHisory.push(JSON.parse(fr2));
      if(newInstanceMap.get("inst-asdda2s")!.resourcesHisory.length > 10) {
        newInstanceMap.get("inst-asdda2s")!.resourcesHisory.shift();
      };
      setFakeMapIndex(index);
      setInstanceMap(newInstanceMap); 
    }, 3000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceMap]);

  return (
    <>
      {Array.from(instanceMap.values()).map((imc: InstaceMetricsContent) => < InstanceMetrics key={imc.instanceUID} {...imc} />)}
    </>
  );
}

export default InstanceList;