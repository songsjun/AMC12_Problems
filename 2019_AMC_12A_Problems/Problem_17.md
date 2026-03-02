# 2019 AMC 12A Problem 17

## Problem
Let $s_k$ denote the sum of the $\textit{k}$th powers of the roots of the polynomial $x^3-5x^2+8x-13$. In particular, $s_0=3, s_1=5$, and $s_2=9$. Let a, b, and c be real numbers such that $s_{k+1}$ = a \, $s_k$ + b \, $s_{k-1}$ + c \, $s_{k-2}$ for $k = 2$, 3, .... What is a+b+c?

$\textbf{(A)} \; -6 \qquad \textbf{(B)} \; 0 \qquad \textbf{(C)} \; 6 \qquad \textbf{(D)} \; 10 \qquad \textbf{(E)} \; 26$
## Solution 1
Applying [https://artofproblemsolving.com/wiki/index.php/Newton's_Sums Newton's Sums], we $haves_{k+1}$+(-5)$s_k$+($8)s_{k-1}+(-13)s_{k-2}=$0,$sos_{k+1}$=$5s_k-8s_{k-1}+13s_{k-2}$,we get the answer as 5+(-8)+13=10.
## Solution 2
Let p, q, and r be the roots of the polynomial. Then,

$$p^3 - 5p^2 + 8p - 13 = 0$$

$$q^3 - 5q^2 + 8q - 13 = 0$$

$$r^3 - 5r^2 + 8r - 13 = 0$$

Adding these three equations, we get

$$(p^3 + q^3 + r^3) - 5(p^2 + q^2 + r^2) + 8(p + q + r) - 39 = 0$$

$$s_3 - 5s_2 + 8s_1 = 39$$

39 can be written as $13s_0$, giving

$$s_3 = 5s_2 - 8s_1 + 13s_0$$

We are given that $s_{k+1}$ = a \, $s_k$ + b \, $s_{k-1}$ + c \, $s_{k-2}$ is satisfied for $k = 2$, 3, ...., meaning it must be satisfied when $k = 2$, giving us $s_$3 = a \, $s_$2 + b \, $s_$1 + c \, $s_0$.

Therefore, $a = 5$, b = -8, and $c = 13$ by matching coefficients.

$$5 - 8 + 13 = \boxed{\textbf{(D) } 10}.$$
## Solution 3
Let p, q, and r be the roots of the polynomial. By Vieta's Formulae, we have

$$p+q+r = 5$$

$$pq+qr+rp = 8$$

pqr=13.

We know $s_k$ = p^k + q^k + r^k. Consider (p+q+r)($s_k) =5s_k$.


$$5s_k = [p^{k+1} + q^{k+1} + r^{k+1}] + p^k q + p^k r + pq^k + q^k r + pr^k + qr^k$$


Using pqr = 13 and $s_{k-2}=p^{k-2}+q^{k-2}+r^{k-2}$, we see
$13s_{k-2}=p^{k-1}$qr + $pq^{k-1}$r + $pqr^{k-1}$.

We have $\begin{split} $5s_k + $13s_{k-2}$ &= $s_{k+1}+ (p^k q + p^k r +p^{k-1}qr) + (pq^k +pq^{k-1}r + q^k r) + ($$pqr^{k-1}+ pr^k + qr^k)$ \\ &= $s_{k+1}+p^{k-1}$ (pq + pr + qr) + $q^{k-1}$ (pq + pr + qr) + $r^{k-1}$ (pq + pr + qr) \\ &= $s_{k+1}+ (p^{k-1}+q^{k-1}+r^{k-1})(pq + pr + qr)$ \\ &= $5s_k+13s_{k-2}=s_{k+1}$ + $8s_{k-1}\end{split}$

Rearrange to get
$$s_{k+1} = 5s_k - 8s_{k-1} + 13s_{k-2}$$

$$So, a+ b + c = 5 -8 + 13 = \boxed{\textbf{(D) } 10}.$$

*~gregwwl*
## Solution 4
Let r,s,t be the roots of $x^3-5x^2+8x-13$. Then:


$$
r^3=5r^2-8r+13 \\
s^3=5s^2-8s+13 \\
t^3=5t^2-8t+13
$$


If we multiply both sides of the equation by $r^k,$ where k is a positive integer, then that won't change the coefficients, but just the degree of the new polynomial and the other term's exponents. We can try multiplying to find $r^4+s^4+t^4,$ but that is just to check. So then with the above information about $r^3,s^3,t^3,$ we see that:


$$
r^k=5r^{k-1}-8r^{k-2}-13r^{k-3},
s^k=5s^{k-1}-8s^{k-2}-13s^{k-3},
t^k=5t^{k-1}-8t^{k-2}-13t^{k-3}
$$


$$s_k=r^k+s^k+t^k$$

Then: $s_k=5s_{k-1}-8s_{k-2}+13s_{k-3}$

This means that $s_{k+1}=5s_{k}-8s_{k-1}+13s_{k-2}$, as expected. So we have $a=5, b=-8, c=13$. So our answer is $5-8+13=\boxed{\textbf{(D) } 10}$

*~IzhanAli*
## Solution 5
Let the roots be r, s, and t. We know $r^2+s^2+t^2 = (r+s+t)(r+s+t) -2(rs+st+tr)$.Continuing, we have:

r^3+s^3+t^3 = (r^2+s^2+t^2)(r+s+t) - (rs+st+tr)(r+s+t)+3rst

r^4+s^4+t^4 = (r^3+s^3+t^3)(r+s+t) - (rs+st+tr)(r^2+s^2+t^2)-(rst)(r+s+t)

r^5+s^5+t^5 = (r^4+s^4+t^4)(r+s+t) - (rs+st+tr)(r^3+s^3+t^3) - (rst)(r^2+s^2+t^2)

Clearly, the answer is 5-8+13 = $\boxed{\textbf{(D)} 10}$

*~skibbysiggy*
## Solution 6
Let $\alpha, \beta,$ and $\gamma$ be the roots of the polynomial. By definition, the following equations are true.

$$
\begin{align*} s_{k + 1} &= \alpha^{k + 1} + \beta^{k + 1} + \gamma^{k + 1} \\ s_k &= \alpha^k + \beta^k + \gamma^k \\ s_{k - 1} &= \alpha^{k - 1} + \beta^{k - 1} + \gamma^{k - 1} \\ s_{k - 2} &= \alpha^{k - 2} + \beta^{k - 2} + \gamma^{k - 2} \end{align*}
$$

The equations could be used to find the relationships between the roots and a, b, and c.

$$
\begin{align*} \alpha^{k + 1} + \beta^{k + 1} + \gamma^{k + 1} &= a(\alpha^k + \beta^k + \gamma^k) + b(\alpha^{k - 1} + \beta^{k - 1} + \gamma^{k - 1}) + c(\alpha^{k - 2} + \beta^{k - 2} + \gamma^{k - 2}) \\ &= \alpha^{k - 2}(c + b\alpha + a\alpha^2) + \beta^{k - 2}(c + b\beta + a\beta^2) + \gamma^{k - 2}(c + b\gamma + a\gamma^2) \end{align*}
$$

Continuing,

$$\alpha^{k - 2}(\alpha^3 - a\alpha^2 - b\alpha - c) + \beta^{k - 2}(\beta^3 - a\beta^2 - b\beta - c) + \gamma^{k - 2}(\gamma^3 - a\gamma^2 - b\gamma - c) = 0$$

Notice that if $x^3 - ax^2 - bx -c = 0$, the equation will satisfy. Thus, $a = 5, b = -8, c = 13$. Therefore, a + b + $c =\boxed{\textbf{(D)} 10}.$

*~MaPhyCom*
## Video Solution
For those who want a video solution: https://www.youtube.com/watch?v=tAS_DbKmtzI
## See Also
