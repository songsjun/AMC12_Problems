# 2009 AMC 12B Problem 25

## Problem
The set G is defined by the points (x,y) with integer coordinates, $3\le$|x|$\le7, 3\le$|y|$\le7.$ How many squares of side at least 6 have their four vertices in G?


> [Asymptote diagram - not rendered in Markdown]

```asy
defaultpen(black+0.75bp+fontsize(8pt)); size(5cm); path p = scale(.15)*unitcircle; draw((-8,0)--(8.5,0),Arrow(HookHead,1mm)); draw((0,-8)--(0,8.5),Arrow(HookHead,1mm)); int i,j; for (i=-7;i<8;++i) { for (j=-7;j<8;++j) { if (((-7 <= i) && (i <= -3)) || ((3 <= i) && (i<= 7))) { if (((-7 <= j) && (j <= -3)) || ((3 <= j) && (j<= 7))) { fill(shift(i,j)*p,black); }}}} draw((-7,-.2)--(-7,.2),black+0.5bp); draw((-3,-.2)--(-3,.2),black+0.5bp); draw((3,-.2)--(3,.2),black+0.5bp); draw((7,-.2)--(7,.2),black+0.5bp); draw((-.2,-7)--(.2,-7),black+0.5bp); draw((-.2,-3)--(.2,-3),black+0.5bp); draw((-.2,3)--(.2,3),black+0.5bp); draw((-.2,7)--(.2,7),black+0.5bp); label("$-7$",(-7,0),S); label("$-3$",(-3,0),S); label("$3$",(3,0),S); label("$7$",(7,0),S); label("$-7$",(0,-7),W); label("$-3$",(0,-3),W); label("$3$",(0,3),W); label("$7$",(0,7),W);
```


$\textbf{(A)}\ 125\qquad \textbf{(B)}\ 150\qquad \textbf{(C)}\ 175\qquad \textbf{(D)}\ 200\qquad \textbf{(E)}\ 225$
## Solution
We need to find a reasonably easy way to count the squares.

First, obviously the maximum distance between two points in the same quadrant is $4\sqrt 2 < 6,$ hence each square has exactly one vertex in each quadrant.

Given any square, we can circumscribe another axes-parallel square around it. In the picture below, the original square is red and the circumscribed one is blue.


> [Asymptote diagram - not rendered in Markdown]

```asy
defaultpen(black+0.75bp+fontsize(8pt)); size(7.5cm); path p = scale(.15)*unitcircle; draw((-8,0)--(8.5,0),Arrow(HookHead,1mm)); draw((0,-8)--(0,8.5),Arrow(HookHead,1mm)); int i,j; for (i=-7;i<8;++i) { for (j=-7;j<8;++j) { if (((-7 <= i) && (i <= -3)) || ((3 <= i) && (i<= 7))) { if (((-7 <= j) && (j <= -3)) || ((3 <= j) && (j<= 7))) { fill(shift(i,j)*p,black); }}}} draw((-7,-.2)--(-7,.2),black+0.5bp); draw((-3,-.2)--(-3,.2),black+0.5bp); draw((3,-.2)--(3,.2),black+0.5bp); draw((7,-.2)--(7,.2),black+0.5bp); draw((-.2,-7)--(.2,-7),black+0.5bp); draw((-.2,-3)--(.2,-3),black+0.5bp); draw((-.2,3)--(.2,3),black+0.5bp); draw((-.2,7)--(.2,7),black+0.5bp); label("$-7$",(-7,0),S); label("$-3$",(-3,0),S); label("$3$",(3,0),S); label("$7$",(7,0),S); label("$-7$",(0,-7),W); label("$-3$",(0,-3),W); label("$3$",(0,3),W); label("$7$",(0,7),W); draw( (5,3) -- (-3,4) -- (-4,-4) -- (4,-5) -- cycle, red ); draw( (5,4) -- (-4,4) -- (-4,-5) -- (5,-5) -- cycle, dashed + blue );
```


Let's now consider the opposite direction. Assume that we picked the blue square, how many different red squares do share it?

Answering this question is not as simple as it may seem. Consider the picture below. It shows all three red squares that share the same blue square. In addition, the picture shows a green square that is not valid, as two of its vertices are in bad locations.


> [Asymptote diagram - not rendered in Markdown]

