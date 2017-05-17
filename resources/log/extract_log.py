#!/usr/bin/env python3

import json
import requests
import fire

# setup
sheetsu_id = "1da100d38704"
sheetsu_url = "https://sheetsu.com/apis/v1.0/{}".format(sheetsu_id)
flds = ["id", "interface", "source", "task", "timestamp", "uuid", "value"]

def download(filename_csv="data.csv"):
# open file for writing
    with open(filename_csv, "w") as g:
        g.write(",".join(flds) + "\n")

        # download data
        response = requests.get(sheetsu_url)

        if response.ok:
            data = response.json()
            for line in data:
                entry = json.loads(line["dump"])
                for d in entry:
                    g.write("{},{},{},{},{},{},{}\n".format(
                        *[d[f] for f in flds]))
        else:
            print("Failed to download ({})".format(response.reason))

if __name__ == "__main__":
    fire.Fire(download)
