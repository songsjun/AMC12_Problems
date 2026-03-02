# 2013 AMC 12A Problem 13

## Problem
Let points  A = (0,0) , \ B = (1,2), \ C = (3,3),  and  D = (4,0) . Quadrilateral  ABCD  is cut into equal area pieces by a line passing through  A . This line intersects  $\overline{CD}$  at point  $\left (\frac{p}{q}, \frac{r}{s} \right )$ , where these fractions are in lowest terms. What is  p + q + r + s ?

$\textbf{(A)} \ 54 \qquad \textbf{(B)} \ 58 \qquad \textbf{(C)} \ 62 \qquad \textbf{(D)} \ 70 \qquad \textbf{(E)} \ 75$
## Solution
If you have graph paper, use Pick's Theorem to quickly and efficiently find the area of the quadrilateral. If not, just find the area by other methods.

Pick's Theorem states that

A = I + $\frac{B}{2} - 1,$ where I is the number of lattice points in the interior of the polygon, and B is the number of lattice points on the boundary of the polygon.

In this case,

$$A = 5 + \frac{7}{2} - 1 = 7.5$$

so

$$\frac{A}{2} = 3.75$$

The bottom half of the quadrilateral makes a triangle with base 4 and half the total area, so we can deduce that the height of the triangle must be $\frac{15}{8}$ in order for its area to be 3.75. This height is the y coordinate of our desired intersection point.

Note that segment CD lies on the line y = -$3x + 12$. Substituting in $\frac{15}{8}$ for y, we can find that the x coordinate of our intersection point is $\frac{27}{8}.$

Therefore the point of intersection is ($\frac{27}{8}, \frac{15}{8}),$ and our desired result is $27+8+15+8=\boxed{ \text{B}) \ 58}.$
## Solution 2 (Shoelace)
Let the point of intersection be E, with coordinates (x, y). Then, ABCD is cut into ABCE and AED.

Since the areas are equal, we can use [Shoelace Theorem](https://artofproblemsolving.com/wiki/index.php/Shoelace_Theorem) to find the area. This gives 3 + $3x-3y = 4y$.

The line going through CD is y = -$3x + 12$. Since E is on CD, we can substitute this in, giving 3 + $3x$ = -$21x + 84$. Solving for x gives $\frac{27}{8}.$ Plugging this back into the line equation gives $y =\frac{15}{8},$ for a final answer of $\boxed{58}.$
## Video Solution
https://www.youtube.com/watch?v=XQpQaomC2tA

*~sugar_rush*
## See also
