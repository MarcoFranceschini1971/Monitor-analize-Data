from __future__ import absolute_import, division, print_function, \
                                                    unicode_literals
import time
import requests
import os

try:
    from ADCDifferentialPi import ADCDifferentialPi
except ImportError:
    print("Failed to import ADCDifferentialPi from python system path")
    print("Importing from parent folder instead")
    try:
        import sys
        sys.path.append('..')
        from ADCDifferentialPi import ADCDifferentialPi
    except ImportError:
        raise ImportError(
            "Failed to import library from parent folder")


def main():
    url = "https://us-central1-x-project-a5ecf.cloudfunctions.net/writeDataOnDB"
    adc = ADCDifferentialPi(0x68, 0x69, 12)

    while True:
        os.system('clear')
        dati_json = {
            "time": int(time.time()),
            "data": { "tensione":  adc.read_voltage(8) * 5.7, "temperatura":  (adc.read_voltage(7) - 0.04) * 100 },
            "stats": { "temp C°": 58.2, "btt lev %": 87, "btt status V": 4.8 }
        }
        response = requests.post(url, json=dati_json)

        print("risposta del server: ", response.status_code)
        print("dati inviatii: ", dati_json)

        time.sleep(600)

if __name__ == "__main__":
    main()
