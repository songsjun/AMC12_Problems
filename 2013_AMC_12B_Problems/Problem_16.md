# 2013 AMC 12B Problem 16

## Problem
Let ABCDE be an equiangular convex pentagon of perimeter 1. The pairwise intersections of the lines that extend the sides of the pentagon determine a five-pointed star polygon. Let s be the perimeter of this star. What is the difference between the maximum and the minimum possible values of s?

$\textbf{(A)}\ 0 \qquad \textbf{(B)}\ \frac{1}{2} \qquad \textbf{(C)}\ \frac{\sqrt{5}-1}{2} \qquad \textbf{(D)}\ \frac{\sqrt{5}+1}{2} \qquad \textbf{(E)}\ \sqrt{5}$
## Solution 1
The five pointed star can be thought of as five triangles sitting on the five sides of the pentagon. Because the pentagon is equiangular, each of its angles has measure $\frac{180^\circ (5-2)}{5}=108^\circ,$ and so the base angles of the aforementioned triangles (i.e., the angles adjacent to the pentagon) have measure $180^\circ - 108^\circ = 72^\circ.$ The base angles are equal, so the triangles must be isosceles.

Let one of the sides of the pentagon have length $x_1$ (and the others $x_2, x_3, x_4, x_5$). Then, by trigonometry, the non-base sides of the triangle sitting on that side of the pentagon each has length $\frac{x_1}{2} \sec 72^\circ,$ and so the two sides together have length $x_1\sec 72^\circ.$ To find the perimeter of the star, we sum up the lengths of the non-base sides for each of the five triangles to get ($x_1+x_2+x_3+x_4+x_5) \sec 72^\circ = (1) \sec 72^\circ = \sec 72^\circ (b$ecause the perimeter of the pentagon is 1). The perimeter of the star is constant, so the difference between the maximum and minimum perimeters is $\boxed{\textbf{(A)} \ 0}.$
## Solution 2
The extreme case, that results in the minimum and/or maximum, would probably be a pentagon that approaches a degenerate pentagon. However, due to the way the problem is phrased, we know there exists a minimum and maximum; therefore, we can reasonably assume that the star's perimeter is constant, and answer with $\boxed{\textbf{(A)} \ 0}.$
## See also
