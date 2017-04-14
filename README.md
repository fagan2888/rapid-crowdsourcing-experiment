# Rapid Crowdsourcing Experiment

Reproducing experiments from ["Embracing Error to Enable Rapid Crowdsourcing"](https://arxiv.org/pdf/1602.04506.pdf) (Krishna et al,
2016).

## Calculation of experiment size

Krishna et al are not explicit about the number of images labeled by their workers in total,
so I attempt to back it out below. Then, I adjust for how much user testing time we have to
come up with the following dataset, of total size 719 images:

- 36 easy images
- 36 medium images
- 36 hard images
- 611 other images


### RSVP Calculations

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

### Traditional Calculations

Numbers from paper
- total examples: 10000
- redundancy[^2]: 3

Total images labeled
- total examples * redundancy = 30000

Time required
- 1.7 seconds per image * 30000 images * 1 min per 60 seconds = 850 minutes

### Our time available

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

[^1]: "We vary redundancy on all the concepts to from 1 to 10 workers to see its effects on
  precision and recall."
[^2]: "Precision scores, recall scores, and speedups are calculated using 3 workers in the
  conventional setting."
