# 2019 AMC 12B Problem 11

## Problem
How many unordered pairs of edges of a given cube determine a plane?

$\textbf{(A) } 12 \qquad \textbf{(B) } 28 \qquad \textbf{(C) } 36\qquad \textbf{(D) } 42 \qquad \textbf{(E) } 66$
## Solution 1
Without loss of generality, choose one of the 12 edges of the cube to be among the two selected. We now calculate the probability that a randomly-selected second edge makes the pair satisfy the condition in the problem statement.

For two lines in space to determine a common plane, they must either intersect or be parallel (in other words, they cannot be skew lines). If all 12 line segments are extended to lines, the first (arbitrarily chosen) edge's line intersects 4 lines and is parallel to another 3. Thus $4+3=7$ of the $12-1=11$ remaining line segments (which could be chosen for the second edge) give a pair of lines determining a common plane. To see this, observe that in the diagram below, the red edge is parallel to the 3 green edges and intersects with the 4 blue edges.


> [Asymptote diagram - not rendered in Markdown]

```asy
import three; import three; unitsize(1cm); size(200); currentprojection=perspective(-6/5,-8/5,7/8); draw((0,1,0)--(0,0,0)--(1,0,0), blue); draw((1,0,0)--(1,1,0)--(0,1,0)); draw((0,0,0)--(0,0,1), red); draw((0,1,0)--(0,1,1), green); draw((1,1,0)--(1,1,1), green); draw((1,0,0)--(1,0,1), green); draw((0,1,1)--(0,0,1)--(1,0,1), blue); draw((1,0,1)--(1,1,1)--(0,1,1));
```


This means that the probability that a randomly-selected pair of edges determine a plane is $\frac{7}{11},$ and we calculate that there are {12 $\choose 2$} = 66 total pairs of edges that could be chosen (without the restriction). Thus the answer is $\frac{7}{11} \cdot 66 =\boxed{\textbf{(D) }42}.$
## Solution 2
As in Solution 1, we observe that the two edges must either be parallel or intersect. Clearly the edges will intersect if and only if they are part of the same face. We can thus divide into two cases:

**Case 1**: The two edges are part of the same face. There are 6 faces, and {4 $\choose 2$}=6 ways to choose 2 of the 4 edges of the square, giving a total of 6 $\cdot 6 = 36$ possibilities.

**Case 2**: The two edges are parallel and not part of the same face. Observe that each of the 12 edges is parallel to exactly 1 edge that is not part of its face. The edges can thus be paired up, giving $\frac{12}{2} = 6$ possibilities for this case.

Adding the two cases, the answer is hence 36 + 6 = $\boxed{\textbf{(D) }42}.$
## Solution 3 (Quick Solution)
As in solution 1, we see that for an arbitrary edge of the cube, only 7 of the other edges can be chosen to form a plane.

For each of the 12 edges, this gives (7)(12) = 84 total possible pairings. However each pair has been counted twice (e.g edge A with B, and edge B with A) so we divide by 2 to get $\boxed{\textbf{(D) }42}.$
## See Also
