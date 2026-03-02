# 2010 AMC 12A Problem 9

> This problem is the same as [2010 AMC 12A #9](https://artofproblemsolving.com/wiki/index.php/2010_AMC_12A_Problems) and [2010 AMC 10A #17](https://artofproblemsolving.com/wiki/index.php/2010_AMC_10A_Problems).
## Problem
A solid cube has side length 3 inches. A 2-inch by 2-inch square hole is cut into the center of each face. The edges of each cut are parallel to the edges of the cube, and each hole goes all the way through the cube. What is the volume, in cubic inches, of the remaining solid?

$\textbf{(A)}\ 7 \qquad \textbf{(B)}\ 8 \qquad \textbf{(C)}\ 10 \qquad \textbf{(D)}\ 12 \qquad \textbf{(E)}\ 15$
## Solution
### Solution 1
Imagine making the cuts one at a time. The first cut removes a box $2\times 2\times 3.$ The second cut removes two boxes, each of dimensions $2\times 2\times 0.5,$ and the third cut does the same as the second cut, on the last two faces. Hence the total volume of all cuts is $12 + 4 + 4 = 20$.

Therefore the volume of the rest of the cube is $3^3 - 20 = 27-20 =\boxed{7\ \textbf{(A)}}.$
### Solution 2
We can visualize it has a 3 by 3 cube with a hollow 2 by 2 center, along with 6 "windows" cut out too. The cube formula gives the volume of the 3 by 3 cube as $3^3 = 27$ and 2^3 = 8. Additionally, the area of the "windows" is the 2x2 cut along with a thickness of $\frac{(3-2)}{2} = \frac{1}{2}.$ The volume of all 6 windows is $6($\frac{1}{2})(2)(2) = $12.$ This gives us our answer of 27 - 8 - $12 =\boxed{7\ \textbf{(A)}}.$
### Solution 3
We can use [Principle of Inclusion-Exclusion](https://artofproblemsolving.com/wiki/index.php/Principle_of_Inclusion-Exclusion) (PIE) to find the final volume of the cube.

There are 3 "cuts" through the cube that go from one end to the other. Each of these "cuts" has 2 $\times 2 \times 3=12$ cubic inches. However, we can not just sum their volumes, as
the central $2\times 2\times 2$ cube is included in each of these three cuts. To get the correct result, we can take the sum of the volumes of the three cuts, and subtract the volume of the central cube twice.

Hence the total volume of the cuts is $3(2 $\times 2 \times 3) - $2(2\times 2\times 2) = 36 - 16 = 20.$

Therefore the volume of the rest of the cube is $3^3 - 20 = 27-20 =\boxed{7\ \textbf{(A)}}.$
### Solution 4
We can visualize the final figure and see a cubic frame. We can find the volume of the figure by adding up the volumes of the edges and corners.

Each edge can be seen as a $2\times 0.5\times 0.5$ box, and each corner can be seen as a $0.5\times 0.5\times 0.5$ box.

$$12\cdot{\frac{1}{2}} + 8\cdot{\frac{1}{8}} = 6+1 = \boxed{7\ \textbf{(A)}}.$$
## Video Solution by the Beauty of Math
https://youtu.be/rsURe5Xh-j0?t=354
## See also
