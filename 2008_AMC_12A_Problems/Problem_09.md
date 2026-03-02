# 2008 AMC 12A Problem 9

> This problem is the same as [2008 AMC 12A #9](https://artofproblemsolving.com/wiki/index.php/2008_AMC_12A_Problems) and [2008 AMC 10A #14](https://artofproblemsolving.com/wiki/index.php/2008_AMC_10A_Problems/Problem_14).
## Problem
Older television screens have an aspect ratio of 4: 3. That is, the ratio of the width to the height is 4: 3. The aspect ratio of many movies is not 4: 3, so they are sometimes shown on a television screen by "letterboxing" - darkening strips of equal height at the top and bottom of the screen, as shown. Suppose a movie has an aspect ratio of 2: 1 and is shown on an older television screen with a 27-inch diagonal. What is the height, in inches, of each darkened strip?


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(1mm); filldraw((0,0)--(21.6,0)--(21.6,2.7)--(0,2.7)--cycle,grey,black); filldraw((0,13.5)--(21.6,13.5)--(21.6,16.2)--(0,16.2)--cycle,grey,black); draw((0,0)--(21.6,0)--(21.6,16.2)--(0,16.2)--cycle);
```


$$\mathrm{(A)}\ 2\qquad\mathrm{(B)}\ 2.25\qquad\mathrm{(C)}\ 2.5\qquad\mathrm{(D)}\ 2.7\qquad\mathrm{(E)}\ 3$$

## Solution
Let the width and height of the screen be $4x$ and $3x$ respectively, and let the width and height of the movie be $2y$ and y respectively.

By the [Pythagorean Theorem](https://artofproblemsolving.com/wiki/index.php/Pythagorean_Theorem), the diagonal is $\sqrt{(3x)^2+(4x)^2}=$5x = 27. So $x=\frac{27}{5}.$

Since the movie and the screen have the same width, $2y=4x\Rightarrowy=2x$.

Thus, the height of each strip is $\frac{3x-y}{2}=\frac{3x-2x}{2}=\frac{x}{2}=\frac{27}{10}=2.7\Longrightarrow\mathrm{(D)}.$
## See Also
