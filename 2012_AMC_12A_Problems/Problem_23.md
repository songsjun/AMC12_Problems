# 2012 AMC 12A Problem 23

## Problem
Let S be the square one of whose diagonals has endpoints (1/10,7/10) and (-1/10,-7/10).  A point v=(x,y) is chosen uniformly at random over all pairs of real numbers x and y such that 0 $\le$ x $\le 2012$ and $0\ley\le 2012.$  Let T(v) be a translated copy of S centered at v.  What is the probability that the square region determined by T(v) contains exactly two points with integer coefficients in its interior?

$\textbf{(A)}\ \frac{1}{8}\qquad\textbf{(B) }\frac{7}{50}\qquad\textbf{(C) }\frac{4}{25}\qquad\textbf{(D) }\frac{1}{4}\qquad\textbf{(E) }\frac{8}{25}$
## Solution
> [Asymptote diagram - not rendered in Markdown]

```asy
pair A=(0.1,0.7), C=(-0.1,-0.7), B=(-0.7,0.1), D=(0.7,-0.1), X=(1,0), W=(-1,0), Y=(0,1), Z=(0,-1); draw (A--B--C--D--A); draw(A--C); draw(B--D); draw(W--X); draw(Y--Z); label("$(0.1,0.7)$",A,NE); label("$(-0.1,-0.7)$",C,SW); label("$x$",X,NW); label("$y$",Y,NE);
```


The unit square's diagonal has a length of $\sqrt{0.2^2 + 1.4^2} = \sqrt{2}.$ Because S square is not parallel to the axis, the two points must be adjacent.

Now consider the unit square U with vertices (0,0), (1,0), (1,1) and (0,1). Let us first consider only two vertices, (0,0) and (1,0). We want to find the area of the region within U that the point v=(x,y) will create the translation of S, T(v) such that it covers both (0,0) and (1,0). By symmetry, there will be three equal regions that cover the other pairs of adjacent vertices.

For T(v) to contain the point (0,0), v must be inside square S. Similarly, for T(v) to contain the point (1,0), v must be inside a translated square S with center at (1,0), which we will call S'. Therefore, the area we seek is Area(U $\cap S \cap S$').

To calculate the area, we notice that Area(U $\cap S \cap S$') = $\frac{1}{2} \cdot$ Area(S $\cap S$') by symmetry. Let $S_$1 = (0.1, 0.7), $S_2$ = (0.7, -0.1), S'_1 = (1.1, 0.7), S'_2 = (0.3, 0.1). Let M = (0.7, 0.4) be the midpoint of S'_1S'_2, and N = (0.7, 0.7) along the line $S_1S$'_1. Let I be the intersection of S and S' within U, and J be the intersection of S and S' outside U. Therefore, the area we seek is $\frac{1}{2} \cdot$ Area(S $\cap S$') = $\frac{1}{2}$ [IS'_$2JS_2$]. Because $S_2$, M, N all have x coordinate 0.7, they are collinear. Noting that the side length of S and S' is 1 (as shown above), we also see that $S_2M$ = MS'_1 = 0.5, so $\triangle{S'_1NM}$\cong $\triangle{S_2IM}.$ If follows that $IS_2$ = NS'_1 = 1.1 - 0.7 = 0.4 and IS'_2 = MS'_2 - MI = MS'_2 - MN = 0.5 - 0.3 = 0.2. Therefore, the area is $\frac{1}{2} \cdot$ Area(S $\cap S$') = $\frac{1}{2}$ [IS'_$2JS_$2] = $\frac{1}{2} \cdot 0.2 \cdot 0.4 = 0.04.$

Because there are three other regions in the unit square U that we need to count, the total area of v within U such that T(v) contains two adjacent lattice points is 0.04 $\cdot 4 = 0.16.$

By periodicity, this probability is the same for all 0 $\le$ x $\le 2012$ and 0 $\le$ y $\le 2012.$ Therefore, the answer is  0.16 = $\boxed{\frac{4}{25} \textbf{(C)} }$
## Video Solution by Richard Rusczyk
https://artofproblemsolving.com/videos/amc/2012amc12a/254
## See Also
