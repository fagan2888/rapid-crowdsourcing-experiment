#!/usr/bin/env python3
"""
Download images of dogs from dog_urls.txt. First 100 valid images are
downloaded. Image is valid if request does not fail and content is more than 20
KB.
"""

import requests
import os


def download(url, dir_, n, size_cutoff):
    if not os.path.exists(dir_):
        os.mkdir(dir_)

    with open(url, "r") as f:
        i=0
        for url in f:
            try:
                print("Downloading {}...".format(url), end='')
                r = requests.get(url)
                if len(r.content) < size_cutoff:
                    raise Exception
                with open("{}/{}.jpg".format(dir_, i), "wb") as g:
                    g.write(r.content)
                print("done")
                i += 1
            except:
                print("FAILED")
                pass


            if i == n:
                break

        if i != n:
            print("**** FAILED TO DOWNLOAD ENOUGH **** ")

if __name__ == "__main__":
    n = 36
    size_cutoff = 20 * 2**10 # 20 KB

    c = (
            #("dog_urls.txt", "easy"),
            #("motorcycle_urls.txt", "medium"),
            ("breakfast_urls.txt", "hard"),
        )

    for tup in c:
        url = tup[0]
        dir_ = tup[1]
        download(url, dir_, n, size_cutoff)
