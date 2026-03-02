# 2014 AMC 12A Problem 22

> This problem is the same as [2014 AMC 12A #22](https://artofproblemsolving.com/wiki/index.php/2014_AMC_12A_Problems) and [2014 AMC 10A #25](https://artofproblemsolving.com/wiki/index.php/2014_AMC_10A_Problems).
## Problem
The number $5^{867}$ is between $2^{2013}$ and $2^{2014}$.  How many pairs of integers $(m,n)$ are there such that $\leq \leq 2012$ and

$$5^n<2^m<2^{m+2}<5^{n+1}?$$


$\textbf{(A) }278\qquad
$\textbf{(B) }279\qquad$
$\textbf{(C) }280\qquad$
$\textbf{(D) }281\qquad$
$\textbf{(E) }282\qquad$$
## Solution 1
Between any two consecutive powers of $5$ there are either $2$ or $3$ powers of $2$ (because $2^2<5^1<2^3$). Consider the intervals $(5^0,5^1),(5^1,5^2),\dots (5^{866},5^{867})$. We want the number of intervals with $3$ powers of $2$.

From the given that $2^{2013}<5^{867}<2^{2014}$, we know that these $867$ intervals together have $2013$ powers of $2$. Let $x$ of them have $2$ powers of $2$ and $y$ of them have $3$ powers of $2$. Thus we have the system


$$x+y=867$$


$$2x+3y=2013$$


from which we get $y=279$, so the answer is $\boxed{\textbf{(B)}}$.
## Solution 2
The problem is asking for between how many consecutive powers of $5$ are there $3$ power of $2$s

There can be either $2$ or $3$ powers of $2$ between any two consecutive powers of $5$, $5^n$ and $5^{n+1}$.

The first power of $2$ is between $5^n$ and $2 \cdot 5^n$.

The second power of $2$ is between $2 \cdot 5^n$ and $4 \cdot 5^n$.

The third power of $2$ is between $4 \cdot 5^n$ and $8 \cdot 5^n$, meaning that it can be between $5^n$ and $5^{n+1}$ or not.

If there are only $2$ power of $2$s between every consecutive powers of $5$ up to $5^{867}$, there would be $\cdot 2 = 1734$ power of $2$s. However, there are $2013$ powers of $2$ before  $5^{867}$, meaning the answer is $2013 - 1734 = \boxed{\textbf{(B)}279}$.

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Video Solution by Richard Rusczyk
https://www.youtube.com/watch?v=DRJvUMsZtl4&t=4s
## See Also
