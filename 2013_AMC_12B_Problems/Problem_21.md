# 2013 AMC 12B Problem 21

## Problem
Consider the set of 30 parabolas defined as follows: all parabolas have as focus the point (0,0) and the directrix lines have the form y=ax+b with a and b integers such that $a\in\{-2,-1,0,1,2\}$ and $b\in\{-3,-2,-1,1,2,3\}$. No three of these parabolas have a common point. How many points in the plane are on two of these parabolas?

$\textbf{(A)}\ 720\qquad\textbf{(B)}\ 760\qquad\textbf{(C)}\ 810\qquad\textbf{(D)}\ 840\qquad\textbf{(E)}\ 870$
## Solution 1
Being on two parabolas means having the same distance from the common focus and both directrices. In particular, you have to be on an angle bisector of the directrices, and clearly on the same "side" of the directrices as the focus. So it's easy to see there are at most two solutions per pair of parabolae. Convexity and continuity imply exactly two solutions unless the directrices are parallel and on the same side of the focus.

So out of $2\dbinom{30}{2}$ possible intersection points, only $2*5*2*\dbinom{3}{2}$ fail to exist. This leaves $870-60=810=\boxed{\textbf{(C)} \ 810}$ solutions.
## Solution 2
Through similar reasoning as above in Solution I, determine that two parabolas that have a common focus intersect zero times if their directrixes are parallel and the focus lies on the same side of both directrixes, and intersect twice otherwise. Thereby, as each parabola will intersect $30-3 = 27$ other parabolas twice, we see that the answer is 2 $\times \frac{30 \times 27}{2} = \boxed{810}.$
## See also
