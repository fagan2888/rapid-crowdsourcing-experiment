#!/usr/bin/env python3

import json
import requests

# setup
sheetsu_id = "1da100d38704"
sheetsu_url = "https://sheetsu.com/apis/v1.0/{}".format(sheetsu_id)
filename_csv = "data.csv"

# open file for writing
with open(filename_csv, "w") as g:
    g.write("id,interface,source,task,timestamp,uuid,value\n")

    # download data
    response = requests.get(sheetsu_url)

    if response.ok:
        data = response.json()
        for line in data:
            entry = json.loads(line["dump"])
            for d in entry:
                g.write("{},{},{},{},{},{},{}\n".format(
                    d["id"], d["interface"], d["source"], d["task"],
                    d["timestamp"], d["uuid"], d["value"]))
    else:
        print("Failed to download ({})".format(response.reason))
