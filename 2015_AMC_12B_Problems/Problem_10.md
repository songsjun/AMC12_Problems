# 2015 AMC 12B Problem 10

## Problem
How many noncongruent integer-sided triangles with positive area and perimeter less than 15 are neither equilateral, isosceles, nor right triangles?

$\textbf{(A)}\; 3 \qquad\textbf{(B)}\; 4 \qquad\textbf{(C)}\; 5 \qquad\textbf{(D)}\; 6 \qquad\textbf{(E)}\; 7$
## Solution
Since we want non-congruent triangles that are neither isosceles nor equilateral, we can just list side lengths (a,b,c) with a. Furthermore, "positive area" tells us that c < a + b and the perimeter constraints means a+b+c < 15. There are no triangles when $a = 1$ because then c must be less than $b+1$, implying that b $\geq$ c, contrary to b < c. When $a=2$, similar to above, c must be less than $b+2$, so this leaves the only possibility $c =b+1$. This gives 3 triangles (2,3,4), (2,4,5), (2,5,6) within our perimeter constraint. When $a=3$, c can be $b+1$ or $b+2$, which gives triangles (3,4,5), (3,4,6), (3,5,6). Note that (3,4,5) is a right triangle, so we get rid of it and we get only 2 triangles. All in all, this gives us $3+2 =\boxed{\textbf{(C)}\; 5}$ triangles.
## See Also
