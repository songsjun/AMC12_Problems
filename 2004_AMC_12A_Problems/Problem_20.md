# 2004 AMC 12A Problem 20

## Problem
Select numbers a and b between 0 and 1 independently and at random, and let c be their sum. Let A, B and C be the results when a, b and c, respectively, are rounded to the nearest integer. What is the [probability](https://artofproblemsolving.com/wiki/index.php/probability) that A + B = C?


$$\text {(A)}\ \frac14 \qquad \text {(B)}\ \frac13 \qquad \text {(C)}\ \frac12 \qquad \text {(D)}\ \frac23 \qquad \text {(E)}\ \frac34$$

## Solution
### Solution 1
[Casework](https://artofproblemsolving.com/wiki/index.php/Casework):

#0 + 0 = 0. The probability that a < \frac{1}{2} and b < \frac{1}{2} is \left(\frac 12\right)^2 = \frac{1}{4}. Notice that the sum a+b ranges from 0 to 1 with a symmetric distribution across a+b=c=\frac 12, and we want c < \frac 12. Thus the chance is \frac{\frac{1}{4}}2 = \frac 18.
#0 + 1 = 1. The probability that a < \frac 12 and b > \frac 12 is \frac 14, but now \frac{1}{2} < a+b = c < \frac 32, which makes C = 1 automatically. Hence the chance is \frac 14.
#1 + 0 = 1. This is the same as the previous case.
#1 + 1 = 2. We recognize that this is equivalent to the first case.

Our answer is $2\left(\frac 18 + \frac 14 \right) = \frac 34 \Rightarrow \mathrm{(E)}.$
### Solution 2
Use areas to deal with this continuous probability problem. Set up a unit square with values of a on x-axis and b on y-axis.

If a + b < 1/2 then this will work because A = B = C = 0. Similarly if a + b > 3/2 then this will work because in order for this to happen, a and b are each greater than 1/2 making A = B = 1, and C = 2. Each of these triangles in the unit square has area of 1/8.

The only case left is when C = 1. Then each of A and B must be 1 and 0, in any order. These cut off squares of area 1/2 from the upper left and lower right corners of the unit square.

Then the area producing the desired result is 3/4. Since the area of the unit square is 1, the probability is $\frac 34.$
## Solution 3 (Alcumus)
The conditions under which A+B=C are as follows.

(i) If a+b< 1/2, then A=B=C=0.

(ii) If $a\geq 1/2$ and b<1/2, then B=0 and A=C=1.

(iii) If a<1/2 and $b\geq 1/2$, then A=0 and B=C=1.

(iv) If $a+b\geq 3/2$, then A=B=1 and C=2.

These conditions correspond to the shaded regions of the graph shown. The combined area of those regions is 3/4, and the area of the entire square is 1, so the requested probability is $\boxed{3/4}.$


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(2cm); draw((1.1,0)--(0,0)--(0,1.1),linewidth(1)); fill((0,0)--(1,0)--(1,1)--(0,1)--cycle,gray(0.7)); fill((0.5,0)--(0.5,0.5)--(0,0.5)--cycle,white); fill((0.5,0.5)--(1,0.5)--(0.5,1)--cycle,white); label("$a$",(1.1,0),E); label("$b$",(0,1.1),N); label("1",(1,0),S); label("1",(0,1),W); label("0",(0,0),SW);
```
## See Also
