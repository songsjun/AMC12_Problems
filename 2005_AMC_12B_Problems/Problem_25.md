# 2005 AMC 12B Problem 25

## Problem
Six ants simultaneously stand on the six [vertices](https://artofproblemsolving.com/wiki/index.php/vertex) of a regular [octahedron](https://artofproblemsolving.com/wiki/index.php/octahedron), with each ant at a different vertex. Simultaneously and independently, each ant moves from its vertex to one of the four adjacent vertices, each with equal [probability](https://artofproblemsolving.com/wiki/index.php/probability). What is the probability that no two ants arrive at the same vertex?


$$\mathrm{(A)}\ \frac {5}{256} \qquad\mathrm{(B)}\ \frac {21}{1024} \qquad\mathrm{(C)}\ \frac {11}{512} \qquad\mathrm{(D)}\ \frac {23}{1024} \qquad\mathrm{(E)}\ \frac {3}{128}$$

## Solution
### Solution 1
We approach this problem by counting the number of ways ants can do their desired migration, and then multiply this number by the probability that each case occurs.

Let the octahedron be ABCDEF, with points B,C,D,E [coplanar](https://artofproblemsolving.com/wiki/index.php/coplanar). Then the ant from A and the ant from F must move to plane BCDE. Suppose, without loss of generality, that the ant from A moved to point B. Then, we must consider three cases.

*Case 1: Ant from point F moved to point C
On the plane, points B and C are taken. The ant that moves to D can come from either E or C. The ant that moves to E can come from either B or D. Once these two ants are fixed, the other two ants must migrate to the "poles" of the octahedron, points A and F. Thus, there are two degrees of freedom in deciding which ant moves to D, two degrees of freedom in deciding which ant moves to E, and two degrees of freedom in deciding which ant moves to A. Hence, there are 2 $\times 2 \times 2=8$ ways the ants can move to different points.

*Case 2: Ant from point F moved to point D
On the plane, points B and D are taken. The ant that moves to C must be from B or D, but the ant that moves to E must also be from B or D. The other two ants, originating from points C and E, must move to the poles. Therefore, there are two degrees of freedom in deciding which ant moves to C and two degrees of freedom in choosing which ant moves to A. Hence, there are 2 $\times 2=4$ ways the ants can move to different points.

*Case 3: Ant from point F moved to point E
By symmetry to Case 1, there are 8 ways the ants can move to different points.

Given a point B, there is a total of $8+4+8=20$ ways the ants can move to different points. We oriented the square so that point B was defined as the point to which the ant from point A moved. Since the ant from point A can actually move to four different points, there is a total of 4 $\times 20=80$ ways the ants can move to different points.

Each ant acts independently, having four different points to choose from. Hence, each ant has probability 1/4 of moving to the desired location. Since there are six ants, the probability of each case occuring is $\frac{1}{4^6} = \frac{1}{4096}.$ Thus, the desired answer is $\frac{80}{4096}= \boxed{\frac{5}{256}} \Rightarrow \mathrm{(A)}.$
### Solution 2
Let f(n) be the number of [cycle](https://artofproblemsolving.com/wiki/index.php/cycle)s of length n the can be walked among the vertices of an octahedron. For example, f(3) would represent the number of ways in which an ant could navigate 2 vertices and then return back to the original spot. Since an ant cannot stay still, f(1) = 0. We also easily see that f(2) = 1, f(3) = 2.

Now consider any four vertices of the octahedron. All four vertices will be connected by edges except for one pair. Let’s think of this as a [square](https://artofproblemsolving.com/wiki/index.php/square) with one diagonal (from top left to bottom right). EDIT: This part is wrong as if you choose the 4 vertices that have a cross section as a square, there exists no connecting diagonal.

> [Asymptote diagram - not rendered in Markdown]

```asy
size(30); defaultpen(0.6); pair A = (0,0), B=(5,0), C=(5,5), D=(0,5); draw(A--B--C--D--cycle); draw(B--D);
```

Suppose an ant moved across this diagonal; then the ant at the other end can only move across the diagonal (which creates 2-cycle, bad) or it can move to another vertex, but then the ant at that vertex must move to the spot of the original ant (which creates 3-cycle, bad). Thus none of the ants can navigate the diagonal and can either shift clockwise or counterclockwise, and so f(4) = 2.

For f(6), consider an ant at the top of the octahedron. It has four choices. Afterwards, it can either travel directly to the bottom, and then it has 2 ways back up, or it can travel along the sides and then go to the bottom, of which simple counting gives us 6 ways back up. Hence, this totals 4 $\times (2+6) = 32.$

Now, the number of possible ways is given by the sum of all possible cycles,

$$a \cdot f(2) \cdot f(2) \cdot f(2) + b \cdot f(2) \cdot f(4) + c \cdot f(3) \cdot f(3) + d \cdot f(6)$$


where the [coefficient](https://artofproblemsolving.com/wiki/index.php/coefficient)s represent the number of ways we can configure these cycles. To find a, fix any face, there are 4 adjacent faces to select from to complete the cycle. From the four remaining faces there are only 2 ways to create cycles, hence $a = 8$.

To find b, each cycle of 2 faces is distinguished by their common edge, and there are 12 edges, so $b = 12$.

To find c, each three-cycle is distinguished by the vertex, and there are 8 edges. However, since the two three-cycles are indistinguishable, $c =8/2 = 4$.

Clearly $d = 1$. Finally,

$$8(1)(1)(1) + 12(1)(2) + 4(2)(2) + (32) = 80$$

Each bug has 4 possibilities to choose from, so the probability is $\frac{80}{4^6} = \frac{5}{256}.$
## Solution 3
We use the idea of cycles.

Case 1: Two 3-cycles.
We have 4 ways to divide the faces into cycles. There are 8 faces, and once a face has been chosen, the other three vertices must form the other cycle of length 3. Then there are $2^2$ ways to choose the direction of the cycle.  There are 4 $\cdot 4 = 16.$

Case 2: Three 2-cycles.
There are 4 $\cdot 2 = 8$ ways to do so.

Case 3: One 4-cycle, one 2-cycle.
There are 12 $\cdot 2 = 24$ ways here because there are 12 different edges for the 2-cycle and we can choose the direction of the 4-cycle.

Case 4: One 6-cycle.
Visualizing the octahedron as a 4-sided pyramid pointing up above one pointing down, we look at the ways an ant can start from the top vertex and visit all vertices without revisiting one along the way and returning to the top. Because the first step must be from the top to the middle square ring, we choose one vertex to move to and will multiply the final result by four.

We divide the paths into two sub-cases.

Sub-case 1: The ant continues to the bottom vertex.  In this case, the ant has visited three corners of a square, but can not next visit the fourth corner or there will be no way to connect the remaining two vertices of the octahedron.  Thus, the ant must next visit one of the other two vertices, and that selection decides the remainder of the path.  Thus, this sub-case has 2 possible paths.

Sub-case 2: The ant continues along the "equator" square ring. By symmetry, there are two choices.  Choose one, and we will multiply the final result by two.  From that second point on the equator, there are two choices.  If it continues to a third point on the equator, there is only one path to complete the cycle.  If it next moves to the bottom vertex, there are two ways to complete the cycle. This gives a total of three possible paths.  Multiplying by 2 gives 6 for this sub-case.

There are (2 + 6) $\cdot 4 = 32$ ways here.

Overall, there are 80 cases.  Answer is 80/$2^{12} = 5/256$

*~Williamgolly + Dr. 17*
## Solution 4
Let ACEDFB be the octahedron such that points CDEF are coplanar, C/D are opposite each other and E/F are opposite each other.

The set of points that the ants from A/B can travel to is $\{C,D,E,F\}$, the set of points that the ants from C/D can travel to is $\{A,B,E,F\}$ and the set of points that the ants from E/F can travel to is $\{A,B,C,D\}$. So the problem is analogous to finding the number of ways to take 2 elements from each of these sets to make the set $\{A,B,C,D,E,F\}$.

*Case 1: Ants from E/F travel to A/B

If this occurs then the ants from C/D must travel to E/F and therefore the ants from E/F must travel to C/D. So this gives 1 case.

*Case 2: Ants from E/F travel to A/C

If this happens then one of the ants from C/D must go to B and one of the ants from A/B must go to D and the remaining ant from C/D can choose to go to E or F and then the remaining ant from A/B has only 1 choice. So this gives 2 cases.

The ants from E/F traveling to A/B is equivalent to them traveling to C/D (both remove 2 elements from another set). And the ants from E/F traveling to A/C is equivalent to them traveling to A/D or B/C or B/D (both remove 1 element from the other 2 sets). Also, for each of the 3 pairs of ants there are 2 ways the pair of ants can go to 2 points (for example, E$\mapsto A$ and F$\mapsto B$ or E$\mapsto B$ and F$\mapsto A)$ so there are $2^{3}($2\cdot1 + 4\cdot2) = 80$$ possibilties. There are a total of $2^{12}$ ways the ants can move so the answer is $\frac{80}{2^{12}} = \boxed{\textbf{(A) } \frac{5}{256}}.$
*~LuisFonseca123*
## See Also
