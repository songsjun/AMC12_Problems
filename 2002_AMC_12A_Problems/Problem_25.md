# 2002 AMC 12A Problem 25

## Problem
The nonzero coefficients of a polynomial P with real coefficients are all replaced by their mean to form a polynomial Q. Which of the following could be a graph of y = P(x) and y = Q(x) over the interval $-4\leq$ x $\leq 4$?

[File:2002AMC12A25.png](https://artofproblemsolving.com/wiki/index.php/File:2002AMC12A25.png)
## Solution 1
The sum of the coefficients of P and of Q will be equal, so P(1) = Q(1). The only answer choice with an intersection between the two graphs at $x = 1$ is **(B)**. (The polynomials in the graph are $P(x) = 2x^4-3x^2-3x-4$ and $Q(x) = -2x^4-2x^2-2x-2$.)
## Solution 2
We know every coefficient is equal, so we get $ax^n + ... + ax +a = 0$ which equals $x^n + ... + x + 1 = 0.$ We see apparently that x cannot be positive, for it would yield a number greater than zero for Q(x). We look at the zeros of the answer choices. A, C, D, and E have a positive zero, which eliminates them. B is the answer.
## Solution 2a
Proceed similarly to Solution 2. However, note that $x^n + ... + x + 1$ is a factor of $x^{n+1}-1$. The only potential zeroes of $x^{n+1}-1$ are 1 and -1 if $n+1$ is even.  Since none of the graphs have a zero at exactly negative one, the solution is the graph with no zeroes, which is $\boxed{(B)}.$

~~AndrewZhong2012~~
## See Also
