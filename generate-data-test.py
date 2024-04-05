import time
import requests
import random

firstTime = int(time.time())
url = "https://us-central1-x-project-a5ecf.cloudfunctions.net/writeDataOnDB"
unitIds = ["Unit 1", "Unit 2", "Unit 3", "Unit 4"]
urls = [
    "https://api.open-meteo.com/v1/forecast?latitude=45.4643&longitude=9.1895&past_days=7&hourly=temperature_2m,relative_humidity_2m,rain,visibility,wind_speed_10m&timezone=auto",
"https://api.open-meteo.com/v1/forecast?latitude=41.8919&longitude=12.5113&past_days=7&hourly=temperature_2m,relative_humidity_2m,rain,visibility,wind_speed_10m&timezone=auto",
"https://api.open-meteo.com/v1/forecast?latitude=51.5085&longitude=-0.1257&past_days=7&hourly=temperature_2m,relative_humidity_2m,rain,visibility,wind_speed_10m&timezone=auto",
"https://api.open-meteo.com/v1/forecast?latitude=48.8534&longitude=2.3488&past_days=7&hourly=temperature_2m,relative_humidity_2m,rain,visibility,wind_speed_10m&timezone=auto"
]
i = 0
while i < len(urls):
    temperReq = requests.get(urls[i])
    temperature = temperReq.json()['hourly']['temperature_2m']
    umidita = temperReq.json()['hourly']["relative_humidity_2m"]
    pioggia = temperReq.json()['hourly']["rain"]
    visibilita = temperReq.json()['hourly']["visibility"]
    vento = temperReq.json()['hourly']["wind_speed_10m"]

    _time = firstTime
    count = 0

    while count < len(temperature):
        temp_C = random.uniform(18, 25)  # Genera un valore casuale per la temperatura in gradi Celsius
        btt_lev = random.randint(0, 100)  # Genera un valore casuale per il livello della batteria
        btt_status_V = random.uniform(3, 4)  # Genera un valore casuale per lo stato della batteria in Volt

        dati_json = {
            "clientId": "cliente 1",
            "unitId": unitIds[i],
            "time": _time,
            "data": {"Temperatura": temperature[count], "Umidità": umidita[count], "Pioggia": pioggia[count], "Visibilità": visibilita[count], "Vento": vento[count]},
            "stats": {"temp C°": temp_C, "btt lev %": btt_lev, "btt status V": btt_status_V}
        }
        
        response = requests.post(url, json=dati_json)
        _time += 3600
        count += 1
        print("Dati inviati:", dati_json)
        time.sleep(0.4)  # Intervallo di mezzo secondo
    i += 1