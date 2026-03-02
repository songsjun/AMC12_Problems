# 2010 AMC 12A Problem 18

## Problem
A 16-step path is to go from (-4,-4) to (4,4) with each step increasing either the x-coordinate or the y-coordinate by 1. How many such paths stay outside or on the boundary of the square -2 $\le$ x $\le 2, -2 \le$ y $\le 2$ at each step?

$\textbf{(A)}\ 92 \qquad \textbf{(B)}\ 144 \qquad \textbf{(C)}\ 1568 \qquad \textbf{(D)}\ 1698 \qquad \textbf{(E)}\ 12,800$
## Solution 1
Each path must go through either the second or the fourth quadrant.
Each path that goes through the second quadrant must pass through exactly one of the points (-4,4), (-3,3), and (-2,2).

There is 1 path of the first kind, {$8\choose 1}^2=64$ paths of the second kind, and {$8\choose 2}^2=28^2=784$ paths of the third type.
Each path that goes through the fourth quadrant must pass through exactly one of the points (4,-4), (3,-3), and (2,-2).
Again, there is 1 path of the first kind, {$8\choose 1}^2=64$ paths of the second kind, and {$8\choose 2}^2=28^2=784$ paths of the third type.

Hence the total number of paths is $2(1+64+784)=\boxed{1698}.$
## Solution 2
We will use the concept of complementary counting. If you go in the square you have to go out by these labeled points(click the link) https://imgur.com/VysX4P0 and go out through the borders because if you didn't, you would touch another point in one of those points in the set of points in the link(Call it S). There is symmetry about y=x, so we only have to consider (1,-1), (1,0), and (1,1). (1,1) can go on the boundary in two ways, so we can only consider one case and multiply it by two. For (1,0) and (1,-1) we can just multiply by two. So we count paths from (-4,4) to each of these points, and then multiply that by the number of ways to get from the point one unit right of that to (4,4), and all in all, we get the answer is $\dbinom{16}{8}-2\left$[$\dbinom{8}{3}\dbinom{7}{2}+\dbinom{9}{4}\dbinom{6}{2}+\dbinom{10}{5}\dbinom{5}{2}\right$]=1698, which is answer choice $\textbf{(D)}$
*~vsamc*
Note: Sorry if this was rushed.
## Further Explanation(for Solution 1)
As stated in the solution, there are 6 points along the line y=-x that constitute a sort of "boundary". Once the ant reaches one of these 6 points, it is exactly halfway to (4, 4). Also notice that the ant will only cross one of the 6 points during any one of its paths. Therefore we can divide the problem into 3 cases, focusing on 1 quadrant; then multiplying the sum by 2 to get the total (because there is symmetry).

For the sake of this explanation, we will focus on the fourth quadrant (it really doesn't matter which quadrant because, again the layout is symmetrical) The three cases are when the ant crosses (4, -4), (3, -3), and (2, -2).

For each of the cases, notice that the path the ant takes can be expressed as a sequence of steps, such as:

right, right, up, right,..., etc.

Also notice that there are always 8 steps per sequence (if there were more or less steps, the ant would be breaking the conditions given in the problem). This means we can figure out the number of ways to get to a point based on the particular sequence of steps that denote each path. For example, there is only one way for the ant to pass through (4, -4); it MUST keep traveling right for all 8 steps. This seems fairly obvious; however, notice that this is equivalent to

$$\binom{8}{0}$$

Now we consider the number of ways to get from (4, -4) to (4, 4). by symmetry, there is only 1 such way. So the number of paths containing (4, -4) is $1^2,$ or 1.

Moving on to the next case, we see that the ant MUST travel right exactly 7 times and up exactly once. So each sequence of this type will have 7 "right"s and 1 "up". So, the total number of paths that go through (3, -3) is equivalent to the number of ways to arrange 1 "up" into 8 spots. This is

$$\binom{8}{1} = 8$$

Similarly to the first case, we square this value to account for the second half of the journey: $8^2 = 64.$

Finally, for the third case (ant passes through (2, -2)) the ant must travel right exactly 6 times and up exactly 2 times. This is equivalent to the number of ways to arrange 2 "ups" in a sequence of 8 movements, or

$$\binom{8}{2} = 28$$

Again, we square 28: 28^2 = 784. Adding up all of these cases we get

$$1+64+784 = 849$$

paths through the fourth quadrant. Doubling this number to account for the paths through the second quadrant, we have

$$849*2=1698 \Rightarrow \boxed{\text{D}}.$$

For all the notation geeks out there, the solution can be expressed as such:

$$2\sum_{k=0}^2 \binom{8}{k}^2$$
## Solution 3
We can draw an 8 by 8 square with a hollow 4 by 4 center. The ways to get a to a point or corner of a coordinate point is equal to the ways of getting to the point to the left of the desired point and the bottom of the desired point, since we can only move right and up. Using basic addition and symmetry (along the y=x) to speed things up, in the end, you sum up 849 and 849, giving us our answer of $\boxed{1698}.$


> [Asymptote diagram - not rendered in Markdown]

```asy
// Set up the Asymptote units unitsize(1cm); // Draw the 8x8 outer grid for (int $i = 0$; i <= 8; ++i) { // Vertical lines of the grid draw((i, 0)--(i, 8)); // Horizontal lines of the grid draw((0, i)--(8, i)); } // Draw the hollow 4x4 center (white rectangle over the center part) filldraw(box((2, 2), (6, 6)), white, white); // Hollow center (4x4 region)
```
## Solution 4
Let N(A,C,B) denote the number of paths from A to C then to B,  N(A,D,B) denote the number of paths from A to D then to B, N(A,E,B) denote the number of paths from A to E then to B, N(A,C,D, B) denote the number of paths from A to C to D then to B, N(A,C,D,E,B) denote the number of paths from A to C  to D to E then to B, also notice we have N(A,C,E,B)=N(A,C,D,E,B).

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(1cm); for (int $i = 0$; i <= 8; ++i) { draw((i, 0)--(i, 8)); draw((0, i)--(8, i)); } filldraw(box((2, 2), (6, 6)), white, white); dot((0,0)); dot((2,6)); dot((2,7)); dot((2,8)); dot((8,8)); label("A",(0,0), align=W); label("B",(8,8), align=E); label("C",(2,6), align=NE); label("D",(2,7), align=NE); label("E",(2,8), align=NE); then the answer = N(A,C,B)+N(A,D,B)+N(A,E,B)-N(A,C,D,B)-N(A,C,E,B)-N(A,D,E,B)+N(A,C,D,E,B)=N(A,C,B)+N(A,D,B)+N(A,E,B)-N(A,C,D,B)-N(A,D,E,B), N(A,C,B)=N(A,C)$\cdot N(C,B)={8\choose 2}\cdot$ {$8\choose $2}, N(A, D, B)=N(A,D)$\cdot N(D, B)={9\choose 2}\cdot$ {$7\choose $1}, N(A,E, B)={$10\choose 2}\cdot 1, N(A, C, D, B)={8\choose 2}\cdot$ {$7\choose $1}, N(A, D, E, B)={$9\choose 2}\cdot1,$  since if the path passes quadrant II, it will pass either C or D or E. Consider
```

the paths pass the quadrant IV together, we have ans=$2\times({8\choose 2}\cdot$ {$8\choose 2}+{9\choose 2}\cdot$ {$7\choose 1}+{10\choose 2}\cdot 1-{8\choose 2}\cdot$ {$7\choose 1}-{9\choose 2}\cdot1)=2\times 849=1698,\boxed{(D)}$

*~szhangmath*
## See also
