# 2023 AMC 12B Problem 5

> This problem is the same as [2023 AMC 10B #10](https://artofproblemsolving.com/wiki/index.php/2023_AMC_10B_Problems/Problem_10) and [2023 AMC 12B #5](https://artofproblemsolving.com/wiki/index.php/2023_AMC_12B_Problems/Problem_5).
## Problem
You are playing a game. A 2 $\times 1$ rectangle covers two adjacent squares (oriented either horizontally or vertically) of a 3 $\times 3$ grid of squares, but you are not told which two squares are covered. Your goal is to find at least one square that is covered by the rectangle. A "turn" consists of you guessing a square, after which you are told whether that square is covered by the hidden rectangle. What is the minimum number of turns you need to ensure that at least one of your guessed squares is covered by the rectangle?

$\textbf{(A)}~3\qquad\textbf{(B)}~5\qquad\textbf{(C)}~4\qquad\textbf{(D)}~8\qquad\textbf{(E)}~6$
## Solution 1
Notice that the $3\times3$ square grid has a total of 12 possible $2\times1$ rectangles.

Suppose you choose the middle square for one of your turns. The middle square is covered by 4 rectangles, and each of the remaining 8 squares is covered by a maximum of 2 uncounted rectangles. This means that the number of turns is at least $1+\frac{12-4}{2}=1+4=5.$

Now suppose you don't choose the middle square. The squares on the middle of the sides are covered by at most 3 uncounted rectangles, and the squares on the corners are covered by at most 2 uncounted rectangles. In this case, we see that the least number of turns needed to account for all 12 rectangles is $12\div 3=4.$ To prove that choosing only side squares indeed does cover all 12 rectangles, we need to show that the 3 rectangles per square that cover each side square do not overlap. Drawing the rectangles that cover one square, we see they form a T shape and they do not cover any other side square. Hence, our answer is 4.


> [Asymptote diagram - not rendered in Markdown]

```asy
draw((0,0)--(0.5,0)--(0.5,0.5)--(0,0.5)--(0,0)); draw((0,1)--(0.5,1)--(0.5,1.5)--(0,1.5)--(0,1)); draw((0.5,0.5)--(1,0.5)--(1,1)--(0.5,1)--(0.5,0.5)); draw((1,0)--(1.5,0)--(1.5,0.5)--(1,0.5)--(1,0)); draw((1,1)--(1.5,1)--(1.5,1.5)--(1,1.5)--(1,1)); draw((0,0.5)--(0.5,0.5)--(0.5,1)--(0,1)--(0,0.5)); draw((0.5,0)--(1,0)--(1,0.5)--(0.5,0.5)--(0.5,0)); draw((0.5,1)--(1,1)--(1,1.5)--(0.5,1.5)--(0.5,1)); draw((1,0.5)--(1.5,0.5)--(1.5,1)--(1,1)--(1,0.5)); filldraw((0,0.5)--(0.5,0.5)--(0.5,1)--(0,1)--(0,0.5)--cycle, red, black+linewidth(1)); filldraw((0,0)--(0.5,0)--(0.5,0.5)--(0,0.5)--(0,0)--cycle, red, black+linewidth(1)); filldraw((0,1)--(0.5,1)--(0.5,1.5)--(0,1.5)--(0,1)--cycle, red, black+linewidth(1)); filldraw((0.5,0.5)--(1,0.5)--(1,1)--(0.5,1)--(0.5,0.5)--cycle, red, black+linewidth(1));
```
## Solution 2
First, note that since the rectangle covers 2 squares, we only need to guess squares that are not adjacent to any of our other guesses. To minimize the amount of guesses, each of our guessed squares should try to touch another guess on one vertex and one vertex only. There are only two ways to do this: one with 5 guesses, and one with 4. Since the problem is asking for the minimum number, the answer is $\boxed{\text{(C) } 4}.$

*~Stead (a.k.a. Aaron)*
## Solution 3
Since the hidden rectangle can only hide two adjacent squares, we may think that we eliminate 8 squares and we're done, but think again. This is the AMC 10, so there must be a better solution (also note that every other solution choice is below 8 so we're probably not done) So, we think again, we notice that we haven't used the adjacent condition, and then it clicks. If we eliminate the four squares with only one edge on the boundary of the 9x9 square. We are left with 5 diagonal squares, since our rectangle can't be diagonal, we can ensure that we find it in 4 moves. So our answer is :
$$\boxed{\text{(C) } 4}$$

*~arrowskyknight22*
## Solution 4 (Checkerboard)
The 3 $\times 3$ grid can be colored like a checkerboard with alternating black and white squares.
Let the top left square be white, and the rest of the squares alternate colors, as shown below:

> [Asymptote diagram - not rendered in Markdown]

```asy
/* Diagram by MRENTHUSIASM */ import olympiad; unitsize(25); fill((1,2)--(1,3)--(2,3)--(2,2)--cycle, mediumgray); fill((1,0)--(1,1)--(2,1)--(2,0)--cycle, mediumgray); fill((2,1)--(2,2)--(3,2)--(3,1)--cycle, mediumgray); fill((0,1)--(0,2)--(1,2)--(1,1)--cycle, mediumgray); for (int $i = 0$; i < 4; ++i) { draw((i,0)--(i,3)); draw((0,i)--(3,i)); }
```

Each 2 $\times 1$ rectangle always covers 1 white square and 1 black square.
You can ensure that at least one of your guessed squares is covered by the rectangle by choosing either each of the white squares (5 turns) or each of the black squares (4 turns).

Since it is ideal to be the most efficient with our turns, by choosing all the black squares, we guarantee that one of the $\boxed{\textbf{(C)}~4}$ squares are of the 2 $\times 1$ rectangle.

*~CherryBerry*

(Minor edits by NSAoPS)
## Solution 5 (Logic)
We realize that every 2 $\times 1$ rectangle must contain an edge and no more than one edge. There are a total of four edges so the answer is $\boxed{\text{(C) } 4.}.$
*~darrenn.cp*
## Solution 6 (Very Fast)
Draw the 3x3 grid. We want to minimize our options, so we look at the square shared by the most 2x1 rectangles. This is the center square. So, to guarantee our success, we choose the four edges from the center square, so our answer is $\boxed{C.4}$

*~Pinotation*
## Video Solution by Math-X (First understand the problem!!!)
https://youtu.be/EuLkw8HFdk4?si=RbKZpmAv9kfDLuON&t=2106

*~Math-X*
## Video Solution 1 by MegaMath
https://www.youtube.com/watch?v=rMZrqGD0MKg&t=3s
*~megahertz13*
## Video Solution 2 by OmegaLearn.org
https://youtu.be/7rO2-mtQCvM
## Video Solution
https://youtu.be/piiG6JAgxAs

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Video Solution by Interstigation
https://youtu.be/gDnmvcOzxjg?si=cYB6uChy7Ue0UT4L
## See Also
