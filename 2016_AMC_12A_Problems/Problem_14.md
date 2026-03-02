# 2016 AMC 12A Problem 14

## Problem
Each vertex of a cube is to be labeled with an integer $1$ through $8$, with each integer being used once, in such a way that the sum of the four numbers on the vertices of a face is the same for each face. Arrangements that can be obtained from each other through rotations of the cube are considered to be the same. How many different arrangements are possible?

$\textbf{(A) } 1\qquad\textbf{(B) } 3\qquad\textbf{(C) }6 \qquad\textbf{(D) }12 \qquad\textbf{(E) }24$
## Solution 1
Note that the sum of the numbers on each face must be 18, because $\frac{1+2+\cdots+8}{2}=18$.

So now consider the opposite edges (two edges which are parallel but not on same face of the cube); they must have the same sum value too.

**Note:** It is not too hard to see this through making one side $a$ (another way of saying this is to have two vertices have a sum of $a$), the side on the same face and parallel to it $b.$ Then, the side diametrically opposite to $a$ must also have a side length of $a$ in order to maintain the constant face sum $a+b.$) ~mathboy282

Now think about the points $1$ and $8$. If they are not on the same edge, they must be endpoints of opposite edges, and we should have $1+X=8+Y$. However, this scenario would yield no solution for $[7,2]$, which is a contradiction. (Try drawing out the cube if it doesn't make sense to you.)

The points $1$ and $8$ are therefore on the same side and all edges parallel must also sum to $9$.

Now we have $4$ parallel sides $1-8, 2-7, 3-6, 4-5$.
Thinking about $4$ endpoints, we realize they need to sum to $18$.
It is easy to notice only $1-7-6-4$ and $8-2-3-5$ would work.

So if we fix one direction $1-8 ($or $8-1)$ all other $3$ parallel sides must lay in one particular direction. $(1-8,7-2,6-3,4-5)$ or $(8-1,2-7,3-6,5-4)$

Now, the problem is the same as arranging $4$ points in a two-dimensional square, which is $\frac{4!}{4}=\boxed{\textbf{(C) }6.}$ This is because for every single arrangement, there is only one way to finish the cube. - AGDude
## Solution 2
Again, all faces sum to $18.$ If $x,y,z$ are the vertices next to $1$, then the remaining vertices are $17-x-y, 17-y-z, 17-x-z, x+y+z-16.$ Now it remains to test possibilities. Note that we must have $x+y+z>17.$ Without loss of generality, let $x<y<z.$


$$3,7,8\text{: Does not work.}$$




$$4,6,8\text{: Works.}$$


$$4,7,8\text{: Works.}$$




$$5,6,7\text{: Does not work.}$$


$$5,6,8\text{: Does not work.}$$


$$5,7,8\text{: Does not work.}$$


$$6,7,8\text{: Works.}$$


Keeping in mind that a) solutions that can be obtained by rotating each other count as one solution and b) a cyclic sequence is always asymmetrical, we can see that there are two solutions (one with $[x, y, z]$ and one with $[z, y, x]$) for each combination of $x$, $y$, and $z$ from above. So, our answer is $\cdot 2=\boxed{\textbf{(C) }6.}$ - AGDude
## Solution 3
We know the sum of each face is $18.$ If we look at an edge of the cube whose numbers sum to $x$, it must be possible to achieve the sum $18-x$ in two distinct ways, looking at the two faces which contain the edge. If $8$ and $6$ were on the same edge, it is possible to achieve the desired sum only with the numbers $1$ and $3$ since the values must be distinct. Similarly, if $8$ and $7$ were on the same edge, the only way to get the sum is with $1$ and $2$. This means that $6$ and $7$ are not on the same edge as $8$, or in other words they are diagonally across from it on the same face, or on the other end of the cube.

Now we look at three cases, each yielding two solutions which are reflections of each other:

1) $6$ and $7$ are diagonally opposite $8$ on the same face.

2) $6$ is diagonally across the cube from $8$, while $7$ is diagonally across from $8$ on the same face.

3) $7$ is diagonally across the cube from $8$, while $6$ is diagonally across from $8$ on the same face.

This means the answer is $\cdot 2=\boxed{\textbf{(C) }6.}$
## Solution 4 (Blitz)
Label the vertices of the cube 1 - 8, with 1, 2, 3, 4 on one face and 5, 6, 7, 8 on the opposite face. There are $4^2$ ways to swap two edges. This gives 16 swapped vertices, now we count invalid applications.

Case 1: 2 Vertices are swapped.

We see that if we swap two vertices, there are some cases where you can form the same two pairs by a rotation. Therefore, we count the ways this can happen. There are only 2 ways, and those are the diagonals, but notice how you can rotate the cube from one diagonal to the other. This cancels out one of the cases, giving us 1 case that is invalid.

Case 2: 3 Vertices are swapped.

We see that for each face, we have 4 cases for each face. Either 1 stays put, 2 stays put, 3 stays put, etc. So there are a total of 8 cases here which are invalid.

Case 3: 4 Vertices are swapped.

It is quite obvious that if you swap all 4 vertices, a simple rotation can just map one figure onto the other. There is then 1 invalid case, which is the only case.

With the 16 possible swaps, we subtract $8 + 1 + 1 = 10$ invalid cases. We are left with $16-10=6$, or $\boxed{\textbf{(C) }6.}$

*~Pinotation*
## Video Solution
https://www.youtube.com/watch?v=enRv3Z4Mv5k
## Video Solution by TheBeautyofMath
https://youtu.be/yJFQ2lsh6wg

*~IceMatrix*
## Video Solution
https://www.youtube.com/watch?v=mdA7nt959KE with comprehensive approach

*~Mathkidsmax*
## See Also
