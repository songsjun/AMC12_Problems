# 2002 AMC 12B Problem 18

## Problem
A point P is randomly selected from the [rectangular](https://artofproblemsolving.com/wiki/index.php/rectangle) region with vertices (0,0),(2,0),(2,1),(0,1). What is the [probability](https://artofproblemsolving.com/wiki/index.php/probability) that P is closer to the [origin](https://artofproblemsolving.com/wiki/index.php/origin) than it is to the point (3,1)?


$$\mathrm{(A)}\ \frac 12 \qquad\mathrm{(B)}\ \frac 23 \qquad\mathrm{(C)}\ \frac 34 \qquad\mathrm{(D)}\ \frac 45 \qquad\mathrm{(E)}\ 1$$

## Solution
### Solution 1
Assume that the point P is randomly chosen within the rectangle with vertices (0,0), (3,0), (3,1), (0,1). In this case, the region for P to be closer to the origin than to point (3,1) occupies exactly $\frac{1}{2}$ of the area of the rectangle, or 1.5 square units.

If P is chosen within the square with vertices (2,0), (3,0), (3,1), (2,1) which has area 1 square unit, it is for sure closer to (3,1).

Now if P can only be chosen within the rectangle with vertices (0,0), (2,0), (2,1), (0,1), then the square region is removed and the area for P to be closer to (3,1) is then decreased by 1 square unit, left with only 0.5 square unit.

Thus the probability that P is closer to (3.1) is $\frac{0.5}{2}=\frac{1}{4}$ and that of P is closer to the origin is $1-\frac{1}{4}=\frac{3}{4}. \mathrm{(C)}$

*~Nafer*
### Solution 2 (slightly more calculation but easy:)
First, join points (0,0) and (3,1). This line $l_1$ has equation $y =\frac{1}{3}$x.

Next, consider the perpendicular bisector $l_2$ of line $l_1$, any point on the perpendicular bisector is equidistance from points (0,0) and (3,1).

If the point P is chosen on the left of $l_2$ , the point is closer to the origin. $l_2$ will cut the rectangle region twice, dividing the region into two smaller trapezoids. The trapezoid on the left side is the area we want.

So, first, find the equation of $l_2$, using the midpoint of (0,0) and (3,1), which is (1.5,0.5), the equation y = -$3x + 5$ can be easily derived. Substituting  $y = 0$  and  $y = 1$  to solve for x. For the former, $x =\frac{5}{3},$ for the latter, $x =\frac{4}{3}.$

Thus, the area of the trapezoid we want is $\frac$ {($\frac{5}{3} + \frac{4}{3})\cdot1$}{2} = $\frac{3}{2}$

Therefore, the probability the question asks equals to $\frac{\frac{3}{2}}{2} =\boxed{\textbf{(C) }\frac{3}{4}}$

*~Yohann*
## See also
