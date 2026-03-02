# 2012 AMC 12A Problem 22

## Problem
Distinct planes $p_1,p_2,....,p_k$ intersect the interior of a cube Q. Let S be the union of the faces of Q and let  P =$\bigcup_{j=1}^{k}p_{j}$ . The intersection of P and S consists of the union of all segments joining the midpoints of every pair of edges belonging to the same face of Q. What is the difference between the maximum and minimum possible values of k?

$\textbf{(A)}\ 8\qquad\textbf{(B)}\ 12\qquad\textbf{(C)}\ 20\qquad\textbf{(D)}\ 23\qquad\textbf{(E)}\ 24$
## Solution
> [Asymptote diagram - not rendered in Markdown]

```asy
pair A=(0,0), B=(2,0), C=(2,2), D=(0,2), E=(-1,3), F=(1,3), G=(1,1), H=(-1,1), I=(1,0), J=(2,1), K=(1,2), L=(0,1), M=(-0.5,0.5), N=(-1,2), O=(-0.5,2.5), P=(0,3), Q=(1.5,2.5), R=(1,2), S=(1.5,0.5), T=(0,1); draw(A--B--C--D--E--F); draw(H--A); draw(A--D); draw(H--E); draw(F--C); draw(H--G--F); draw(G--B); label("$A$",A,SW); label("$B$",B,SE); label("$C$",C,NE); label("$D$",D,SW); label("$E$",E,NW); label("$F$",F,NE); label("$G$",G,NE); label("$H$",H,SW);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
pair A=(0,0), B=(2,0), C=(2,2), D=(0,2), E=(-1,3), F=(1,3), G=(1,1), H=(-1,1), I=(1,0), J=(2,1), K=(1,2), L=(0,1), M=(-0.5,0.5), N=(-1,2), O=(-0.5,2.5), P=(0,3), Q=(1.5,2.5), R=(1,2), S=(1.5,0.5), T=(0,1); draw(A--B--C--D--E--F); draw(H--A); draw(A--D); draw(H--E); draw(F--C); draw(I--J--K--L--I); draw(I--K); draw(J--L); draw(K--Q--P--O--K); draw(K--P); draw(Q--O); draw(O--L--M--N--O); draw(O--M); draw(L--N); label("$A$",A,SW); label("$B$",B,SE); label("$C$",C,NE); label("$D$",D,SW); label("$E$",E,NW); label("$F$",F,NE); label("$H$",H,SW);
```


We need two different kinds of planes that only intersect Q at the mentioned segments (we call them *traces* in this solution). These will be all the possible $p_j$'s.

First, there are two kinds of segments joining the midpoints of every pair of edges belonging to the same face of Q: *long traces* are those connecting the midpoint of opposite sides of the same face of Q, and *short traces* are those connecting the midpoint of adjacent sides of the same face of Q.

Suppose $p_j$ contains a short trace $t_1$ of a face of Q. Then it must also contain some trace $t_2$ of an adjacent face of Q, where $t_2$ share a common endpoint with $t_1$. So, there are three possibilities for $t_2$, each of which determines a plane $p_j$ containing both $t_1$ and $t_2$.

**Case 1:** $t_2$ makes an acute angle with $t_1$. In this case, $p_j\cap Q$ is an equilateral triangle made by three short traces. There are 8 of them, corresponding to the 8 vertices.

**Case 2:** $t_2$ is a long trace. p $\cap Q$ is a rectangle. Each pair of parallel faces of Q contributes 4 of these rectangles so there are 12 such rectangles.

**Case 3:** $t_2$ is the short trace other than the one described in case 1, i.e. $t_2$ makes an obtuse angle with $t_1$. It is possible to prove that p $\cap Q$ is a regular hexagon (See note #1 for a proof) and there are 4 of them.

**Case 4:** $p_j$ contains no short traces. This can only make $p_j\cap Q$ be a square enclosed by long traces.  There are 3 such squares.

In total, there are $8+12+4+3=27$ possible planes in P. So the maximum of k is 27.

On the other hand, the most economic way to generate these long and short traces is to take all the planes in case 3 and case 4. Overall, they intersect at each trace exactly once (there is a quick way to prove this. See note #2 below.) and also covered all the $6\times 4 + 4\times 3 = 36$ traces. So the minimum of k is 7. The answer to this problem is then $27-7=20$ ... \framebox{C}.

----

**Note 1**: Indeed, let $t_1$=AB where B=t_$1\capt_2$, and C be the other endpoint of $t_2$ that is not B. Draw a line through C parallel to $t_1$. This line passes through the center O of the cube and therefore we see that the reflection of A,B,C, denoted by A', B', C', respectively, lie on the same plane containing A,B,C. Thus $p_j\cap Q$ is the regular hexagon ABCA'B'C'. To count the number of these hexagons, just notice that each short trace uniquely determine a hexagon (by drawing the plane through this trace and the center), and that each face has 4 short traces. Therefore, there are 4 such hexagons.

**Note 2**: The quick way to prove the fact that none of the planes described in case 3 and case 4 share the same trace is as follows: each of these plane contains the center and therefore the intersection of each pair of them is a line through the center, which obviously does not contain any traces.
## Video Solution by Richard Rusczyk
https://artofproblemsolving.com/videos/amc/2012amc12a/251

*~dolphin7*
## See Also
