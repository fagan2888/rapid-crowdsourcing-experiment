#!/usr/bin/env python3
"""
Download images of dogs from dog_urls.txt. First 100 valid images are
downloaded. Image is valid if request does not fail and content is more than 20
KB.
"""

from download import download
import numpy as np

def sample_imagenet_urls(n, seed=6831):
    k=14000000
    c=3
    np.random.seed(seed)
    samples = np.random.choice(np.array(range(k)), size=n*c, replace=False)
    samples = list(samples)
    samples.sort()

    urls = []
    next_sample = samples.pop(0)
    done = False
    with open("imagenet_fall11_urls/fall11_urls.txt", "r") as f:
        for i in range(k):
            if not done:
                try:
                    line = next(f).strip()
                except:
                    i = i-1
                    continue
                if i == next_sample:
                    line = line[line.find("http"):]
                    urls.append(line)
                    if samples:
                        next_sample = samples.pop(0)
                    else:
                        done = True

    return urls

def download1():
    n = 611+100
    size_cutoff = 20 * 2**10 # 20 KB

    url = "other_urls.txt"
    dir_ = "other"

    urls = sample_imagenet_urls(n, 6831)
    with open(url, "w") as f:
        f.write("\n".join(urls))

    download(url, dir_, n, size_cutoff)

def download2():
    n = 10
    size_cutoff = 20 * 2**10 # 20 KB
    url = "tmp.txt"
    dir_ = "tmp"

    urls = sample_imagenet_urls(n, 6832)
    with open(url, "w") as f:
        f.write("\n".join(urls))

    download(url, dir_, n, size_cutoff)

if __name__ == "__main__":
    download2()
