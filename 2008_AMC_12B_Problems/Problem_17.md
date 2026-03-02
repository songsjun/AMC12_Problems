# 2008 AMC 12B Problem 17

## Problem
Let A, B and C be three distinct points on the graph of $y=x^2$ such that line AB is parallel to the x-axis and $\triangle ABC$ is a right triangle with area 2008. What is the sum of the digits of the y-coordinate of C?

$\textbf{(A)}\ 16\qquad\textbf{(B)}\ 17\qquad\textbf{(C)}\ 18\qquad\textbf{(D)}\ 19\qquad\textbf{(E)}\ 20$
## Solution
Supposing $\angle A=90^\circ, AC$ is perpendicular to AB and, it follows, to the x-axis, making AC  a segment of the line x=m. But that would mean that the coordinates of C are $(m, m^2),$ contradicting the given that points A and C are distinct. So $\angle A$ is not $90^\circ.$ By a similar logic, neither is $\angle B.$

This means that $\angle C=90^\circ$ and AC is perpendicular to BC. Let C be the point $(n, n^2).$ So the slope of BC is the negative reciprocal of the slope of AC, yielding $m+n=\frac{1}{m-n} \Rightarrowm^2-n^2=1.$

Because m^2-n^2 is the length of the altitude of triangle ABC from AB, and $2m$ is the length of AB, the area of $\triangle ABC=m(m^2-n^2)=2008.$ Since m^2-n^2=1, $m=2008$.
Substituting, 2008^2-n^2=1 $\Rightarrown^2=2008^2-1=(2000+8)^2-1=4000000+32000+64-1=4032063$, whose digits sum to 18 $\Rightarrow \textbf{(C)}.$
## See Also
