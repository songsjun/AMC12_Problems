# 2022 AMC 12B Problem 3

> This problem is the same as [2022 AMC 10B #6](https://artofproblemsolving.com/wiki/index.php/2022_AMC_10B_Problems/Problem_6) and [2022 AMC 12B #3](https://artofproblemsolving.com/wiki/index.php/2022_AMC_12B_Problems/Problem_3).
## Problem
How many of the first ten numbers of the sequence $121, 11211, 1112111, \ldots$ are prime numbers?

$\textbf{(A) } 0 \qquad \textbf{(B) }1 \qquad \textbf{(C) }2 \qquad \textbf{(D) }3 \qquad \textbf{(E) }4$
## Solution 1 (Generalization)
The $n$th term of this sequence is


$$\sum_{k=n}^{2n}10^k + \sum_{k=0}^{n}10^k = 10^n\sum_{k=0}^{n}10^k + \sum_{k=0}^{n}10^k = \left(10^n+1\right)\sum_{k=0}^{n}10^k.$$


It follows that the terms are


$$\begin{align*}

$$
121 &= 11\cdot11, \\
11211 &= 101\cdot111, \\
1112111 &= 1001\cdot1111, \\
& \ \vdots
$$

$\end{align*}$$$


Therefore, there are $\boxed{\textbf{(A) } 0}$ prime numbers in this sequence.

*~MRENTHUSIASM*
## Solution 2 (Detailed Explanation of Solution 1)
Denote this sequence as $a_{n}$, then we can find that


$$\begin{align*}

$$
a_{1} &= 121 = 10^2 + 2\cdot10 + 1 = (10^2 + 10) + (10 + 1), \\
a_{2} &= 11211 = (10^4 + 10^3 + 10^2) + (10^2 + 10 + 1), \\
a_{3} &= 1112111 = (10^6 + 10^5 + 10^4 + 10^3) + (10^3 + 10^2 + 10 + 1), \\
& \ \vdots
$$

$\end{align*}$$$


So, we can induct that the general term is


$$\begin{align*}

$$
a_n &= (10^{2n} + 10^{2n-1} + \ldots + 10^{n+1} + 10^n) + (10^n + 10^{n-1} + \ldots +10 + 1) \\
&= 10^n\cdot(10^n + 10^{n-1} + \ldots +10 + 1) + (10^n + 10^{n-1} + \ldots +10 + 1) \\
&= \left(10^n+1\right)\sum_{k=0}^{n}10^k.
$$

$\end{align*}$$$


Therefore, there are $\boxed{\textbf{(A) } 0}$ prime numbers in this sequence.

*~PythZhou*
## Solution 3 (Simple Sums)
Observe how


$$\begin{align*}
121 &= 110 + 11, \\
11211 &= 11100 + 111, \\
1112111 &= 1111000 + 1111, \\
$$& \ \vdots$$
$\end{align*}$$$


all take the form of

$$\underbrace{111\ldots}_{n+1}\underbrace{00\ldots}_{n} + \underbrace{111\ldots}_{n+1} = \underbrace{111\ldots}_{n+1}(10^{n} + 1).$$


Factoring each of the sums, we have

$$11(10+1), 111(100+1), 1111(1000+1), \ldots$$

 respectively. With each number factored, there are $\boxed{\textbf{(A) } 0}$ primes in the set.

*~ab2024*
## Solution 4 (Educated Guess)
Note that $121$ is divisible by $11$ and $11211$ is divisible by $3$. Because this is Problem 6 of the AMC 10, we assume we do not need to check two-digit prime divisibility or use obscure theorems. Therefore, the answer is $\boxed{\textbf{(A) } 0}.$

*~Dhillonr25*
## Video Solution(1-16)
https://youtu.be/SCwQ9jUfr0g

~~Hayabusa1
## Video Solution by Interstigation
https://youtu.be/_KNR0JV5rdI?t=562
## Video Solution by Math4All999
https://youtu.be/5QYh3hNaDa0?feature=shared
## See Also
