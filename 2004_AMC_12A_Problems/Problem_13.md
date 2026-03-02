# 2004 AMC 12A Problem 13

## Problem
Let S be the [set](https://artofproblemsolving.com/wiki/index.php/set) of [point](https://artofproblemsolving.com/wiki/index.php/point)s (a,b) in the [coordinate plane](https://artofproblemsolving.com/wiki/index.php/coordinate_plane), where each of a and b may be - 1, 0, or 1. How many distinct [line](https://artofproblemsolving.com/wiki/index.php/line)s pass through at least two members of S?


$$\text {(A)}\ 8 \qquad \text {(B)}\ 20 \qquad \text {(C)}\ 24 \qquad \text {(D)}\ 27\qquad \text {(E)}\ 36$$

## Solution
[center](https://artofproblemsolving.com/wiki/index.php/Image:2004_AMC12A-13.png)
### Solution 1
Let's count them by cases:

[center](https://artofproblemsolving.com/wiki/index.php/Image:2004_AMC12A-13b.png)

***Case 1**: The line is horizontal or vertical, clearly 3 $\cdot 2 = 6.$
***Case 2**: The line has slope $\pm 1,$ with 2 through (0,0) and 4 additional ones one unit above or below those. These total 6.
***Case 3**: The only remaining lines pass through two points, a vertex and a non-vertex point on the opposite side. Thus we have each vertex pairing up with two points on the two opposites sides, giving 4 $\cdot 2 = 8$ lines.
These add up to $6+6+8=$20\ $\mathrm{(B)}.$
### Solution 2
There are {9 $\choose 2$} = 36 ways to pick two points, but we've clearly overcounted all of the lines which pass through three points. In fact, each line which passes through three points will have been counted {3 $\choose 2$} = 3 times, so we have to subtract 2 for each of these lines. Quick counting yields 3 horizontal, 3 vertical, and 2 diagonal lines, so the answer is 36 - $2(3+3+2) = 20$ distinct lines.
### Solution 3
First consider how many lines go through (-1, -1) and hit two points in S. You can see that there are 5 such lines. Now, we cross out (-1, -1) and make sure to never consider consider lines that go through it anymore (As doing so would be double counting). Repeat for (-1, 0), making sure not to count the vertical line as it goes through the crossed out (-1, -1). Then cross out (-1, 0). Repeat for the rest, and count 20 lines in total.