```asy
defaultpen(black+0.75bp+fontsize(8pt)); size(7.5cm); path p = scale(.15)*unitcircle; draw((-8,0)--(8.5,0),Arrow(HookHead,1mm)); draw((0,-8)--(0,8.5),Arrow(HookHead,1mm)); int i,j; for (i=-7;i<8;++i) { for (j=-7;j<8;++j) { if (((-7 <= i) && (i <= -3)) || ((3 <= i) && (i<= 7))) { if (((-7 <= j) && (j <= -3)) || ((3 <= j) && (j<= 7))) { fill(shift(i,j)*p,black); }}}} draw((-7,-.2)--(-7,.2),black+0.5bp); draw((-3,-.2)--(-3,.2),black+0.5bp); draw((3,-.2)--(3,.2),black+0.5bp); draw((7,-.2)--(7,.2),black+0.5bp); draw((-.2,-7)--(.2,-7),black+0.5bp); draw((-.2,-3)--(.2,-3),black+0.5bp); draw((-.2,3)--(.2,3),black+0.5bp); draw((-.2,7)--(.2,7),black+0.5bp); label("$-7$",(-7,0),S); label("$-3$",(-3,0),S); label("$3$",(3,0),S); label("$7$",(7,0),S); label("$-7$",(0,-7),W); label("$-3$",(0,-3),W); label("$3$",(0,3),W); label("$7$",(0,7),W); draw( (5,4) -- (-4,4) -- (-4,-5) -- (5,-5) -- cycle, red ); draw( (5,3) -- (-3,4) -- (-4,-4) -- (4,-5) -- cycle, red ); draw( (5,-3) -- (-2,-5) -- (-4,2) -- (3,4) -- cycle, dashed + green ); draw( (5,-4) -- (-3,-5) -- (-4,3) -- (4,4) -- cycle, red ); draw( scale(1.05)*((5,4) -- (-4,4) -- (-4,-5) -- (5,-5) -- cycle), dashed + blue );
```


The size of the blue square can range from $6\times 6 to 14\times 14,$ and for the intermediate sizes, there is more than one valid placement. We will now examine the cases one after another. Also, we can use symmetry to reduce the number of cases.

  size  upper_right  solutions  symmetries  total
     6        (3,3)          1           1      1
     7        (3,3)          1           4      4
     8        (3,3)          1           4      4
     8        (3,4)          1           4      4
     8        (4,4)          3           1      3
     9        (3,3)          1           4      4
     9        (3,4)          1           8      8
     9        (4,4)          3           4     12
    10        (3,3)          1           4      4
    10        (3,4)          1           8      8
    10        (3,5)          1           4      4
    10        (4,4)          3           4     12
    10        (4,5)          3           4     12
    10        (5,5)          5           1      5
    11        (4,4)          3           4     12
    11        (4,5)          3           8     24
    11        (5,5)          5           4     20
    12        (5,5)          5           4     20
    12        (5,6)          5           4     20
    12        (6,6)          7           1      7
    13        (6,6)          7           4     28
    14        (7,7)          9           1      9

