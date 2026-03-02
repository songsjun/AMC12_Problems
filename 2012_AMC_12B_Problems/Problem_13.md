# 2012 AMC 12B Problem 13

## Problem
Two parabolas have equations $y= x^2 + ax +b$ and $y= x^2 + cx +d,$ where a, b, c, and d are integers, each chosen independently by rolling a fair six-sided die. What is the probability that the parabolas will have at least one point in common?

$\textbf{(A)}\ \frac{1}{2}\qquad\textbf{(B)}\ \frac{25}{36}\qquad\textbf{(C)}\ \frac{5}{6}\qquad\textbf{(D)}\ \frac{31}{36}\qquad\textbf{(E)}\ 1$
## Solutions
### Solution 1
Set the two equations equal to each other: $x^2 + ax + b = x^2 + cx + d. Now$ remove the x squared and get x's on one side: ax-cx=d-b. Now factor x: x(a-c)=d-b. If a cannot equal c, then there is always a solution, but if a=c, a 1 in 6 chance, leaving a 1080 out 1296, always having at least one point in common. And if a=c, then the only way for that to work, is if d=b, a 1 in 36 chance, however, this can occur 6 ways, so a 1 in 6 chance of this happening. So adding one  thirty sixth to $\frac{1080}{1296},$ we get the simplified fraction of $\frac{31}{36}$; answer $\boxed{(D)}.$
### Solution 2
Proceed as above to obtain x(a-c)=d-b. The probability that the parabolas have at least 1 point in common is 1 minus the probability that they do not intersect. The equation x(a-c)=d-b has no solution if and only if a=c and $d\neq$ b. The probability that a=c is $\frac{1}{6}$ while the probability that $d\neq$ b is $\frac{5}{6}.$ Thus we have $1-\left(\frac{1}{6}\right)\left(\frac{5}{6}\right)=\frac{31}{36}$ for the probability that the parabolas intersect.
### Solution 3
Clearly, ax + b = cx + d. Imagine the two sides as lines - they will have no solutions when the two lines are parallel (eg. have the same gradient) which is when a is not equal to c. Also, if b = d and a = c, they're the same line so we must add one case. There are 36 combinations of a and c, of which they are equal in 6 - but we must subtract 1 as if a=c but b=d they still intersect and have solutions. So we subtract this to obtain $\frac{36}{36} - \frac{5}{36} = \frac{31}{36}.$

*~youtube.com/indianmathguy*
### Solution 4
$$x^2+ax+b=(x+ \frac{a}{2})^2+b- \frac{a^2}{4}$$

$$x^2+cx+d=(x+ \frac{c}{2})^2+d- \frac{c^2}{4}$$

The only case where these two functions have no intersections is when the x-values of the turning point are the same but the y-values are not the same.


$$\therefore \frac{a}{2}= \frac{c}{2} \implies a=c \quad\quad probability = \frac{1}{6} \times \frac{1}{6} \times 6= \frac{1}{6}$$


b- $\frac{a^2}{4} \neq$ d- $\frac{c^2}{4} \implies$ b $\neq$ d $\quad\quad$ probability = 1- $\frac{1}{6}\times \frac{1}{6}\times 6= \frac{5}{6}$

$$\therefore 1- \frac{1}{6}\times \frac{5}{6} = 1- \frac{5}{36} = \frac{31}{36}$$

*~JiYang*
## See Also
