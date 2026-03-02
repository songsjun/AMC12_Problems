# 2005 AMC 12B Problem 21

## Problem
A positive integer n has 60 divisors and $7n$ has 80 divisors.  What is the greatest integer k such that $7^k$ divides n?


$$\mathrm{(A)}\ } \qquad \mathrm{(B)}\ } \qquad \mathrm{(C)}\ } \qquad \mathrm{(D)}\ } \qquad \mathrm{(E)}\ }$$

## Solution
We may let $n = 7^k\cdot$ m, where m is not divisible by 7. Using the fact that the number of divisors function d(n) is multiplicative, we have $d(n) = d(7^k)d(m)$ = ($k+1)d(m) = 60.$ Also, d$(7n) = d(7^{k+1})d(m) = (k+2)d(m) = 80.$ These numbers are in the ratio 3:4, so $\frac{k+1}{k+2} = \frac{3}{4} \impliesk = 2\Rightarrow \boxed{\mathrm{C}}.$
## See also
