# 2016 AMC 12B Problem 23

## Problem
What is the volume of the region in three-dimensional space defined by the inequalities |x|+|y|+|z|$\le1$ and |x|+|y|+|$z-$1|$\le1$?

$\textbf{(A)}\ \frac{1}{6}\qquad\textbf{(B)}\ \frac{1}{4}\qquad\textbf{(C)}\ \frac{1}{3}\qquad\textbf{(D)}\ \frac{1}{2}\qquad\textbf{(E)}\ 1$
## Solution 1 (Non Calculus)
The first inequality refers to the interior of a regular octahedron with top and bottom vertices (0,0,1),\ (0,0,-1). Its volume is $8\cdot\tfrac16=\tfrac43.$ The second inequality describes an identical shape, shifted +1 upwards along the Z axis. The intersection will be a similar octahedron, linearly scaled down by half. Thus the volume of the intersection is one-eighth of the volume of the first octahedron, giving an answer of $\textbf{(A) }\tfrac16.$
## Solution 2 (Calculus)
Let $z\rightarrowz-1/2$, then we can transform the two inequalities to |x|+|y|+|$z-1/$2|$\le1$ and |x|+|y|+|$z+1/$2|$\le1.$ Then it's clear that $-1/2\le$ z $\le 1/2$, consider 0 $\le$ z $\le 1/$2, |x|+|y|$\le 1/2$-z, then since the area of |x|+|y|$\le$ k is $2k^2$, the volume is $\int_{0}^{1/2}$2k^2 \,$dk=\frac{1}{12}.$ By symmetry, the case when $\frac{-1}{2}\lez\le0$ is the same. Thus the answer is $\frac{1}{6}.$
## Solution 3
Do this problem first on the first quadrant. Graph this by using test points and you will see that you will have two tetrahedrons - each of them intersects at the middle, and thus its 1/4th of the area of the tetrahedrons (since they are the same area). The area of a tetrahedron is bh/3, which gives us 1/6, and then divide that by 4 to get the bounded area of 1/24 in the shaded region. Scale this up to the other quadrants now (since they are the same due to the abs value) and you get $\textbf{(A) }\tfrac16.$

Sol by IronicNinja~

$\textbf{Note:}$ The way I solved this problem is by considering the intersections of the bottom half of the shifted figure with the original figure. This basically motivated the fact that, because the intersection is symmetrical, it is a smaller of scale $\frac{1}{2},$ which finishes the problem.
## Video Solution by CanadaMath (Problem 21-25)
Fast Forward to 20:17 for problem 23
https://www.youtube.com/watch?v=P3jJDLGyF2w&t=1546s

*~THEMATHCANADIAN*
## See Also
