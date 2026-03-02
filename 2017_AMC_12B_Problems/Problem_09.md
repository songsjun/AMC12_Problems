# 2017 AMC 12B Problem 9

## Problem
A circle has center (-10, -4) and has radius 13. Another circle has center (3, 9) and radius $\sqrt{65}.$ The line passing through the two points of intersection of the two circles has equation x+y=c. What is c?

$\textbf{(A)}\ 3\qquad\textbf{(B)}\ 3\sqrt{3}\qquad\textbf{(C)}\ 4\sqrt{2}\qquad\textbf{(D)}\ 6\qquad\textbf{(E)}\ \frac{13}{2}$
## Solution 1
The equations of the two circles are $(x+10)^2+(y+4)^2=169$ and $(x-3)^2+(y-9)^2=65$. Rearrange them to $(x+10)^2+(y+4)^2-169=0$ and $(x-3)^2+(y-9)^2-65=0$, respectively. Their intersection points are where these two equations gain equality. The two points lie on the line with the equation $(x+10)^2+(y+4)^2-169=(x-3)^2+(y-9)^2-65$. We can simplify this like the following. $(x+10)^2+(y+4)^2-169=(x-3)^2+(y-9)^2-65 \rightarrow (x^2+20x+100)+(y^2+8y+16)-(x^2-6x+9)-(y^2-18y+81)=104 \rightarrow 26x+26y+26=104 \rightarrow 26x+26y=78 \rightarrow$ x+$y=3$. Thus, $c =\boxed{\textbf{(A)}\ 3}.$

Solution by TheUltimate123
## Solution 2: Shortcut with right triangles
Note the specificity of the radii, 13 and $\sqrt{65},$ and that specificity is often deliberately added to simplify the solution to a problem.

One may recognize 13 as the hypotenuse of the $\text{5-12-13}$ right triangle and $\sqrt{65}$ as the hypotenuse of the right triangle with legs 1 and 8. We can suppose that the legs of these triangles connect the circles' centers to their intersection along the gridlines of the plane.

If we suspect that one of the intersections lies 12 units to the right of and 5 units above the center of the first circle, we find the point (-10 + 12,-4 + 5) = (2,1), which is in fact 1 unit to the left of and 8 units below the center of the second circle at (3,9).

Plugging (2,1) into x + y gives us $c = 2+1 =\boxed{\textbf{(A) } 3}.$

A similar solution uses the other intersection point, (-5,8).
## See Also
