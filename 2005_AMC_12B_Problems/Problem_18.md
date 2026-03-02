# 2005 AMC 12B Problem 18

## Problem
Let A(2,2) and B(7,7) be points in the plane. Define R as the region in the first quadrant consisting of those points C such that $\triangle ABC$ is an acute triangle. What is the closest integer to the area of the region R?


$$\mathrm{(A)}\ 25 \qquad \mathrm{(B)}\ 39 \qquad \mathrm{(C)}\ 51 \qquad \mathrm{(D)}\ 60 \qquad \mathrm{(E)}\ 80$$

## Solution
> [Asymptote diagram - not rendered in Markdown]

```asy
Label f; f.p=fontsize(6); xaxis(-1,15,Ticks(f, 2.0)); yaxis(-1,15,Ticks(f, 2.0)); pair A = MP("A",(2,2),SW), B = MP("B",(7,7),NE); D(A--B); filldraw((0,4)--(4,0)--(14,0)--(0,14)--cycle,gray); filldraw(CP($0.5(A+B)$,A),white); D(A); D(B);
```


For angle A and B to be acute, C must be between the two lines that are perpendicular to $\overline{AB}$ and contain points A and B. For angle C to be acute, first draw a 45-45-90 triangle with $\overline{AB}$ as the hypotenuse. Note C cannot be inside this triangle's circumscribed circle or else $\angle C > 90^\circ.$ Hence, the area of R is the area of the large triangle minus the area of the small triangle minus the area of the circle, which is $\frac{14^2}{2}-\frac{4^2}{2}-(\frac{5\sqrt{2}}{2})^2\pi=98-8-\frac{25\pi}{2},$ which is approximately 51. The answer is $\boxed{\mathrm{C}}.$

Note: When doing this problem, it is important to double check that the circle with diameter AB lies fully in the first quadrant, which luckily it does.
## See also
