# 2005 AMC 12A Problem 12

## Problem
A line passes through A(1,1) and B(100,1000). How many other points with integer coordinates are on the line and strictly between A and B?


$$(\mathrm {A}) \ 0 \qquad (\mathrm {B}) \ 2 \qquad (\mathrm {C})\ 3 \qquad (\mathrm {D}) \ 8 \qquad (\mathrm {E})\ 9$$

## Solution
For convenience’s sake, we can transform A to the origin and B to (99,999) (this does not change the problem). The line AB has the [equation](https://artofproblemsolving.com/wiki/index.php/equation) y = $\frac{999}{99}$x = $\frac{111}{11}$x. The coordinates are integers if 11|x, so the values of x are 11, 22 $\ldots 88,$ with a total of $8\implies \boxed{\mathrm{(D)}}$ coordinates.
## Solution 2
The slope of the line is $\frac{1000-1}{100-1}=\frac{111}{11},$ so all points on the line have the form (1+$1$1t, 1+$111t$) for some value of t (the rise is 111 and the run is 11). Such a point has integer coordinates if and only if t is an integer, and the point is strictly between A and B if and only if 0. Thus, there are $\boxed{8}$ points with the required property. -Paixiao
## Solution 3 (modular arithmetic)
We can re-write the equation in slope-intercept form (where y is on the left side). We know that the slope is $\frac{1000 - 1}{100 - 1} = \frac{999}{99} = \frac{111}{11}.$ Then, we have $y =\frac{111}{11}$x - $\frac{100}{11}$ which reduces to $y =\frac{111x - 100}{11}.$ Now, it remains to look for values of x such that $111x\equiv 1 (\mod 11).$ Since 111 $\equiv 1 (\mod 11),$ there are $\boxed{8 \textbf{(D)}}$ coordinates for which this is true. ~elpianista227
## See also
