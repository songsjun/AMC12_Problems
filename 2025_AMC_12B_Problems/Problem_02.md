# 2025 AMC 12B Problem 2

> This problem is the same as [2025 AMC 10B #2](https://artofproblemsolving.com/wiki/index.php/2025_AMC_10B_Problems/Problem_2) and [2025 AMC 12B #2](https://artofproblemsolving.com/wiki/index.php/2025_AMC_12B_Problems/Problem_2).
## Problem
Jerry wrote down the ones digit of each of the first 2025 positive squares: 1, 4, 9, 6, 5, 6, $\dots.$ What is the sum of all the numbers Jerry wrote down?

$\textbf{(A)}~9025 \qquad \textbf{(B)}~9070 \qquad \textbf{(C)}~9090 \qquad \textbf{(D)}~9115 \qquad \textbf{(E)}~9160$
## Solution 1
By a modulo 10 argument, the ones digits repeat with period 10 in the following order:
1,4,9,6,5,6,9,4,1,0
The sum of the numbers can be verified to be 45.

There are 202 periods that occur from 1 to 2025, and there are five extra numbers, those being 1,4,9,6,5, corresponding to 2021,2022,2023,2024,2025. The sum of these numbers is 25.

Hence, the total is
$$202\cdot 45+25=9090+25=\boxed{\textbf{(D)}~9115}$$

~ [https://artofproblemsolving.com/wiki/index.php/User:Eevee9406 eevee9406]

*~Phinetium*
## Solution 2 (Slightly more rigorous than Solution 1, but same idea)
Let $x\equivn\quad\textrm{(mod 10)}.$ We have $x^2\equivn^2\quad\textrm{(mod 10)}.$ So, the numbers must repeat in patterns of 10. Listing them out gives:
1,4,9,6,5,6,9,4,1,0.These numbers sum to 45, so the sum of the first 2020 numbers is $45\cdot202=9090.$ Since we need 5 more numbers, we add $1+4+9+6+5=25$ to our answer to get $\boxed{\textbf{(D)}~9115}.$

*~Franklin2013*
## Solution 3 (Similar to the other solutions but without the use of mods)
The ones digit of a square number is determined by the ones digit of the base.
We can find the pattern by looking at the ones digits of the first ten positive squares:

$$\begin{aligned}$$
$1^2$ &= 1 \\
$2^2$ &= 4 \\
$3^2$ &= 9 \\
$4^$2 &= 16 $\quad (\text{ones digit } 6)$ \\
$5^$2 &= 25 $\quad (\text{ones digit } 5)$ \\
$6^$2 &= 36 $\quad (\text{ones digit } 6)$ \\
$7^$2 &= 49 $\quad (\text{ones digit } 9)$ \\
$8^$2 &= 64 $\quad (\text{ones digit } 4)$ \\
$9^$2 &= 81 $\quad (\text{ones digit } 1)$ \\
$1$0^2 &= 100 $\quad (\text{ones digit } 0)$
$\end{aligned}$

The sequence of ones digits is:

1, 4, 9, 6, 5, 6, 9, 4, 1, 0

This pattern of ten digits repeats for every subsequent group of ten squares (e.g., $11^2$ has the same ones digit as $1^2$, $12^2$ as $2^2$, etc.).

$$1 + 4 + 9 + 6 + 5 + 6 + 9 + 4 + 1 + 0 = 45$$

We now divide by 10 as the pattern repeats every 10 terms: 2025/10 results in 202 full cycles with a remainder of 5. The sum of the 202 full cycles is:

$$202 * 45 = 9090$$

However, we must add back 5 digits, as we had a remainder of 5 when we divided 2025 by 10. Therefore, the sum of the remaining 5 digits is:

$$1 + 4 + 9 + 6 + 5 = 25$$

Thus, the total sum is:

$$9090 + 25 = 9115$$

Therefore, the answer is $\boxed{\textbf{(D)}~9115}.$

*~BryBro7*
## Solution 4: Modular Arithmetic; Ultra-Rigorous, Not Recommended
We want the sum of the ones digits of
$1^2, 2^2, 3^2, \ldots, 2025^2$. The normal way is to notice the pattern repeats every 10, but instead we will approach this with more modular arithmetic than any sane person would tolerate.

Let $f(n) = n^2 \mod 10$, which extracts the ones digit of $n^2$.
We want

$$S = \sum_{n=1}^{2025} f(n).$$

First observe the basic periodicity result:
Since $n^2 \mod 10$ depends only on $n \mod 10$, we have

$$f(n+10) \equiv f(n) \pmod{10}.$$

We will pretend this is deep.

Now compute all residues $n \mod 10$ and their corresponding $n^2 \mod 10$:


$$
\begin{array}{c c} 0^2 & \equiv 0 \\ 1^2 & \equiv 1 \\ 2^2 & \equiv 4 \\ 3^2 & \equiv 9 \\ 4^2 & \equiv 6 \\ 5^2 & \equiv 5 \\ 6^2 & \equiv 6 \\ 7^2 & \equiv 9 \\ 8^2 & \equiv 4 \\ 9^2 & \equiv 1. \end{array}
$$


Instead of immediately summing these, we treat the 10-term sequence as a modular function over the ring $\mathbb{Z}/10\mathbb{Z}$.
Define the sequence $a_k = (k^2 \mod 10)$ for $k \in \mathbb{Z}/10\mathbb{Z}$.
We want the sum

$$T = \sum_{k=0}^9 a_k = 0 + 1 + 4 + 9 + 6 + 5 + 6 + 9 + 4 + 1 = 45.$$

Next, determine how many full cycles of length 10 lie in the first 2025 integers.
Compute

$$2025 \mod 10 \equiv 5.$$

Then

$$2025 = 10 \cdot 202 + 5.$$

So we have 202 complete cycles plus 5 extra terms.

Sum contributed by the full cycles:

$$202 \cdot 45.$$

We now compute this entirely modulo 10 even though we need the actual sum.
First,

$$202 \equiv 2 \pmod{10}, \quad 45 \equiv 5 \pmod{10},$$

so

$$202 \cdot 45 \equiv 2 \cdot 5 = 10 \equiv 0 \pmod{10}.$$

This tells us nothing useful, so abandon that and compute normally:

$$202 \cdot 45 = (200 \cdot 45) + (2 \cdot 45) = 9000 + 90 = 9090.$$

Now handle the leftover 5 terms: $n = 1, 2, 3, 4, 5$.
Compute $n^2 \mod 10$ again even though we already have it:


$$1^2 \equiv 1, \quad 2^2 \equiv 4, \quad 3^2 \equiv 9, \quad 4^2 \equiv 6, \quad 5^2 \equiv 5.$$


Sum:

$$1 + 4 + 9 + 6 + 5 = 25.$$

The full sum is

$$S = 9090 + 25 = 9115.$$

To unnecessarily verify using modular decomposition, write

$$S \equiv \sum_{n=1}^{2025} n^2 \pmod{10}.$$

We can compute the entire sum of squares formula modulo 10 and compare.
Using

$$\sum_{n=1}^N n^2 = \frac{N(N+1)(2N+1)}{6},$$

take $N = 2025$.
Reduce everything modulo 10 first:

$$2025 \equiv 5, \quad 2026 \equiv 6, \quad 4051 \equiv 1 \pmod{10}.$$

Now compute

$$5 \cdot 6 \cdot 1 = 30.$$

Thus

$$\sum_{n=1}^{2025} n^2 \equiv 30 \cdot 6^{-1} \pmod{10}.$$

Compute the inverse of 6 modulo 10.
Solve $6x \equiv 1 \pmod{10}$.
No such $x$ exists because $\gcd(6, 10) = 2 \neq 1$.
Therefore this modular-verification method is unusable, so we immediately stop and simply trust the earlier cycle-counting method.

Thus the sum of the ones digits of the first 2025 squares is

 9115.

*~notvalid*
## Video Solution (Fast and Easy)
https://www.youtube.com/watch?v=jxSb3BIzKJg

*~Pi Academy*
## Video Solution 1 by SpreadTheMathLove
https://www.youtube.com/watch?v=dLSWVrrKsgs
## Video Solution by Daily Dose of Math
https://youtu.be/s-Wimgu9wto

*~Thesmartgreekmathdude*
## See also
