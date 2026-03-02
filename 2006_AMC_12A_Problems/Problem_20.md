# 2006 AMC 12A Problem 20

> This problem is the same as [2006 AMC 12A #20](https://artofproblemsolving.com/wiki/index.php/2006_AMC_12A_Problems) and [2006 AMC 10A #25](https://artofproblemsolving.com/wiki/index.php/2006_AMC_10A_Problems/Problem_25).
## Problem
A bug starts at one vertex of a cube and moves along the edges of the cube according to the following rule. At each vertex the bug will choose to travel along one of the three edges emanating from that vertex. Each edge has equal probability of being chosen, and all choices are independent. What is the probability that after seven moves the bug will have visited every vertex exactly once?

$\textbf{(A) } \frac{1}{2187}\qquad \textbf{(B) } \frac{1}{729}\qquad \textbf{(C) } \frac{2}{243}\qquad \textbf{(D) } \frac{1}{81} \qquad \textbf{(E) } \frac{5}{243}$
## Solution 1
Call this cube ABCDEFGH, with A being the starting point.

Because in 7 moves the bug has to visit the other vertices, the bug cannot revisit any vertex.

Therefore, starting at A, the bug has a $\frac{3}{3}$ chance of finding a good path to the next vertex, and call it B.

Then, the bug has a $\frac{2}{3}$ chance of reaching a new vertex next. Call this C. A, B, and C are always on the same plane.

Now, we split cases.

Case 1: The bug goes to the vertex E opposite A on the space diagonal with probability $\frac{1}{3}.$

Then, the bug has to visit D on the plane of ABC last, as there is no way in and out from D.

Therefore, there is only 1 way out of 81 to get to D last.

Therefore, there is a $\frac{1}{243} \cdot \frac{6}{9} = \frac{6}{2187}$ chance of finding a good path in this case.

Case 2: The bug goes to vertex D on plane ABC with a chance of $\frac{1}{3}.$

The bug then has only 1 way to go to a point E on the opposite face, therefore having a $\frac{1}{3}$ probability.

Then, the bug has a choice of two vertices on the face opposite to ABCD.

This results in a $\frac{2}{3}$ probability of finding a good path to a point F.

Then, there is only 1 way out of 9 to visit both other vertices on that face in 2 moves.

Multiply the probabilities for this case to get $\frac{2}{243} \cdot \frac{6}{9} = \frac{12}{2187}.$

Add the probabilities of these two cases together to get $\frac{18}{2187} = \boxed{\textbf{(C) }\frac{2}{243}}.$
## Solution 2
> [Asymptote diagram - not rendered in Markdown]

```asy
import three; unitsize(1cm); size(50); currentprojection=orthographic(1/2,-1,1/2); /* three - currentprojection, orthographic */ draw((0,0,0)--(1,0,0)--(1,1,0)--(0,1,0)--cycle); draw((0,0,0)--(0,0,1)); draw((0,1,0)--(0,1,1)); draw((1,1,0)--(1,1,1)); draw((1,0,0)--(1,0,1)); draw((0,0,1)--(1,0,1)--(1,1,1)--(0,1,1)--cycle);
```


Let us count the good paths. The bug starts at an arbitrary [vertex](https://artofproblemsolving.com/wiki/index.php/vertex), moves to a neighboring vertex (3 ways), and then to a new neighbor (2 more ways).  So, without loss of generality, let the cube have vertices ABCDEFGH such that ABCD and EFGH are two opposite faces with A above E and B above F.  The bug starts at A and moves first to B, then to C.

From this point, there are two cases.

Case 1: the bug moves to D.  From D, there is only one good move available, to H.  From H, there are two ways to finish the trip, either by going H $\to G \to F \to E$ or H $\to E \to F \to G.$  So there are 2 good paths in this case.

Case 2: the bug moves to G.

Case $2a$: the bug moves G $\to H.$  In this case, there are 0 good paths because it will not be possible to visit both D and E without double-visiting some vertex.

Case $2b$: the bug moves G $\to F.$  There is 1 good path in this case, F $\to E \to H \to D.$

Thus, there are a total of $3\cdot 3 \cdot 2 = 18$ good paths.  There were $3^7 = 2187$ possible paths the bug could have taken, so the probability of a random path is good is $\frac{18}{2187} = \boxed{\textbf{(C) }\frac2{243}}.$
## Solution 3 (answer choices)
As in Solution 1, the bug can move from its arbitrary starting vertex to a neighboring vertex in 3 ways. After this, the bug can move to a new neighbor in 2 ways (it cannot return to the first vertex). The total number of paths (as stated above) is $3^7$ or 2187. Therefore, the probability of the bug following a good path is equal to $\frac{6x}{2187}$ for some positive integer x. The only answer choice which can be expressed in this form is $\boxed{\textbf{(C) }\frac2{243}}.$
## Solution 4
Pick 1 vertex to start from. Notice that on all the odd moves the bug will move to 1 of 4 other vertices. Notice that on all even moves the bug must go to 1 of 3 other vertices (4 including the starting vertex). Thus, the bug will end on one of the odd vertices. There are 3 choices for the bug's first move from the starting vertex, and 2 choices for the bug's second move (it can't go back to the previous vertices). Then, notice that the bug has 3 choices of an odd vertex to end on not including the vertex the bug went to on move 1. Now pick 1 of the 3 ending vertices to end on. Notice that there are only 6 valid paths from start to finish (1 valid path after moves 1 and 2) to that point because all the moves are forced after the first 2 moves  (try it out). Thus, there are 3 $\cdot 2 \cdot 3 = 18$ valid paths the bug can take. There are 3^7 = 2187total paths, so the answer is $18/2187 =\boxed{\textbf{(C) }\frac{2}{243}}.$
## Solution 5 (classical probability)
Let the cube have vertices ABCDEFGH such that ABCD and EFGH are two opposite faces with A above E and B above F.  The bug starts at A and every step has 3 choices so that there'$re 3^7 = 2187$ possible paths. We can split the case into odd and even steps. After an odd number of steps, the possible points that can be reached are B,D,G,E. Then, for even-numbered steps, the remaining points can be reached. Since he has taken seven steps, the end point must be one of the points in B,D,G,E. At this point, we classify and discuss the movement trajectory of the bug.

Case 1: It moves to another plane after completing one plane. If it starts on the upper plane, there are two possibilities for the first step, B or D. The second and third steps are restricted to the upper plane, and the fourth step will move to the nearby point on another plane. These three steps have only one possibility each, so there is no need for classification. Then, when it reaches the lower plane, the fifth step has two possibilities, thus limiting the sixth and seventh steps as well. Proceeding in this way, the bug can also move from left to right or from front to back. Therefore, there are 2 $\cdot 2 \cdot 3 = 12$ situations.

Case 2: Opposite to case 1, it can directly pass through to another point G on the other diagonal of the cube within the first three steps. There are three choices for the first step, two choices for the second step, and only one choice for the third step. Therefore, there are 3 $\cdot 2 = 6$ situations for the first three steps. The subsequent steps will be restricted to a single path (try it yourself).

In summary, there are $12 + 6 = 18$ situations in total. Therefore, the final probability is $18/2187 =\boxed{\textbf{(C) }\frac2{243}}.$

*~A mystery eastern egg (wtng)*
## See also
