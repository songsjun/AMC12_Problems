# 2010 AMC 12B Problem 9

## Problem
Let n be the smallest positive integer such that n is divisible by $20, n^2$ is a perfect cube, and $n^3$ is a perfect square. What is the number of digits of n?

$\textbf{(A)}\ 3 \qquad \textbf{(B)}\ 4 \qquad \textbf{(C)}\ 5 \qquad \textbf{(D)}\ 6 \qquad \textbf{(E)}\ 7$
## Solution
We know that $n^2 = k^3$ and  n^3 = m^2 . Cubing and squaring the equalities respectively gives  $n^6 = k^9 = m^4 . Let a = n^6. Now$ we know a must be a perfect 36-th power because lcm(9,4) = 36, which means that n must be a perfect 6-th power. The smallest number whose sixth power is a multiple of 20 is 10, because the only prime factors of 20 are 2 and 5, and 10 = 2 $\times 5.$ Therefore our is equal to number $10^6 = 1000000,$ with 7 digits $\Rightarrow \boxed$ {E}.
## Solution 2 (Chinese Remainder Theorem)
Let $n = 2^2 \cdot 5 \cdot$ x for some integer x, then we know that

$$
\begin{align*}
n^2 = 2^4 \cdot 5^2 \cdot x^2 = m_0^3\\
n^3 = 2^6 \cdot 5^3 \cdot x^3 = m_1^2
\end{align*}
$$

Since we have $2^4 \cdot 5^2 \cdotx^2 a$ power of 3, that means, by the Fundamental Theorem of Arithmetic, the exponents of the primes must each be divisible by 3. This also means that there's no point in p \mid x if p $\not \in\{2,3\}$, since that would just serve to increase n and we want n to be minimal.

This means we can write x = $2^{\alpha}\cdot 5^{\beta}$ and thus we have
$2^4 \cdot 5^2 \cdot 2^{2\alpha} \cdot 5^{2\beta} = 2^{4 + 2\alpha} \cdot 5^{2 + 2\beta} =m_0^3$, therefore we know

$$
\begin{align*}
4 + 2\alpha \equiv 0 \pmod{3}\\
2 + 2\beta \equiv 0 \pmod{3}
\end{align*}
$$

and doing the same with the third equation being a square, we have

$$
\begin{align*}
6 + 3\alpha \equiv 0 \pmod{2}\\
3 + 3\beta \equiv 0 \pmod{2}
\end{align*}
$$

We can shift this around into two systems involving the same variables, as follows:

$$
\begin{align*}
\alpha \equiv 0 \pmod{2}\\
1 + 2\alpha \equiv 0 \pmod{3}
\end{align*}
$$

and

$$
\begin{align*}
1 + \beta \equiv 0 \pmod{2} \\
2 + 2\beta \equiv 0 \pmod{3}\\
\end{align*}
$$

And using [Chinese Remainder Theorem](https://artofproblemsolving.com/wiki/index.php/Chinese_Remainder_Theorem) to solve this, we get $\alpha = 4$ and $\beta = 5,$ and plugging that back in yields $n = 2^6 \cdot 5^6.$

Thus, our answer is $\lfloor{ \log_{10}(2^6 \cdot 5^6) + 1 \rfloor} \Rightarrow \boxed$ {E}.

~ $\color{magenta}$ zoomanTV
## See also