Summing the last column, we get that the answer is $\boxed{225}.$
## Solution 2
This is based on a clever bijection given in [http://web2.slc.qc.ca/sh/Contest/AMC12_2009B-S.pdf this page].

Consider any square ABCD where all four vertices are in G, and the side length is at least 6, so the four vertices must lie in distinct quadrants (Same proof as in solution 1). Without loss of generality, assume that A,B,C,D are in the first, second, third, fourth quadrant. Then we consider the following mapping:


$$
A \to A' = A
B \to B' = B + (10,0)
C \to C' = C + (10,10)
D \to D' = D + (0,10)
$$


Then the new points A', B', C', D' are either being the same point or forming a square in $G_1 = G \cap\{ x>0, y>0 \}$, a 5x5 grid.

Conversely, for any point in $G_1$, it can be reversed to a square ABCD; however, for any square in $G_1$, there are four possible squares ABCD that were mapped to them. Therefore the number of possible squares ABCD is equal to 25 + 4N, where N is the number of squares inscribed in $G_1$.

Moreover by the same idea in solution 1, each square (with sides parallel or slanted to the axes) in a $G_1$ can be inscribed in a square in $G_1$, with sides parallel to one of the axes, call it "standard square". Noticing that each standard square of side length a corresponds to a inscribed squares,  and that there are $(5-a)^2$ number of standard squares of side length a, we have


$$N = \sum_{a=1}^{4} a(5-a)^2 = 1\cdot 16 + 2\cdot 9 + 3 \cdot 4 + 4 \cdot 1 = 16+18+12+4=50$$


So the answer is $25+4\cdot 50 = 225$

Motivation(by williamgolly, solution by MAA):
Homotheties
## Solution 3(If you have no time)
Start with Solution 2: the number of possible squares ABCD is equal to 25 + 4N. Notice there are only 2 options (A, and E) which have integer solutions for N. Option A corresponds to N=25, and option E corresponds to N=50. At this point, guessing between the 2 choices is already worth it, but there are already 16 unit squares (solutions to N), meaning that the answer is more probably E.

Edit:There are 125 squares you can make w/out tilted ones, so the answer is more than 125, hence E.
## Solution 4/Explanation
Consider any square that meets the requirements described in the problem. Then, take the vertices of the square and translate them to the first quadrant (This is the "mapping" described in Solution 2). For example, consider a square with vertices (7, 7), (-7, 7), (-7, -7), and (7, -7):


> [Asymptote diagram - not rendered in Markdown]

```asy
defaultpen(black+0.75bp+fontsize(8pt)); size(5cm); path p = scale(.15)*unitcircle; draw((-8,0)--(8.5,0),Arrow(HookHead,1mm)); draw((0,-8)--(0,8.5),Arrow(HookHead,1mm)); int i,j; for (i=-7;i<8;++i) { for (j=-7;j<8;++j) { if (((-7 <= i) && (i <= -3)) || ((3 <= i) && (i<= 7))) { if (((-7 <= j) && (j <= -3)) || ((3 <= j) && (j<= 7))) { fill(shift(i,j)*p,black); }}}} draw((-7,-.2)--(-7,.2),black+0.5bp); draw((-3,-.2)--(-3,.2),black+0.5bp); draw((3,-.2)--(3,.2),black+0.5bp); draw((7,-.2)--(7,.2),black+0.5bp); draw((-.2,-7)--(.2,-7),black+0.5bp); draw((-.2,-3)--(.2,-3),black+0.5bp); draw((-.2,3)--(.2,3),black+0.5bp); draw((-.2,7)--(.2,7),black+0.5bp); label("$-7$",(-7,0),S); label("$-3$",(-3,0),S); label("$3$",(3,0),S); label("$7$",(7,0),S); label("$-7$",(0,-7),W); label("$-3$",(0,-3),W); label("$3$",(0,3),W); label("$7$",(0,7),W); draw( (7,7) -- (-7,7) -- (-7,-7) -- (7,-7) -- cycle, black );
```


After following the mapping described in Solution 2, the square looks like this:


> [Asymptote diagram - not rendered in Markdown]

```asy
defaultpen(black+0.75bp+fontsize(8pt)); size(5cm); path p = scale(.15)*unitcircle; draw((-8,0)--(8.5,0),Arrow(HookHead,1mm)); draw((0,-8)--(0,8.5),Arrow(HookHead,1mm)); int i,j; for (i=-7;i<8;++i) { for (j=-7;j<8;++j) { if (((-7 <= i) && (i <= -3)) || ((3 <= i) && (i<= 7))) { if (((-7 <= j) && (j <= -3)) || ((3 <= j) && (j<= 7))) { fill(shift(i,j)*p,black); }}}} draw((-7,-.2)--(-7,.2),black+0.5bp); draw((-3,-.2)--(-3,.2),black+0.5bp); draw((3,-.2)--(3,.2),black+0.5bp); draw((7,-.2)--(7,.2),black+0.5bp); draw((-.2,-7)--(.2,-7),black+0.5bp); draw((-.2,-3)--(.2,-3),black+0.5bp); draw((-.2,3)--(.2,3),black+0.5bp); draw((-.2,7)--(.2,7),black+0.5bp); label("$-7$",(-7,0),S); label("$-3$",(-3,0),S); label("$3$",(3,0),S); label("$7$",(7,0),S); label("$-7$",(0,-7),W); label("$-3$",(0,-3),W); label("$3$",(0,3),W); label("$7$",(0,7),W); draw( (3,3) -- (3,7) -- (7,7) -- (7,3) -- cycle, black );
```


The position of each vertex within their corresponding grid has not changed.For example, the point (-7, 7) is still the top-left point in a grid, albeit a change in quadrant. Trying this out with a couple of other squares, we see that the following property holds:

$\text{"For any and all squares with vertices in each of the four quadrants, the 'mapped' version is also a square."}$

Therefore the logical inverse is true:

$\text{"For any 'mapped' square with all four vertices in the first quadrant,}$
$\text{there exists at least one corresponding 'unmapped' square with a vertex in each of the four quadrants."}$

But how many "unmapped" squares, to be exact?

This might seem complicated at first, but with some intuitive thinking, we realize that there are exactly 4 "unmapped" squares that correspond with a "mapped" square. This is because given a "mapped" square, there are 4 choices for the vertex that will remain in the first quadrant; but once that point is chosen, there is only 1 distribution of the other 3 vertices that will result in a square. So, we want four times the number of squares we can make in the first quadrant grid.

We divide our counting method into two cases: squares with side length 0 after mapping (which means all four vertices are in the same position relative to their own grids) and squares with side length 1-4 after mapping.

Case 1: There are 25 such squares of length 0 (this is equivalent to counting the number of points on the grid). However, in this scenario, all of the vertices have been mapped onto the same point. So instead of 4 choices for the first quadrant vertex, there is only one. Subsequently there are  only 25 such squares that correspond to them.

Case 2: Let a square with sides parallel to the axes be known as A squares. These A squares can have side length 1, 2, 3, or 4. However, the number of A squares possible depends on the side length. For example, there is only 1 possible A square of side length 4, but 16 squares of side length 1. To be exact, there are $(5-s)^2$ possible A squares of side length s. So, the total number of A squares is

$$\sum_{s=1}^4 (5-s)^2$$

But what about "tilted" squares? Notice that "tilted squares" can always be inscribed (drawn within) another, bigger square. Let a square inscribed within an A square be called a B square. How many B squares are there? Well, this also depends on the side length. We only want squares whose vertices are lattice points (integer value coordinates), so the number of B squares should increase along with side length. We defined B squares to be inscribed within A squares, so we can say that all B squares have their vertices on the side on an A square. Consider an A square with side length 4. There are 3 other lattice points along the side of the A square, not counting the vertices. Therefore, we can say that there are $s-1$ possible B squares for every A square with side length s. We can multiply $(s-1)$ times the number of A squares to get the number of B squares. This is

$$\sum_{s=1}^4 (s-1)(5-s)^2$$

total B squares. But we need to add these two quantities to get the number of squares for Case 2:

$$\sum_{s=1}^4 (s-1)(5-s)^2 + \sum_{s=1}^4 (5-s)^2$$

By distributive property, the expression becomes

$$\sum_{s=1}^4 s(5-s)^2$$

Solving, we get 50 "mapped" squares, both A and B. Multiplying this by 4 to get the corresponding number of "unmapped" squares, then adding to get the number of squares for Case 1, we get

$$50*4 + 25 = 225 \Rightarrow \boxed{\text{E}}.$$
## Lemma (For Solution 2)
We may prove, using vectors, that two regular n-sided polygons create a a new regular n-sided polygon on a rectangular coordinate system.

Let the two polygons be $M_1M_2 ... M_n$ and $N_1N_2 ... N_n$.

Let $\$omega = $e^{i\frac{2\pi}{n}}$ and $a =\vec{M_1 M_2}.$
We have the respective vector expressions of each point of M, considering $M_1$ as a starting point.


$$
\begin{cases} \vec{M_1} = \vec{M_1} \\ \vec{M_2} = \vec{M_1}+\vec{a} \\ \vec{M_3} = \vec{M_1}+\vec{a}+\omega\vec{a} \\ \vec{M_4} = \vec{M_1}+\vec{a}+\omega\vec{a}+\vec{a}+\omega^2 \vec{a} \\ ...... \\ \vec{M_n} = \vec{M_1}+(1+\omega+\omega^2+......+\omega^{n-1})\vec{a} \end{cases}
$$


The case is similar with N.

Adding up each corresponding point of M and N, we get the points for the new polygon.


$$
\begin{cases} \vec{M_1} + \vec{N_1} = \vec{M_1} + \vec{N_1} \\ \vec{M_2} + \vec{N_2} = \vec{M_1} + \vec{N_1} + (\vec{a} + \vec{b})\\ \vec{M_3} + \vec{N_3} = \vec{M_1} + \vec{N_1} + (1 + \omega)(\vec{a} + \vec{b}) \vec{M_4} + \vec{N_4} = \vec{M_1} + \vec{N_1} + (1 + \omega + \omega^2)(\vec{a} + \vec{b})\\ ...... \\ \vec{M_n} + \vec{N_n} = \vec{M_1} + \vec{N_1} + (1+\omega+\omega^2+......+\omega^{n-1})(\vec{a} + \vec{b}) \end{cases}
$$


See how the expression of the new polygon's points is similar to M and N? We conclude that, adding up a n-sided regular polygon with an "initial point" on $\vec{M_1}$ and a side-length of $\left$| $\vec{a}\right$| with another n-sided regular polygon with an "initial point" on $\vec{N_1}$ and a side-length of $\left$| $\vec{b}\right$| creates a new n-sided regular polygon with its "initial point" on $\vec{M_1}+\vec{N_1}$ and a side-length of $\left$| $\vec{a}+\vec{b}\right$|.

Solution 2 is a special case, where the sum of vertices of 2 squares is a square on a complex plane.

*~cassphe*
## See Also
