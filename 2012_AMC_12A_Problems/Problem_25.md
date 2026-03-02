# 2012 AMC 12A Problem 25

## Problem
Let f(x)=|$2\{x\}-1$| where $\{x\}$ denotes the fractional part of x.  The number n is the smallest positive integer such that the equation nf(xf(x))=x has at least 2012 real solutions.  What is n?  **Note:** the fractional part of x is a real number $y=\{x\}$ such that $0\le$ y<1 and x-y is an integer.

$\textbf{(A)}\ 30\qquad\textbf{(B)}\ 31\qquad\textbf{(C)}\ 32\qquad\textbf{(D)}\ 62\qquad\textbf{(E)}\ 64$
## Solution
Our goal is to determine how many times the graph of nf(xf(x))=x intersects the graph of y=x. (Conversely, we can also divide the equation by n to get f(xf(x))=$\frac{x}{n}$ and look at the graph $y=\frac{x}{n})$

We begin by analyzing the behavior of $\{x\}$. It increases linearly with a slope of one, then when it reaches the next integer, it repeats itself. We can deduce that the function is like a sawtooth wave, with a period of one. We then analyze the function f(x)=|$2\{x\}-1$|. The slope of the teeth is multiplied by 2 to get 2, and the function is moved one unit downward. The function can then be described as starting at -1, moving upward with a slope of 2 to get to 1, and then repeating itself, still with a period of 1. The absolute value of the function is then taken. This results in all the negative segments becoming flipped in the Y direction. The positive slope starting at -1 of the function ranging from u to u.5, where u is any arbitrary integer, is now a negative slope starting at positive 1.   The function now looks like the letter V repeated within every square in the first row.

It is now that we address the goal of this, which is to determine how many times the function intersects the line y=x. Since there are two line segments per box, the function has two chances to intersect the line y=x for every integer. If the height of the function is higher than y=x for every integer on an interval, then every chance within that interval intersects the line.

Returning to analyzing the function, we note that it is multiplied by x, and then fed into f(x). Since f(x) is a periodic function, we can model it as multiplying the function's frequency by x. This gives us $2x$ chances for every integer, which is then multiplied by 2 once more to get $4x$ chances for every integer. The amplitude of this function is initially 1, and then it is multiplied by n, to give an amplitude of n. The function intersects the line y=x for every chance in the interval of $0\leq$ x $\leq$ n, since the function is n units high. The function ceases to intersect y=x when n < x, since the height of the function is lower than y=x.

The number of times the function intersects y=x is then therefore equal to 4+8+12...+$4n$. We want this sum to be greater than 2012 which occurs when $n=32\Rightarrow \boxed{(C)}$ .
## Video Solution by Richard Rusczyk
https://artofproblemsolving.com/videos/amc/2012amc12a/256

*~dolphin7*
## See Also
