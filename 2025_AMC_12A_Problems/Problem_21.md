# 2025 AMC 12A Problem 21

## Problem 21
There is a unique ordered triple (a,k,m) of nonnegative integers such that $\frac{4^a + 4^{a+k}+4^{a+2k}+\cdots + 4^{a+mk}}{2^a + 2^{a+k} + 2^{a+2k}+ \cdots + 2^{a+mk}} = 964.$ What is a+k+m?

$\textbf{(A) } 8 \qquad \textbf{(B) } 9 \qquad \textbf{(C)} 10 \qquad \textbf{(D) } 11 \qquad \textbf{(E) } 12$
## Solution 1
If $k=0$, then every term in each sum is the same and the quotient is $2^a$, which cannot equal $964$. Thus $k>0$.

Let $q=2^k$. Applying the geometric-series formula to the numerator and denominator gives

$$
\frac{2^{2a}(1-q^{2(m+1)})/(1-q^2)}
     {2^a(1-q^{m+1})/(1-q)}
=2^a\frac{1+q^{m+1}}{1+q}
=964.
$$

Since $q$ is even, $1+q$ is odd and coprime to $2^a$. The displayed equality therefore implies that $1+q$ divides $1+q^{m+1}$, so the fraction after $2^a$ is an odd integer. As

$$
964=2^2\cdot241,
$$

we must have $a=2$, and then

$$
\frac{1+2^{k(m+1)}}{1+2^k}=241.
$$

Rearranging gives

$$
2^k\bigl(2^{km}-241\bigr)=240.
$$

Here $m>0$, since $m=0$ would make the left-hand side negative. Thus $2^{km}-241$ is a positive odd integer. The full power of $2$ in $240$ is $16$, so $2^k=16$ and $k=4$. It follows that

$$
2^{4m}-241=15,
$$

so $2^{4m}=256=2^8$ and $m=2$.

Therefore

$$
a+k+m=2+4+2=8,
$$

and the answer is $\boxed{\textbf{(A)}\ 8}$.
## Solution 1.1
We start from this equation derived in Solution 1:


$$
\begin{equation}
\frac{1+2^{k(m+1)}}{1+2^k} = 241
\end{equation}
$$


Note that $241=256-16+1=16^2-16+1$. Also note that this looks similar to the second term in the Sum of Cubes factorization a^3+b^3=(a+b)(a^2-ab+b^2). Specifically, when $a=16$ and $b=1$, the right term is 16^2-16+1. Thus, $\frac{16^3+1^3}{16+1}=241.$ We rewrite: $\frac{1+2^{12}}{1+2^4}=241$

We can then get that $m = 2$ and $k=4$, and proceed as above.

*~happyfroggy(first time writing solution pls edit)*
## Video Solution 1 by OmegaLearn.org
https://youtu.be/Cx8BScqcx6U
## Video Solution 2 by SpreadTheMathLove
https://www.youtube.com/watch?v=Y9sG6vZPDQo
