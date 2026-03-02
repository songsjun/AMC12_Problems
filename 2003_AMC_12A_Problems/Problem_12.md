# 2003 AMC 12A Problem 12

> This problem is the same as [2003 AMC 12A #12](https://artofproblemsolving.com/wiki/index.php/2003_AMC_12A_Problems) and [2003 AMC 10A #24](https://artofproblemsolving.com/wiki/index.php/2003_AMC_10A_Problems).
## Problem
Sally has five red cards numbered 1 through 5 and four blue cards numbered 3 through 6. She stacks the cards so that the colors alternate and so that the number on each red card divides evenly into the number on each neighboring blue card. What is the sum of the numbers on the middle three cards?


$$\mathrm{(A) \ } 8\qquad \mathrm{(B) \ } 9\qquad \mathrm{(C) \ } 10\qquad \mathrm{(D) \ } 11\qquad \mathrm{(E) \ } 12$$

## Solution
Let $R_i$ and $B_j$ designate the red card numbered i and the blue card numbered j, respectively.

$B_5$ is the only blue card that $R_5$ evenly divides, so $R_5$ must be at one end of the stack and $B_5$ must be the card next to it.

$R_1$ is the only other red card that evenly divides $B_5$, so $R_1$ must be the other card next to $B_5$.

$B_4$ is the only blue card that $R_4$ evenly divides, so $R_4$ must be at one end of the stack and $B_4$ must be the card next to it.

$R_2$ is the only other red card that evenly divides $B_4$, so $R_2$ must be the other card next to $B_4$.

$R_2$ doesn't evenly divide $B_3$, so $B_3$ must be next to $R_1, B_6$ must be next to $R_2$, and $R_3$ must be in the middle.

This yields the following arrangement from top to bottom: $\{R_5,B_5,R_1,B_3,R_3,B_6,R_2,B_4,R_4\}$

Therefore, the sum of the numbers on the middle three cards is $3+3+6=\boxed{\mathrm{(E)}\ 12}.$
## Video Solution
https://www.youtube.com/watch?v=Q30Dt8q7vm4&feature=youtu.be
## See Also
