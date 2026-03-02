# 2003 AMC 12B Problem 25

## Problem
Three points are chosen randomly and independently on a circle. What is the probability that all three pairwise distances between the points are less than the radius of the circle?


$$\mathrm{(A)}\ \dfrac{1}{36} \qquad\mathrm{(B)}\ \dfrac{1}{24} \qquad\mathrm{(C)}\ \dfrac{1}{18} \qquad\mathrm{(D)}\ \dfrac{1}{12} \qquad\mathrm{(E)}\ \dfrac{1}{9}$$

## Solution 1
The first point is placed anywhere on the circle, because it doesn't matter where it is chosen.

The next point must lie within 60 degrees of arc on either side, a total of 120 degrees possible, giving a total $\frac{1}{3}$ chance. The last point must lie within 60 degrees  of both points.

The minimum area of freedom we have to place the third point is a 60 degrees arc(if the first two are 60 degrees apart), with a $\frac{1}{6}$ probability.
The maximum amount of freedom we have to place the third point is a 120 degree arc(if the first two are the same point), with a $\frac{1}{3}$ probability.

As the second point moves farther away from the first point, up to a maximum of 60 degrees, the probability changes linearly (every degree it moves, adds one degree to where the third could be).

Therefore, we can average probabilities at each end to find $\frac{1}{4},$ the average probability we can place the third point based on a varying second point.

Therefore the total probability is $1\times\frac{1}{3}\times\frac{1}{4}=\frac{1}{12}$ or $\boxed{\text{(D)}}$
## Solution 2
We will use geometric probability.

The first point can be anywhere. Each point must be $\frac{\pi}{3}$ or less away from each other.

Define x be the amount of radians away the second point is from the first. We limit x to be in the interval [$-\pi, \pi$]. Define y be the amount of radians away the third point is from the first. We limit y to be in the interval [$-\pi, \pi$]. Now, we can deduct that: |x| $\le \frac{\pi}{3},$ |y| $\le \frac{\pi}{3},$ and |x-y| $\le \frac{\pi}{3}.$ We now begin plotting these on the coordinate grid.

First note that the area of the points that x and y can be (ignoring the conditions) is ($2\pi)^2 (r$emember what we restricted x and y to).

Now, we can graph the equations we deduced on the coordinate grid. That should look like this:

> [Asymptote diagram - not rendered in Markdown]

```asy
fill((40, 0)--(40, 40)--(0, 40)--(-40, 0)--(-40, -40)--(0, -40)--cycle, green); draw((-50, 0)--(50, 0)); draw((0, -50)--(0, 50)); draw((-50, -10)--(10, 50),red); draw((-10, -50)--(50, 10),red); draw((-40, 40)--(40, 40),red); draw((-40, -40)--(40, -40),red); draw((40, 40)--(40, -40),red); draw((-40, 40)--(-40, -40),red); label("$\frac{\pi}{3}$", (40, 0), SE); label("$\frac{\pi}{3}$", (-40, 0), SW); label("$\frac{\pi}{3}$", (0, 40), NE); label("$\frac{\pi}{3}$", (0, -40), NW);
```

The area of the shaded region can be calculated in many ways. Eventually, you will find that the area is $\frac{\pi^2}{3}.$

Thus, the probability is $\frac{\frac{\pi^2}{3}}{(2\pi)^2} = \frac{1}{12},$ or $\boxed{\text{(D)}}.$

*~superagh*
## Solution 3
There are $\binom32 = 3$ different ways to choose 2 points out of 3. The probability that an angle between 2 points is smaller than $60^\circ$ is $\frac{60^\circ}{360^\circ} = \frac16.$ The probability that the third point is inside the $60^\circ$ angle is $\frac{60^\circ}{360^\circ} = \frac16$

$$3 \cdot \frac16 \cdot \frac16 = \boxed{\text{(D)} \frac{1}{12} }$$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## See Also
