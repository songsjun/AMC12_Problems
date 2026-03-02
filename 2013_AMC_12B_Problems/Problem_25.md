# 2013 AMC 12B Problem 25

## Problem
Let G be the set of polynomials of the form
$$P(z)=z^n+c_{n-1}z^{n-1}+\cdots+c_2z^2+c_1z+50,$$
where  $c_1,c_2,\cdots,c_{n-1}$  are integers and P(z) has distinct roots of the form a+ib with a and b integers. How many polynomials are in G?

$\textbf{(A)}\ 288\qquad\textbf{(B)}\ 528\qquad\textbf{(C)}\ 576\qquad\textbf{(D)}\ 992\qquad\textbf{(E)}\ 1056$
## Solution 1
If we factor into irreducible polynomials (in $\mathbb{Q}$[x]), each factor $f_i$ has exponent 1 in the factorization and degree at most 2 (since the a+bi with $b\ne0$ come in conjugate pairs with product a^2+b^2). Clearly we want the product of constant terms of these polynomials to equal 50; for d\mid 50, let f(d) be the number of permitted $f_i$ with constant term d. It's easy to compute f(1)=2, f(2)=3, f(5)=5, f(10)=5, f(25)=6, f(50)=7, and obviously $f(d) = 1$ for negative d\mid 50.

Note that by the distinctness condition, the only constant terms d that can be repeated are those with $d^2$\mid 50 and f(d)>1, i.e. +1 and +5. Also, the +$1s$ don't affect the product, so we can simply count the number of polynomials with no constant terms of +1 and multiply by $2^{f(1)} = 4$ at the end.

We do casework on the (unique) even constant term $d\in\{\pm2,\pm10,\pm50\}$ in our product. For convenience, let F(d) be the number of ways to get a product of 50/d without using $\pm 1 (s$o only using $\pm5,\pm25)$ and recall f(-1) = 1; then our final answer will be $2^{f(1)}\sum_{d\in\{2,10,50\}}(f(-d)+f(d))(F(-d)+F(d)).$ It's easy to compute F(-50)=0, F(50)=1, F(-10)=f(5)=5, F(10)=f(-5)=1, F(-2)=f(-25)+f(-5)f(5)=6, F(2)=f(25)+$\binom{f(5)}{2}=16,$ so we get
$$4 [ (1+3)(6+16) + (1+5)(1+5) + (1+7)(0+1) ] = 4[132] = \boxed{\textbf{(B) }528}$$
## Solution 2
Disregard sign; we can tack on $x-1$ if the product ends up being negative.

1: $\pm$ i,-1 (2) (1 is not included)

$$2: \pm 2, \pm 1\pm i (4)$$

$$5: \pm 2\pm i, \pm 1\pm 2i, \pm 5 (6)$$

$$10: \pm 3\pm i, \pm 1\pm 3i, \pm 10 (6)$$

$$25: \pm 25, \pm 3\pm 4i, \pm 4\pm 3i, \pm 5i (7)$$

$$50: \pm 50, \pm 1\pm 7i, \pm7\pm i, \pm 5\pm 5i (8)$$

Our answer is $2^2\left(4\cdot\binom{6}{2}+6\cdot 6+4\cdot 7+8\right)=\boxed{528.}$
## Solution 3
By Vieta's formula 50 is the product of all n roots. As the roots are all in the form a + bi, there must exist a conjugate a-bi for each root.

$$(a+bi)(a-bi) = a^2 + b^2$$

$$50 = 2 \cdot 5^2$$

If a $\neq$ b $\neq 0,$ the roots can be a $\pm$ bi, -a $\pm$ bi, b $\pm$ ai, -b $\pm$ ai, totaling 4 pairs of roots.

If a = b, the roots can be a $\pm$ ai, -a $\pm$ ai, totaling 2 pairs of roots.

If a $\neq$ b, $b = 0$, the roots can be $\pm$ a, $\pm$ ai, totaling 2 pairs of roots.


$$
\begin{align*} 2 \cdot 25 &= (1^2+1^2)5^2 &: 2 \cdot 2 = 4\\ 2 \cdot 25 &= 2 \cdot 5^2 &: 2 \cdot 2 = 4\\ 2 \cdot 25 &= (1^2+1^2) \cdot (3^2+4^2) &: 2 \cdot 4 = 8\\ 2 \cdot 25 &= 2 \cdot (3^2+4^2) &: 2 \cdot 4 = 8 \end{align*}
$$


$$
\begin{align*} 10 \cdot 5 &= (1^2+3^2)(1^2+2^2) &&: 4 \cdot 4 = 16\\ 10 \cdot 5 &= 10 \cdot (1^2+2^2) &&: 2 \cdot 4 = 8\\ 10 \cdot 5 &= (1^2+3^2) \cdot 5 &&: 4 \cdot 2 = 8\\ 10 \cdot 5 &= 10 \cdot 5 &&: 2 \cdot 2 = 4\\ \end{align*}
$$


$$
\begin{align*} 2 \cdot 5 \cdot 5&= (1^2+1^2)(1^2+2^2)(1^2+2^2) &&: 2 \cdot 4 \cdot 4 = 32\\ 2 \cdot 5 \cdot 5&= 2 \cdot (1^2+2^2)(1^2+2^2) &&: 2 \cdot 4 \cdot 4 = 32\\ 2 \cdot 5 \cdot 5&= 2 \cdot 5 \cdot (1^2+2^2) &&: 2 \cdot 2 \cdot 4 = 16\\ 2 \cdot 5 \cdot 5&= 2 \cdot 5 \cdot 5 &&: 2 \cdot 2 \cdot 2 = 8\\ 2 \cdot 5 \cdot 5&= (1^2+1^2) \cdot 5 \cdot (1^2+2^2) &&: 2 \cdot 2 \cdot 4 = 16\\ 2 \cdot 5 \cdot 5&= (1^2+1^2) \cdot 5 \cdot 5 &&: 2 \cdot 2 \cdot 2 = 8\\ \end{align*}
$$


$$
\begin{align*} (1^2+7^2) &: 4\\ (5^2+5^2) &: 2\\ 50 &: 2 \end{align*}
$$


$$4+4+8+8+16+8+8+4+32+32+16+8+16+8+4+2+2 = 176$$

For each case $1^2$ can be added, yielding 2 more cases ($\pm 1, \pm$ i). 176 $\cdot 3 = \boxed{\textbf{(B) }528}$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## See also
