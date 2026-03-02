# 2023 AMC 12A Problem 21

> This problem is the same as [2023 AMC 10A #25](https://artofproblemsolving.com/wiki/index.php/2023_AMC_10A_Problems/Problem_25) and [2023 AMC 12A #21](https://artofproblemsolving.com/wiki/index.php/2023_AMC_12A_Problems/Problem_21).
## Problem
If A and B are vertices of a polyhedron, define the distance d(A,B) to be the minimum number of edges of the polyhedron one must traverse in order to connect A and B. For example, if $\overline{AB}$ is an edge of the polyhedron, then d(A, B) = 1, but if $\overline{AC}$ and $\overline{CB}$ are edges and $\overline{AB}$ is not an edge, then d(A, B) = 2. Let Q, R, and S be randomly chosen distinct vertices of a regular icosahedron (regular polyhedron made up of 20 equilateral triangles). What is the probability that d(Q, R) > d(R, S)?

$\textbf{(A) } \frac{7}{22} \qquad \textbf{(B) } \frac{1}{3} \qquad \textbf{(C) } \frac{3}{8} \qquad \textbf{(D) } \frac{5}{12} \qquad \textbf{(E) } \frac{1}{2}$
## Solution 1
To find the total amount of vertices we first find the amount of edges, and that is $\frac{20 \times 3}{2}.$ Next, to find the amount of vertices we can use Euler's characteristic, V - E + F = 2, and therefore the amount of vertices is 12

So there are $\binom{12}{3} = 220$ ways to choose 3 distinct points.

Now, the furthest distance we can get from one point to another point in an icosahedron is 3. Which gives us a range of 1 $\leq$ d(Q, R), d(R, S) $\leq 3$

With some case work, we get two cases:

Case 1: d(Q, R) = 3; d(R, S) = 1, 2

Since we have only one way to choose Q, that is, the opposite point from R, we have one option for Q and any of the other points could work for S.

Then, we get 12 $\times 1 \times 10 = 120 (w$ays to choose R × ways to choose Q × ways to choose S)

Case 2: d(Q, R) = 2; d(R, S) = 1

We can visualize the icosahedron as 4 rows, first row with 1 vertex, second row with 5 vertices, third row with 5 vertices and fourth row with 1 vertex. We set R as the one vertex on the first row, and we have 12 options for R. Then, Q can be any of the 5 points on the third row and finally S can be one of the 5 points on the second row.

Therefore, we have 12 $\times 5 \times 5 = 300 (w$ays to choose R × ways to choose Q × ways to choose S)

In total, we have 420 ways, but we must divide by 3! to account for permutations, giving us $70/220 =\boxed{\textbf{(A) } 7/22}.$

*~lptoggled, edited by [https://artofproblemsolving.com/wiki/index.php/User:grogg007 grogg007], ESAOPS, weimi23, and trevian1*
## Solution 2 (Cheese + Actual way)
In total, there are $\binom{12}{3}=220$ ways to select the points. However, if we look at the denominators of B,C,D, they are 3,8,12 which are not divisors of 220. Also $\frac{1}{2}$ is impossible as cases like d(Q, R) = d(R, S) exist. The only answer choice left is $\boxed{\textbf{(A) } \frac{7}{22}}$

Note: this cheese is actually wrong because the total number of ways to select the points is actually 12 $\times 11 \times 10 = 1320$ as order matters, so all denominators are possible. Rather, you can arrive at the same conclusion by fixing R WLOG, leading to 11 $\times 10 = 110$ ways in total, which works for the original cheese.. ~awesomeguy856

(Actual way)

Fix an arbitrary point, to select the rest 2 points, there are $11\cdot 10 =110$ ways. To make d(Q, R)=d(R, S), $d=1/2$. Which means there are in total $2\cdot 5 \cdot 4 = 40$ ways to make the distance the same. $\frac{1}{2}(1-\frac{40}{110})= \boxed{\textbf{(A) } \frac{7}{22}}$
*~bluesoul*
## Solution 3
We can imagine the icosahedron as having 4 layers. 1 vertex at the top, 5 vertices below connected to the top vertex, 5 vertices below that which are 2 edges away from the top vertex, and one vertex at the bottom that is 3 edges away. WLOG because the icosahedron is symmetric around all vertices, we can say that R is the vertex at the top. So now, we just need to find the probability that S is on a layer closer to the top than Q. We can do casework on the layer S is on to get

$$\frac{5}{11} \cdot \frac{6}{10} + \frac{5}{11} \cdot \frac{1}{10} = \frac{35}{110} = \frac{7}{22}$$

So the answer is $\boxed{\textbf{(A) }\frac{7}{22}}.$

*~awesomeparrot*
## Solution 4
We can actually see that the probability that d(Q, R) > d(R, S) is the exact same as d(Q, R) < d(R, S) because d(Q, R) and d(R, S) have no difference. (In other words, we can just swap Q and S, meaning that can be called the same probability-wise.) Therefore, we want to find the probability that d(Q, R) = d(R, S).

WLOG, we can rotate the icosahedron so that R is the top of the icosahedron. Then we can divide this into 2 cases:

1. They are on the second layer

There are 5 ways to put one point, and 4 ways to put the other point such that d(Q, R) = d(R, S) = 1. So, there are 5 $\cdot 4 = 20$ ways to put them on the second layer.

2. They are on the third layer

There are 5 ways to put one point, and 4 ways to put the other point such that d(Q, R) = d(R, S) = 2. So, there are 5 $\cdot 4 = 20$ ways to put them on the third layer.

The total number of ways to choose P and S are 11 $\cdot 10 = 110 (b$ecause there are 12 vertices), so the probability that d(Q, R) = d(R, S) is $\frac{20+20}{110} = \frac{4}{11}.$

Therefore, the probability that d(Q, R) > d(R, S) is $\frac{1 - \frac{4}{11}}{2} = \boxed{\textbf{(A) }\frac{7}{22}}$

*~Ethanzhang1001*
## Solution 5
We know that there are 20 faces. Each of those faces has 3 borders (since each is a triangle), and each edge is used as a border twice (for each face on either side). Thus, there are $\dfrac{20\cdot3}2=30$ edges.

Euler's formula states that V-E+F=2 for all convex polyhedra, so we know that 2-F+E=12 vertices.

The answer can be counted by first counting the number of possible paths that will yield d(Q, R) > d(R, S) and dividing it by $12\cdot11\cdot10 (o$r $\dbinom{12}3,$ depending on the approach). In either case, one will divide by 11 somewhere in the denominator. We can then hope that there will be no factor of 11 in the numerator (which would cancel the 11 in the denominator out), and answer the only option that has an 11 in the denominator: $\boxed{\textbf{(A) }\frac{7}{22}}.$

*~Technodoggo(minor edits by Gannit)*

Additional note by "Fruitz": One can eliminate 1/2 by symmetry if you swap the new sign.

Another note by "andliu766": A shorter way to find the number of vertices and edges is to use the fact that the MAA logo is an icosahedron. :)
## Solution 6 (Case Work(similar to 3))
[center|200px](https://artofproblemsolving.com/wiki/index.php/File:2023AMC12AP21.png)

WLOG, let R be at the top-most vertex of the icosahedron. There are 2 cases where d(Q, R) > d(R, S).

Case 1: Q is at the bottom-most vertex

If Q is at the bottom-most vertex, no matter where S is, d(Q, R) > d(R, S). The probability that Q is at the bottom-most vertex is $\frac{1}{11}$

Case 2: Q is at the second layer

If Q is at the second layer, S must be at the first layer, for d(Q, R) > d(R, S) to be true. The probability that Q is at the second layer, and S is at the first layer is $\frac{5}{11} \cdot \frac{5}{10} = \frac{5}{22}$

$$\frac{1}{11} + \frac{5}{22} = \boxed{\textbf{(A) }\frac{7}{22}}$$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
### Supplement
First, we have 20 faces of equilateral triangles. But each edge is shared by two faces hence there are thus $\frac{20 \cdot 3}{2}=30$ edges.

Now by Euler's formula V-E+F=2 $\Rightarrow V-30+20=2 \Rightarrow V=12.$

Furthermore, the number of triangles (n) that meet at one vertex can be found as follows. Note that there are 12 total vertices. Without accounting for overcounting, $\text{total number of vertices} = \text{number of faces} \cdot \text{vertices per face} = 20 \cdot 3 = 60.$ But since we now know that there are only 12 vertices and that each vertex is shared by n triangles, you find that there are 5 triangles that meet at one vertex.

Once we pick R as the topmost vertex, there are 11 possible vertices remaining for Q. Continue as follows in this solution.

*~mathboy282*
## Solution 7 (efficient)
Since the icosahedron is symmetric polyhedron, we can rotate it so that R is on the topmost vertex. Since Q and
S basically the same, we can first count the probability that d(Q,R) = d(R,S).

$\mathfrak{Case}$ \ $\mathfrak{1}$: d(Q,R) = d(R,S) = 1

There are 5 points P such that d(Q,P) = 1. There is 5 $\times 4 = \boxed{20}$ ways to choose Q and S in this case.

$\mathfrak{Case}$ \ $\mathfrak{2}$: d(Q,R) = d(R,S) = 2

There are 5 points P such that d(Q,P) = 2. There is 5 $\times 4 = \boxed{20}$ ways to choose Q and S in this case.

$\mathfrak{Case}$ \ $\mathfrak{3}$: d(Q,R) = d(R,S) = 3

There is 1 point P such that d(Q,P) = 3. There is 1 $\times 0 = \boxed{0}$ ways to choose Q and S in this case.

$\mathfrak{Final}$ \ $\mathfrak{solution}$

There are 11 points P that are distinct from R. There is 11 $\times 10 = \boxed{110}$ ways to choose Q and S. There is 20 + 20 + 0 = $\boxed{40}$ ways to choose Q and S such that d(Q,R) = d(R,S). There is $\frac{110-40}{2} = 35$ ways to choose Q and S such that d(Q, R) > d(R, S). The probability that d(Q, R) > d(R, S) is therefore $\frac{35}{110} = \frac{7}{22}$ which corresponds to answer choice $\boxed{A}$

~~[https://artofproblemsolving.com/wiki/index.php/User:Afly afly]
## Solution 8 (Dodecahedron Schlegel (Planar Graph) Diagram)
[file:A-plane-representation-of-the-dodecahedron.png](https://artofproblemsolving.com/wiki/index.php/file:A-plane-representation-of-the-dodecahedron.png)

Instead of thinking this problem as vertices of a icosahedron, think of it as faces of a dodecahedron. Our middle face is R and we first choose Q and S to be the faces with distance 1 from the middle face. There are $\binom{5}{2}$ ways of doing that. Then we choose Q and S to be the faces with distance 2 from the middle face. There are $\binom{5}{2}$ ways of doing that. Our answer is therefore $\frac{1}{2}\left(1-\frac{2\binom{5}{2}}{\binom{11}{2}}\right)=\boxed{\textbf{(A) }\frac{7}{22}}$

*~lopkiloinm*

Note: You can do the same analysis on the vertices of the icosahedron using its diagram, which is less to draw because it has fewer (12) vertices and the same number (30) of edges. But this diagram is either less symmetrical or non-planar. (There's no good place to put the last vertex (diametrically opposite the first/central vertex), except in the same place as the first vertex.)
## Solution 9 (Symmetry)
Note that the vertices of an icosahedron are in a 1-5-5-1 configuration.

We will denote the probability of event A happening as P(A)

We should also note that P(d(Q, R) > d(R, S)) + P(d(Q, R) < d(R, S)) + P(d(Q, R) = d(R, S)) = 1

Also, P(d(Q, R) > d(R, S)) = P(d(Q, R) < d(R, S)) since Q and S are basically the same.

Therefore, what we are trying to find is just $\frac{1-P(d(Q, R) = d(R, S))}{2}$ which can easily be computed when we fix R at the top vertex in the 1-5-5-1 structure.

Since all the points are distinct (stated in problem), the conditions are only satisfied where Q and S are at $5s$ of the 1-5-5-1 structure.

P(d(Q, R) = d(R, S)) = 2 $\cdot \frac{5}{11} \cdot \frac{4}{10} = \frac{4}{11}$ since we have to choose one of the 5 out of 11 possible vertices and another one of 4 out of 10 two times.

And the answer is $\frac{1-\frac{4}{11}}{2} = \boxed{ \textbf{(A) } \frac{7}{22}}$

*~jjaamm*
## Video Solution by Little Fermat
https://youtu.be/h2Pf2hvF1wE?si=5rhpccHQjb0-_X_Q&t=5615
*~little-fermat*
## Video Solution by Math-X
https://youtu.be/GP-DYudh5qU?si=khqcGMD9llQrHbKz&t=9770

*~Math-X*
## Video Solution
https://youtu.be/4PSrAbrjKVg?si=G24hhBrhUPio9SZD

*~MathProblemSolvingSkills.com*
## Video Solution by OmegaLearn
https://youtu.be/Wc6PFNq5PAM
## Video solution by MegaMath
https://www.youtube.com/watch?v=dxYw1wYHid4&t=12s

https://www.youtube.com/watch?v=1yLvQ0F5Z-E
## Video Solution by epicbird08
https://youtu.be/s_6q0C0z6Ug

*~EpicBird08*
## Vide Solution by SpreadTheMathLove(Casework and Complementary)
https://www.youtube.com/watch?v=4FEwxwgbliQ
## Video Solution
https://youtu.be/bS3tle-jP4g

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Video Solution by TheBeautyofMath
https://youtu.be/ZvrlZ2NoH8s

*~IceMatrix*
## See also
