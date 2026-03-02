# 2007 AMC 12B Problem 17

## Problem
If a is a nonzero integer and b is a positive number such that $ab^2=\log_{10}$b, what is the median of the set $\{0,1,a,b,1/b\}$?


$$\mathrm{(A)}\ 0 \qquad \mathrm{(B)}\ 1 \qquad \mathrm{(C)}\ a \qquad \mathrm{(D)}\ b \qquad \mathrm{(E)}\ \frac{1}{b}$$

## Solution
Note that if a is positive, then, the equation will have no solutions for b. This becomes more obvious by noting that at $a=1, ab^2 > \log_{10}$ b. The LHS quadratic function will increase faster than the RHS logarithmic function, so they will never intersect.

This puts a as the smallest in the set since it must be negative.

Checking the new equation: $-b^2 =\log_{10}$b

Near $b=0, -b^2 > \log_{10}$ b but at $b=1, -b^2 < \log_{10}$ b

This implies that the solution occurs somewhere in between: 0 < b < 1

This also implies that $\frac{1}{b} > 1$

This makes our set (ordered)
$$\{a,0,b,1,1/b\}$$

The median is b $\Rightarrow \mathrm$ {(D)}
## Solution 2
Let $b=0.1$. Then $a\cdot0.01 = -1,$ giving a=-100. Then the ordered set is $\{-100, 0, 0.1, 1, 10\}$ and the median is 0.1=b, so the answer is $\mathrm$ {(D)}.
## See Also
