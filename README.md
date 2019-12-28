# Meteo API
## GET
### /data?start=START_DATE&finish=FINISH_DATE
### / - to get lastDataset
### /data  - to get 3 hours datasets
## POST
### /data
String postMessage = "temperature=" + temperature + "&humidity=" + humidity + "&pressure=" + pressure + "&altitude=" + altitude + "&battery=" + battery + "&key=" + myKey;

## Frontend for this API
https://github.com/alexanderkif/meteo-front

## How it works
<img src="uml.png">

## Wemos/Arduino circuitry
<img src="scema4.png">

## Arduino IDE sketch
https://github.com/alexanderkif/meteo/blob/master/arduino/MeteoBasicHttpsClient.ino