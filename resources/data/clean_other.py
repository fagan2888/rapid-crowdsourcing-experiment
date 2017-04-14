#!/usr/bin/env python3

import os

n = 611
n1 = 100
dir_ = "other"

bad = \
{ 
    "easy"   : [ 5, 20, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160,
                 161, 162, 163, 164, 637 ],
    "medium" : [ ],
    "hard"   : [ ],
    "broken" : [ 13, 23, 73, 84, 106, 107, 133, 47, 149, 172, 175, 180, 184,
                 199, 228, 249, 250, 254, 259, 276, 283, 293, 295, 308, 317,
                 323, 329, 334, 344, 350, 352, 357, 358, 359, 361, 372, 378,
                 382, 393, 395, 401, 423, 430, 437, 440, 449, 451, 459, 460,
                 463, 464, 499, 501, 519, 524, 528, 532, 533, 549, 553, 555,
                 556, 567, 569, 591, 595, 596, 599, 600, 601, 602, 628, 633,
                 641, 642, 643, 651, 655, 656, 666, 675, 687, 687, 706, 709 ],
}

nbad = 0
for key in bad:
    nbad += len(bad[key])

def move_bad():
    original_ids = range(n+n1)
    bad_ids = []
    for key in bad:
        bad_ids = bad_ids + bad[key]

    for id_ in bad_ids:
        os.rename("other/{}.jpg".format(id_), "other_bad/{}.jpg".format(id_))

def rename_good():
    i = 0
    for f in os.listdir("other"):
        os.renames("other/{}".format(f), "other_new/{}.jpg".format(i))
        i += 1

if __name__=="__main__":
    rename_good()
