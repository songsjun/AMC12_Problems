# 2014 AMC 12B Problem 12

## Problem
A set S consists of triangles whose sides have integer lengths less than 5, and no two elements of S are congruent or similar. What is the largest number of elements that S can have?

$\textbf{(A)}\ 8\qquad\textbf{(B)}\ 9\qquad\textbf{(C)}\ 10\qquad\textbf{(D)}\ 11\qquad\textbf{(E)}\ 12$
## Solution
Define T to be the set of all integral triples (a, b, c) such that a $\ge$ b $\ge$ c, b+c > a, and a, b, c < 5. Now we enumerate the elements of T:

(4, 4, 4)

(4, 4, 3)

(4, 4, 2)

(4, 4, 1)

(4, 3, 3)

(4, 3, 2)

(3, 3, 3)

(3, 3, 2)

(3, 3, 1)

(3, 2, 2)

(2, 2, 2)

(2, 2, 1)

(1, 1, 1)

It should be clear that |S| is simply |T| minus the larger "duplicates" (e.g. (2, 2, 2) is a larger duplicate of (1, 1, 1)). Since |T| is 13 and the number of higher duplicates is 4, the answer is 13 - 4 or $\boxed{\textbf{(B)}\ 9}.$
## See also
