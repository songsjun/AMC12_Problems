# 2007 AMC 12B Problem 16

## Problem
Each face of a regular tetrahedron is painted either red, white, or blue. Two colorings are considered indistinguishable if two congruent tetrahedra with those colorings can be rotated so that their appearances are identical. How many distinguishable colorings are possible?


$$\mathrm{(A)}\ 15 \qquad \mathrm{(B)}\ 18 \qquad \mathrm{(C)}\ 27 \qquad \mathrm{(D)}\ 54 \qquad \mathrm{(E)}\ 81$$

## Video Solution
https://youtu.be/0W3VmFp55cM?t=5067

*~pi_is_3.14*
## Solution 1
A tetrahedron has 4 sides. We can ignore the rotation part of the question completely and focus on the colors.
The ratio of the number of faces with each color must be one of the following:

4:0:0, 3:1:0, 2:2:0, or 2:1:1

The first ratio yields 3 appearances, one of each color.

The second ratio yields $3\cdot 2 = 6$ appearances, three choices for the first color, and two choices for the second.

The third ratio yields $\binom{3}{2} = 3$ appearances since the two colors are interchangeable.

The fourth ratio yields 3 appearances. There are three choices for the first color, and since the second two colors are interchangeable, there is only one distinguishable pair that fits them.

The total is $3 + 6 + 3 + 3 = 15$ appearances $\Rightarrow \mathrm{(A)}$
## Solution 2
Every colouring can be represented in the form (w,r,b), where w is the number of white faces, r is the number of red faces, and b is the number of blue faces. Every distinguishable colouring pattern can be represented like this in exactly one way, and every ordered whole number triple with a total sum of 4 represents exactly one colouring pattern (if two tetrahedra have rearranged colours on their faces, it is always possible to rotate one so that it matches the other).

Therefore, the number of colourings is equal to the number of ways 3 distinguishable nonnegative integers can add to 4. If you have 6 cockroaches in a row, this number is equal to the number of ways to pick two of the cockroaches to eat for dinner (because the remaining cockroaches in between are separated in to three sections with a non-negative number of cockroaches each), which is $\binom{6}{2} = 15$

Alternative explanation to solution 2:
A regular tetrahedron is the only platonic solid in which any of the faces is adjacent to all the other 3 faces. Hence we only need to think about the number of faces we can colour for each face. Let the number of faces coloured with red, blue and white be r, b, w respectively. So we are solving for the number of solutions of the equation:
$$r + b + w = 4$$
for nonnegative integers r, b, w. By Stars and Bars, we obtain the final answer which is $\binom{6}{2} = 15$/(A)
## See Also
