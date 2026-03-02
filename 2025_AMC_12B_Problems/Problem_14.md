# 2025 AMC 12B Problem 14

> This problem is the same as [2025 AMC 10B #17](https://artofproblemsolving.com/wiki/index.php/2025_AMC_10B_Problems/Problem_17) and [2025 AMC 12B #14](https://artofproblemsolving.com/wiki/index.php/2025_AMC_12B_Problems/Problem_14).
## Problem
Consider a decreasing sequence of $n$ positive integers
$$x_1 > x_2 > \cdots > x_n$$
that satisfies the following conditions:

- The average of the first $3$ terms in the sequence is $2025$.

- For all $4 \le k \le n$, the average of the first $k$ terms is $1$ less than the average of the first $k-1$ terms.

What is the greatest possible value of $n$?

$\textbf{(A)}~1013 \qquad \textbf{(B)}~1014 \qquad \textbf{(C)}~1016 \qquad \textbf{(D)}~2016 \qquad \textbf{(E)}~2025$
## Solution 1
Since the mean of the first three terms is 2025, their sum is
$$2025 * 3 = 6075.$$
Then, incorporating the fourth term makes the mean $2025-1=2024$, so their sum must be

2024 * 4 = 8096, implying that the 4th term is
$$8096-6075=2021$$
Doing the same for the 5th term,

2023 * 5= 10115, 5th term is

$$10115-8096=2019$$

Algebraically, we can model this pattern for the kth term = x as

$$(k-1)(2029-k) + x = (k)(2028-k)$$

$$2029k-2029-k^2+k+x=2028k-k^2$$

$$x=2029-2k$$

So the maximum $k\le$ n for which x is positive is 1014, giving our answer
$$n=\boxed{\textbf{(B) }1014}$$

*~Failure.net*
## Solution 2
The average of the first 3 terms in the sequence is 2025, which means $\frac{x_1 + x_2 + x_3}{3} = 2025,$ so $x_1+x_2 + x_3 = 6075$.

For $k = 4$, we have $\frac{x_1 + x_2 + x_3 + x_4}{4} = 2025 - 1 = 2024,$ so $x_1+x_2 + x_3+x_4 = 8096$. We know $x_1+x_2 + x_3 = 6075$, so $x_4 = 8096 - 6075 = 2021$.

For $k = 5$, we have $\frac{x_1 + x_2 + x_3 + x_4 + x_5}{5} = 2024 - 1 = 2023.$ That means $x_1+x_2 + x_3+x_4 + x_5 = 10115$. We know $x_1+x_2 + x_3+x_4 = 8096$, so $x_5 = 10115 - 8096 = 2019$.

Continuing on for $k = 6, 7, 8, \ldots,$ we can see that each term decreases by 2. So, $x_6 = $2017,\ $x_7 = $2015,\ $x_8 = $2013,\ $\text{and likewise,}$\ $x_3 = $2023,\ $x_2 = $2025,\ $x_1 = 2027$.

To find the greatest possible value of n, we need to find when the numbers in this sequence become negative. The general term is $x_n = 2027-2(n-1)$. We require $x_n > 0$, so 2027 - $2(n-1) > 0$. This simplifies to $2027 > $2n - 2 $\Rightarrow 2029 > 2n \Rightarrow$ n < 1014.5.

Thus the greatest possible integer value of n is 1014, so the answer is $\text{(B) } 1014.$ ~anzhuPro
## Solution 3
Assume that the first three terms are 2026, 2025, and 2024, respectively. The average of the first four terms is $2025-1=2024$, which means the fourth term is 2021. Continuing this process, we realize that the next term is 2019 and each subsequent term is 2 fewer. This means the $n^{th}$ term of this sequence where n>5 is the the {$n-1}^{th}$ term minus 2. Realizing this is an arithmetic sequence and all the terms must be positive, we get the answer, $\boxed{\textbf{(B) }1014}$

*~Bros1*
## Solution 4 (Proof of Sol. 3)
If the first k terms average to 2028-k, note that they sum to $2028k$-k^2. Then, $k+1$ terms average to 2027-k, so they sum $to -k^2+2026k+2027$, so the {$k+1}^{th}$ term is $(-k^2+2026k+2027)-(2028k-k^2),$ where k $\ge 3,$ so {$k+1}^{th}$ term is 2027-$2k$. Note that for this to be positive, k $\le 1013,$ so $k+1$th term is the 1014th term, answer is 1014.

*~ScoutViolet*
*~Latex edits by Bros1*
## Solution 5 (basic calculus)
From the previous solution, we derive the sum of the first k terms to be equal to $2028k$-k^2. Taking a derivative of this, we get 2028-$2k$. Since the only local extreme is at $k=1014$, answer must be $\boxed{\textbf{(B) }1014}$
## Video Solution 1 by SpreadTheMathLove
https://www.youtube.com/watch?v=-bARFv6Felw
## See Also
