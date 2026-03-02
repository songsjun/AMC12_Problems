# 2005 AMC 12B Problem 12

> This problem is the same as [2005 AMC 12B #12](https://artofproblemsolving.com/wiki/index.php/2005_AMC_12B_Problems) and [2005 AMC 10B #16](https://artofproblemsolving.com/wiki/index.php/2005_AMC_10B_Problems).
## Problem
The [quadratic equation](https://artofproblemsolving.com/wiki/index.php/quadratic_equation) x^2+mx+n has roots twice those of $x^2+px+m,$ and none of m,n, and p is zero. What is the value of n/p?

$\textbf{(A) }\ } \qquad \textbf{(B) }\ } \qquad \textbf{(C) }\ } \qquad \textbf{(D) }\ } \qquad \textbf{(E) }\ }$
## Solutions
### Solution 1
Let $x^2 + px +m = 0$ have roots a and b. Then

$$x^2 + px + m = (x-a)(x-b) = x^2 - (a+b)x + ab,$$

so p = -(a+b) and m = ab. Also, x^2 + mx + $n = 0$ has roots $2a$ and $2b$, so

$$x^2 + mx + n = (x-2a)(x-2b) = x^2 - 2(a+b)x + 4ab,$$

and m = -$2(a+b)$ and n = 4ab. Thus $\frac{n}{p} = \frac{4ab}{-(a+b)} = \frac{4m}{\frac{m}{2}} = \boxed{\textbf{(D) }8}.$

To test that this actually works, consider the quadratics $x^2 +$ 8x + 16 = 0,\ $x^2 +16x + 64 = 0$.
### Solution 2
If the roots of $x^2 + mx +n = 0$ are $2a$ and $2b$ and the roots of $x^2 + px +m = 0$ are a and b, then using Vieta's formulas,

$$
2a + 2b = -m
a + b = -p
2a(2b) = n
a(b) = m
$$

Therefore, substituting the second equation into the first equation gives
$$m = 2(p)$$
and substituting the fourth equation into the third equation gives
$$n = 4(m)$$
Therefore, $n =8p$, so $\frac{n}{p}= \boxed{\textbf{(D) }8}$
## Video Solution
https://youtu.be/3dfbWzOfJAI?t=1023

*~pi_is_3.14*
## See also
- [Vieta's Formulas](https://artofproblemsolving.com/wiki/index.php/Vieta's_Formulas)
