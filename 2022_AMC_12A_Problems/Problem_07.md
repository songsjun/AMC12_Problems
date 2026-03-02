# 2022 AMC 12A Problem 7

> This problem is the same as [2022 AMC 10A #9](https://artofproblemsolving.com/wiki/index.php/2022_AMC_10A_Problems/Problem_9) and [2022 AMC 12A #7](https://artofproblemsolving.com/wiki/index.php/2022_AMC_12A_Problems/Problem_7).
## Problem
A rectangle is partitioned into $5$ regions as shown. Each region is to be painted a solid color - red, orange, yellow, blue, or green - so that regions that touch are painted different colors, and colors can be used more than once. How many different colorings are possible?


> [Asymptote diagram - not rendered in Markdown]

```asy
<asy> size(5.5cm); draw((0,0)--(0,2)--(2,2)--(2,0)--cycle); draw((2,0)--(8,0)--(8,2)--(2,2)--cycle); draw((8,0)--(12,0)--(12,2)--(8,2)--cycle); draw((0,2)--(6,2)--(6,4)--(0,4)--cycle); draw((6,2)--(12,2)--(12,4)--(6,4)--cycle); </asy>
```


$\textbf{(A) }120\qquad\textbf{(B) }270\qquad\textbf{(C) }360\qquad\textbf{(D) }540\qquad\textbf{(E) }720$
## Solution 1
The top left rectangle can be $5$ possible colors. Then the bottom left region can only be $4$ possible colors, and the bottom middle can only be $3$ colors since it is next to the top left and bottom left. Similarly, we have $3$ choices for the top right and $3$ choices for the bottom right, which gives us a total of $\cdot4\cdot3\cdot3\cdot3=\boxed{\textbf{(D) }540}$.

*~Txu*
## Solution 2 (Casework)
Case 1: All the rectangles are different colors. It would be $5! = 120$ choices.

Case 2: Two rectangles that are the same color. Grouping these two rectangles as one gives us $\cdot4\cdot3\cdot2 = 120$. But, you need to multiply this number by three because the same-colored rectangles can be chosen at the top left and bottom right, the top right and bottom left, or the bottom right and bottom left, which gives us a grand total of $360$.

Case 3: We have two sets of rectangles chosen from these choices (top right & bottom left, top left & bottom right) that have the same color. However, the choice of the bottom left and bottom right does not work for this case, as the second pair would be chosen from two touching rectangles. Again, grouping the same-colored rectangles gives us $\cdot4\cdot3 = 60$.

Therefore, we have $120 + 360 + 60 = \boxed{\textbf{(D) }540}$.

*~orenbad*
## Solution 3 (Different Kind Of Casework)
Let us first choose the color of the bottom-middle rectangle, as it is touching all the other rectangles and has to be a different color than all of them. This rectangle has $5$ possibilities. To make things easier for us, let's assume we chose the color red. Now, lets choose the color of the top-left rectangle. This has $4$ options: orange, yellow, blue, or green (it can't be the same color as the middle rectangle, which we assumed was red). Lets assume this is orange. Now, we know that the bottom-left rectangle only has $3$ choices: yellow, blue, or green. Lets assume this is colored yellow. Now, lets do casework on the color of the bottom right-rectangle. It either can be the same color as the top-left (orange), or different.
CASE 1: (Its the same color)
We then know that the bottom-right rectangle is also colored orange. We now know that the top-left rectangle only has $3$ choices: yellow, blue, or green (it can't be orange or red). The sum of the possibilities of this case is $\cdot4\cdot3\cdot3$.

CASE 2: (Its a different color)
We then know that the bottom-right rectangle has $3$ options (yellow, blue, or green, since it can't be red, and it can't be orange since we already covered that in the case 1). Lets assume it is colored yellow. We know have $3$ choices for the top-right rectangle (blue or green). The sum of the possibilities of this case is $\cdot4\cdot3\cdot3\cdot2$

We can then sum up the possibilities of our two cases, which is $\cdot4\cdot3\cdot3+5\cdot4\cdot3\cdot3\cdot2 = 5\cdot4\cdot3(3+3\cdot2) = 60\cdot9 = \boxed{\textbf{(D) }540}$

*~Irfans123*
## Video Solution 1 (Quick and Simple)
https://youtu.be/d_yfk7pYsSw

*~Education, the Study of Everything*
## Video Solution 2 (Under a minute)
https://youtu.be/7yAh4MtJ8a8?si=88gRS7RBVbN7yCng&t=1290

*~Math-X*
## See Also
