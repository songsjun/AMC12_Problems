# 2019 AMC 12A Problem 3

> This problem is the same as [2019 AMC 10A #4](https://artofproblemsolving.com/wiki/index.php/2019_AMC_10A_Problems) and [2019 AMC 12A #3](https://artofproblemsolving.com/wiki/index.php/2019_AMC_12A_Problems).
## Problem
A box contains $28$ red balls, $20$ green balls, $19$ yellow balls, $13$ blue balls, $11$ white balls, and $9$ black balls. What is the minimum number of balls that must be drawn from the box without replacement to guarantee that at least $15$ balls of a single color will be drawn?

$\textbf{(A) } 75 \qquad\textbf{(B) } 76 \qquad\textbf{(C) } 79 \qquad\textbf{(D) } 84 \qquad\textbf{(E) } 91$
## Solution
We try to find the worst case scenario where we can find the maximum number of balls that can be drawn while getting $<15$ of each color by applying the [pigeonhole principle](https://artofproblemsolving.com/wiki/index.php/pigeonhole_principle) and through this we get a perfect guarantee.
Namely, we can draw up to $14$ red balls, $14$ green balls, $14$ yellow balls, $13$ blue balls, $11$ white balls, and $9$ black balls, for a total of $75$ balls, without drawing $15$ balls of any one color. Drawing one more ball guarantees that we will get $15$ balls of one color — either red, green, or yellow. Thus, the answer is $75 + 1 = \boxed{\textbf{(B) } 76}$.
## Solution 2 (cheese)
After a thorough look through the answer choices we see that 75 and 76 are only one from each other, AoPs may have predicted that some people might silly this problem and pick 75 after seeing that it was an answer choice. Also accounting the fact that this is problem 4 you can relatively safely pick 76 immediately after seeing the answer choices.


Note: but, we would need to know that it's possible to silly and choose the answer choice of 75 after adding $14(3)+13+11+9=75$ and forgetting to add 1. Thus, better to make the quick calculation rather than use a cheese.

*~yvz2900*
## Video Solution 1
https://youtu.be/givTTqH8Cqo

Education, The Study of Everything
## Video Solution 2
https://youtu.be/8WrdYLw9_ns?t=23

*~pi_is_3.14*
## Video Solution 3
https://youtu.be/2HmS3n1b4SI

*~savannahsolver*
## See Also
