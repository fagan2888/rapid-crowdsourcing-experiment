# Rapid Crowdsourcing Experiment

Reproducing experiments from ["Embracing Error to Enable Rapid Crowdsourcing"](https://arxiv.org/pdf/1602.04506.pdf) (Krishna et al,
2016).

Video url
- https://youtu.be/JPSwv70TYw4

Experiment implementation url
- http://web.mit.edu/micahs/www/rsvp/index.html 

How are tasks sequenced?
- The order of interfaces (RSVP and traditional) is chosen randomly. The order of tasks
    (easy, medium, and hard images) is chosen randomly and held the same between both
    interfaces.

What are the experimental parameters?
- Several parameters can be changed. These include
    - the number of interfaces to test
    - the number of tasks to run
    - the time between images in the RSVP interface
    - the length of each task, in number of images shown
    - the number of images available for the easy, medium, hard, and other[^3] classes
- Of these, the length of each task and the time between images are the main experimental
    parmaeters. The other parameters just allow the experimenter to compensate for more/less
    data or user testing time.
- The parameters can be changed from their defaults by including url-encoded key value pairs
    in the url.

What data is collected for each trial run and in what format?
- Data is collected for images:
    - The image id
    - The exact timestamp the image is shown on the screen
- Data is collected for users:
    - The user id
- Data is collected for user actions:
    - The key code
    - The exact timestamp the key is pressed
- The format is a json dump of a batch of log events in a Google spreadsheet. This can
    easily be postprocessed to recover the log array.

What demographic data or subjective judgments do you collect from each user, and why?
- For demographic data, we collect
    - age
- For subjective judgments, we collect
    - user's preference, in terms of comfort, between interfaces
    - user's preference, in terms of efficiency of labeling, between interfaces
    - user's preference, in terms of accuracy of labeling, between interfaces
    - open-ended comments

## Collaboration:
  - used Bootstrap starter template
    (https://v4-alpha.getbootstrap.com/examples/starter-template/)
  - used randn_bm from Maxwell Collard
    (http://stackoverflow.com/a/36481059/2514228)
  - used string format from fearphage
    (http://stackoverflow.com/a/4673436/2514228)
  - used callNTimes function from Amadan
    (http://stackoverflow.com/a/21648304/2514228)
  - used UID generation snippet from Community Wiki
    (http://stackoverflow.com/a/2117523/2514228)
  - Used js poll from David Walsh
    (https://davidwalsh.name/javascript-polling)
  - Used kbd css from Stack Overflow css

## Appendix

### Calculation of experiment size

Krishna et al are not explicit about the number of images labeled by their workers in total,
so I attempt to back it out below. Then, I adjust for how much user testing time we have to
come up with the following dataset, of total size 719 images:

- 36 easy images
- 36 medium images
- 36 hard images
- 611 other images


#### RSVP Calculations

Numbers from paper
- positive examples: 500 * 3 = 1500
- negative examples: 1000- 1500 = 8500
- total examples: 10000
- redundancy[^1]: 10
- 100 ms per image
- $0.17 per 100 images
- $6 per hour

Total images labeled
- total examples * redundancy = 100000

Time required
- 100000 images * 100 ms per image * 1 sec per 1000 ms * 1 min per 60 seconds = 166.67 minutes
- corresponds to 600 images per minute, or 3600 images per hour

Cost
- $0.17 per 100 images
- $6 per hour => 35 sets of images, or 3529 images per hour
- suggests person works for an hour straight, without breaks.

#### Traditional Calculations

Numbers from paper
- total examples: 10000
- redundancy[^2]: 3

Total images labeled
- total examples * redundancy = 30000

Time required
- 1.7 seconds per image * 30000 images * 1 min per 60 seconds = 850 minutes

#### Our time available

We can assume
- 10 workers
- 15 minutes per work

Total time available: 150 minutes

Suppose there is no time wasted reading instructions and consent. Then we could label
- 130000 images * 150 minutes / (850 + 166.67 minutes) = 19192 images

Of these,
- given 10x + 3x redundancy, we start with 19192/13 = 1476 images
- of these, 15%, or 221 are positive examples
- thus, we have 74 per category

Adjusting for experiment time available, we can cut down by 25%.
- 14385 images
- 1438 per person?
    - 719 RSVP => 71 seconds => 1 minutes
    - 719 traditional => 7 minutes
    - feasible

Summary
- 36 dogs
- 36 motorcycles
- 36 breakfast
- 611 other
- total: 719 images

## Collaboration:
  - used Bootstrap starter template
    (https://v4-alpha.getbootstrap.com/examples/starter-template/)
  - used randn_bm from Maxwell Collard
    (http://stackoverflow.com/a/36481059/2514228)
  - used string format from fearphage
    (http://stackoverflow.com/a/4673436/2514228)
  - used callNTimes function from Amadan
    (http://stackoverflow.com/a/21648304/2514228)
  - used UID generation snippet from Community Wiki
    (http://stackoverflow.com/a/2117523/2514228)
  - Used js poll from David Walsh
    (https://davidwalsh.name/javascript-polling)
  - Used kbd css from Stack Overflow css
  - Used image scaling CSS from Thomas Guillory
    (http://stackoverflow.com/a/10016640/2514228)

[^1]: "We vary redundancy on all the concepts to from 1 to 10 workers to see its effects on
  precision and recall."
[^2]: "Precision scores, recall scores, and speedups are calculated using 3 workers in the
  conventional setting."
[^3]: "Other" class contains images that are not in any of the "positive" classes.
