# 2020 AMC 12B Problem 23

## Problem
How many integers n $\geq 2$ are there such that whenever $z_1, z_2, ..., z_n$ are complex numbers such that

|$z_$1| = |$z_$2| = ... = |$z_n$| = 1 $\text{ and }z_$1 + $z_$2 + ... + $z_n = 0$,
then the numbers $z_1, z_2, ..., z_n$ are equally spaced on the unit circle in the complex plane?

$\textbf{(A)}\ 1 \qquad\textbf{(B)}\ 2 \qquad\textbf{(C)}\ 3 \qquad\textbf{(D)}\ 4 \qquad\textbf{(E)}\ 5$
## Solution
For $n=2$, we see that if $z_{1}+z_{2}=0$, then $z_{1}=-z_{2}$, so they are evenly spaced along the unit circle.

For $n=3$, WLOG, we can set $z_{1}=1$. Notice that now Re$(z_{2}+z_{3})$=-1 and Im$\{z_{2}\}$ = -Im$\{z_{3}\}$. This forces $z_{2}$ and $z_{3}$ to be equal to $e^{i\frac{2\pi}{3}}$ and $e^{-i\frac{2\pi}{3}}$, meaning that all three are equally spaced along the unit circle.

We can now show that we can construct complex numbers when $n\geq 4$ that do not satisfy the conditions in the problem.

Suppose that the condition in the problem holds for some n=k. We can now add two points $z_{k+1}$ and $z_{k+2}$ anywhere on the unit circle such that $z_{k+1}=-z_{k+2}$, which will break the condition. Now that we have shown that $n=2$ and $n=3$ works, by this construction, any $n\geq 4$ does not work, making the answer $\boxed{\textbf{(B)} 2}.$

*~Solution by Qqqwerw*
*~Minor edit made by HappySharks*
## Video Solution by On The Spot STEM
https://www.youtube.com/watch?v=JOgSOni5HhM
## See Also
