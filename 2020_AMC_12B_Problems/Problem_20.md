# 2020 AMC 12B Problem 20

## Problem
Two different cubes of the same size are to be painted, with the color of each face being chosen independently and at random to be either black or white. What is the probability that after they are painted, the cubes can be rotated to be identical in appearance?

$\textbf{(A)}\ \frac{9}{64} \qquad\textbf{(B)}\ \frac{289}{2048} \qquad\textbf{(C)}\ \frac{73}{512} \qquad\textbf{(D)}\ \frac{147}{1024} \qquad\textbf{(E)}\ \frac{589}{4096}$
## Solution
Define two ways of painting to be in the same class if one can be rotated to form the other.

We can count the number of ways of painting for each specific class.

Case 1: Black-white color distribution is 0-6 (out of 6 total faces)

Trivially 1^2 = 1 way to paint the cubes.

Case 2: Black-white color distribution is 1-5

Trivially all $\dbinom{6}{5} = 6$ ways belong to the same class, so $6^2$ ways to paint the cubes.

Case 3: Black-white color distribution is 2-4

There are two classes for this case: the class where the two black faces are touching and the other class where the two black faces are on opposite faces. There are 3 members of the latter class since there are 3 unordered pairs of 2 opposite faces of a cube. Thus, there are $\dbinom{6}{4} - 3 = 12$ members of the former class. Thus, 12^2 + 3^2 ways to paint the cubes for this case.

Case 4: Black-white color distribution is 3-3

By simple intuition, there are also two classes for this case, the class where the three black faces meet at a single vertex, and the other class where the three black faces are in a "straight line" along the edges of the cube. Note that since there are 8 vertices in a cube, there are 8 members of the former class and $\dbinom{6}{3} - 8 = 12$ members of the latter class. Thus, 12^2 + 8^2 ways to paint the cubes for this case.

Note that by symmetry (since we are only switching the colors), the number of ways to paint the cubes for black-white color distributions 4-2, 5-1, and 6-0 is 2-4, 1-5, and 0-6 (respectively).

Thus, our total answer is$\frac{2(6^2 + 1^2 + 12^2 + 3^2) + 12^2 + 8^2}{2^{12}} = \frac{588}{4096} = \boxed{\textbf{(D) } \frac{147}{1024}}.$

*~fidgetboss_4000*
## Video Solution (HOW TO THINK CREATIVELY!!!)
https://youtu.be/n9zwaCZnDPg

*~Education, the Study of Everything*
## Video Solution by BeautyofMath
https://youtu.be/V5qI12icrm8
## See Also
