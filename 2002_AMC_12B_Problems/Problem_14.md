# 2002 AMC 12B Problem 14

> This problem is the same as [2002 AMC 12B #14](https://artofproblemsolving.com/wiki/index.php/2002_AMC_12B_Problems) and [2002 AMC 10B #18](https://artofproblemsolving.com/wiki/index.php/2002_AMC_10B_Problems).
## Problem
Four distinct [circle](https://artofproblemsolving.com/wiki/index.php/circle)s are drawn in a [plane](https://artofproblemsolving.com/wiki/index.php/plane). What is the maximum number of points where at least two of the circles intersect?


$$\mathrm{(A)}\ 8 \qquad\mathrm{(B)}\ 9 \qquad\mathrm{(C)}\ 10 \qquad\mathrm{(D)}\ 12 \qquad\mathrm{(E)}\ 16$$

## Solution 1
For any given pair of circles, they can intersect at most 2 times. Since there are {$4\choose 2$} = 6 pairs of circles, the maximum number of possible intersections is 6 $\cdot 2 = 12.$ We can construct such a situation as below, so the answer is $\boxed{\mathrm{(D)}\ 12}.$

[Image:2002_$12B_AMC-14$.png](https://artofproblemsolving.com/wiki/index.php/Image:2002_12B_AMC-14.png)
## Solution 2
Because a pair or circles can intersect at most 2 times, the first circle can intersect the second at 2 points, the third can intersect the first two at 4 points, and the fourth can intersect the first three at 6 points. This means that our answer is $2+4+6=\boxed{\mathrm{(D)}\ 12}.$
## Solution
Pick a circle any circle- 4 ways. Then, pick any other circle- 3 ways. For each of these circles, there will be 2 intersections for a total of 4*3*2 = 24 intersections. However, we have counted each intersection twice, so we divide for overcounting. Therefore, we reach a total of $\frac{24}{2}=\boxed{12},$ which corresponds to $\text{(D)}.$
## See also
