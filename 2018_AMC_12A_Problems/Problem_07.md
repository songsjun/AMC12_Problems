# 2018 AMC 12A Problem 7

> This problem is the same as [2018 AMC 10A #7](https://artofproblemsolving.com/wiki/index.php/2018_AMC_10A_Problems/Problem_7) and [2018 AMC 12A #7](https://artofproblemsolving.com/wiki/index.php/2018_AMC_12A_Problems/Problem_7).
## Problem
For how many (not necessarily positive) integer values of $n$ is the value of $\cdot \left(\tfrac{2}{5}\right)^n$ an integer?

$\textbf{(A) }3 \qquad
$\textbf{(B) }4 \qquad$
$\textbf{(C) }6 \qquad$
$\textbf{(D) }8 \qquad$
$\textbf{(E) }9 \qquad$$
## Solution 1 (Algebra)
Note that

$$4000\cdot \left(\frac{2}{5}\right)^n=\left(2^5\cdot5^3\right)\cdot \left(2\cdot5^{-1}\right)^n=2^{5+n}\cdot5^{3-n}.$$


Since this expression is an integer, we need:
<ol style="margin-left: 1.5em;">
  <li>$\geq0,$ from which $n\geq-5.$</li><p>
  <li>$\geq0,$ from which $n\leq3.$</li><p>
</ol>
Taking the intersection gives $\leq \leq3.$ So, there are $3-(-5)+1=\boxed{\textbf{(E) }9}$ integer values of $n.$

*~MRENTHUSIASM*
## Solution 2 (Observations)
Note that $\cdot \left(\frac{2}{5}\right)^n$ will be an integer if the denominator is a factor of $4000$. We also know that the denominator will always be a power of $5$ for positive values and a power of $2$ for all negative values. So we can proceed to divide
$4000$ by $5^n$ for each increasing positive value of $n$ until we get a non-factor of $4000$ and also divide $4000$ by $2^{-n}$ for each decreasing negative value of $n$. For positive values we get $n= 1, 2, 3$ and for negative values we get $n= -1, -2, -3, -4, -5$. Also keep in mind that the expression will be an integer for $n=0$, which gives us a total of $\boxed{\textbf{(E) }9}$ for $n.$
## Solution 3 (Brute Force)
The values for $n$ are $-5, -4, -3, -2, -1, 0, 1, 2,$ and $3.$

The corresponding values for $\cdot \left(\frac{2}{5}\right)^n$ are $390625, 156250, 62500, 25000, 10000, 4000, 1600, 640,$ and $256,$ respectively.

In total, there are $\boxed{\textbf{(E) }9}$ values for $n.$

*~Little ~MRENTHUSIASM*
## Video Solution (HOW TO THINK CREATIVELY!)
https://youtu.be/vzyRAnpnJes

Education, the Study of Everything
## Video Solution
https://youtu.be/ZiZVIMmo260
## Video Solution
https://youtu.be/2vz_CnxsGMA

*~savannahsolver*
## Video Solution by OmegaLearn
https://youtu.be/ZhAZ1oPe5Ds?t=1763

*~pi_is_3.14*
## See Also
