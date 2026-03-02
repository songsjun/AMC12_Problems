# 2007 AMC 12B Problem 15

## Problem
The geometric series $a+ar+ar^2\ldots$ has a sum of 7, and the terms involving odd powers of r have a sum of 3. What is a+r?

$\textbf{(A)}\ \frac{4}{3}\qquad\textbf{(B)}\ \frac{12}{7}\qquad\textbf{(C)}\ \frac{3}{2}\qquad\textbf{(D)}\ \frac{7}{3}\qquad\textbf{(E)}\ \frac{5}{2}$
## Solution 1
The sum of an infinite geometric series is given by $\frac{a}{1-r}$ where a is the first term and r is the common ratio.

In this series, $\frac{a}{1-r} = 7$

The series with odd powers of r is given as $ar + ar^3 + ar^5 ...$

Its sum can be given by $\frac{ar}{1-r^2} = 3$

Doing a little algebra

$$ar = 3(1-r)(1+r)$$

$$ar = 3\left(\frac{a}{7}\right)(1+r)$$

$$\frac{7}{3}r = 1 + r$$

$$r = \frac{3}{4}$$

$$a = 7(1-r) = \frac{7}{4}$$

$$a + r =\boxed{ \frac{5}{2}} \Rightarrow \mathrm{(E)}$$
## Solution 2
The given series can be decomposed as follows: $(a + ar + ar^2 +\ldots) = (a +ar^2 + ar^4 +\ldots) + (ar + ar^3 + ar^5 +\ldots)$

Clearly (a + ar^2 + ar^4 + $\ldots) = (ar + ar^3 + ar^5 +\ldots)/r = 3$/r. We obtain that 7 = 3/r + 3, hence $r =\frac{3}{4}.$

Then from $7 = (a + ar + ar^2 +\ldots) = \frac{a}{1-r}$ we get $a=\frac{7}{4},$ and thus a + r = $\boxed{\frac{5}{2}}.$
## See Also
