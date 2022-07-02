import { FC, useEffect, useState } from "react";
import { getLabelFromIP } from "../../global/argument";

interface ConnectedFromContent {
  ip: string;
}

export const ConnectedFrom: FC<ConnectedFromContent> = (props) => {
  const [IPCountry, setIPCountry] = useState<string>("");
  const [IPCity, setIPCity] = useState<string>("");

  useEffect(() => {
    const getGeoInfo = () => {
      fetch(`https://ipapi.co/${props.ip}/json/`, {cache: "force-cache"})
        // fetch(`https://cldashboard.guidongui.it/api/ipapi/${props.IP}`)
        .then((response) => {
          let data = response.json();
          data.then(response => {
            if (!response.country_code) {
              setIPCountry(getLabelFromIP(props.ip).label)
            } else {
              setIPCountry(`, ${response.country_code}` || "");
              setIPCity(response.city || "");
            }
          })
        })
        .catch((error) => {
          console.log(error);
        });
    };

    if (props.ip && props.ip !== '') getGeoInfo();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.ip]);

  return <span> {IPCity}{IPCountry}</span>
};

export const ConnectedProvider: FC<ConnectedFromContent> = (props) => {
  const [IPprovider, setIPprovider] = useState<string>("");

  useEffect(() => {
    const getGeoInfo = () => {
      fetch(`https://ipapi.co/${props.ip}/json/`, {cache: "force-cache"})
        .then((response) => {
          let data = response.json();
          data.then(response => {
            setIPprovider(response.org || "unknown");
          })
        })
        .catch((error) => {
          console.log(error);
        });
    };

    if (props.ip && props.ip !== '') getGeoInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.ip]);

  return <span> {IPprovider} </span>
};
