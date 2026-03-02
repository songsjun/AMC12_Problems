# 2019 AMC 12B Problem 14

> This problem is the same as [2019 AMC 10B #19](https://artofproblemsolving.com/wiki/index.php/2019_AMC_10B_Problems) and [2019 AMC 12B #14](https://artofproblemsolving.com/wiki/index.php/2019_AMC_12B_Problems).
## Problem
Let S be the set of all positive integer divisors of 100,000. How many numbers are the product of two distinct elements of S?

$\textbf{(A) }98\qquad\textbf{(B) }100\qquad\textbf{(C) }117\qquad\textbf{(D) }119\qquad\textbf{(E) }121$
## Solution 1
The prime factorization of 100,000 is $2^5 \cdot 5^5.$ Thus, we choose two numbers $2^a5^b$ and $2^c5^d$ where 0 $\le$ a,b,c,d $\le 5$ and (a,b) $\neq (c,d),$ whose product is $2^{a+c}5^{b+d}$, where 0 $\le$ a+c $\le 10$ and 0 $\le$ b+d $\le 10.$

Notice that this is similar to choosing a divisor of 100,$000^2 =2^{10}5^{10}$, which has (10+1)(10+1) = 121 divisors. However, some of the divisors of $2^{10}5^{10}$ cannot be written as a product of two distinct divisors of $2^$5 $\cdot 5^5,$ namely: $1 = 2^05^0,2^{10}5^{10}$, $2^{10}$, and $5^{10}$. The last two cannot be written because the maximum factor of 100,000 containing only $2s$ or $5s$ (and not both) is only $2^5$ or 5^5. Since the factors chosen must be distinct, the last two numbers cannot be written because they would require $2^$5 $\cdot 2^5$ or $5^$5 $\cdot 5^5.$ The first two would require 1 $\cdot 1$ and $2^{5}5^{5}\cdot 2^{5}5^{5},$ respectively. This gives $121-4 = 117$ candidate numbers. It is not too hard to show that every number of the form $2^p5^q,$ where 0 $\le$ p, q $\le 10,$ and p,q are not both 0 or 10, can be written as a product of two distinct elements in S. Hence the answer is $\boxed{\textbf{(C) } 117}.$

*~hashbrown2009 (revised and fully updated)*
## Solution 2
Set $S$ has the number of factors in 100,000.

The prime factorization of 100,000 is $2^5 \times 5^5$. We biject the question from "How many unique integers..." to, "How many possible units digits can occur", as the 36 factors will just branch from the units digits. (They also form a 1-1 correspondence).

How? Well, you can imagine just the single factors of 10, that being, $2 \times 5$. Then, We see that our factors are 1, 2, 5, or 10. Therefore, the product of two elements that may occur are 1x2, 2x5, 2x10, 5x1, 5x2, 5x10, 1, and 10 itself. These are 8 elements. The unique units digits of this are either 0 or 1. Then, we have the number of factors, that being, $(1+1)(1+1) = 4$. 4 multiplied by the two units digits reveals 8 as well. Notice that 100,000 | 10, and therefore there exists a 1-1 correspondence. If we wanted to count the distinct elements only, just subtract 1 and 10, or $2^0 \times 5^0$ and $2 \times 5$! That easy!

Continuing on, through inspection, the main multiples that may be formed are simply going to end in 0, $2^0 = 1$, or $5^n \mod 10 \equiv 5$.

Then, we have a total of $36 \times 3 = 108$ cases that may occur (number of factors times possible units digits given only the prime factorization).

We now consider either one side is $2^n \times 5^0$ or the other is $5^n \times 2^0$ for $1 \le n \in \mathbb{Z} \le 5$. Of course, the fact of $5^n \times 2^0$ is always 5, so we only need to consider $2^n \times 5^0$. This gives us either 2, 4, 8, or 6 as our units digits. However, one can quickly notice that 8 is already possible through 4 and 2 and because 6 represents 16, 16 is just $2 \times 8$. Therefore, we only have 2 and 4 remaining. We distribute this to either the units digits 0, 1, and 5, giving us $3^2 = 9$ total possibilities.

We add 108 and 9 to get $108 + 9 =\boxed{\textbf{(C) } 117}.$

This problem was much harder than anticipated.

*~Pinotation*
## Video Solution (Interactive Teaching Approach)
https://www.youtube.com/watch?v=TgIbMPjB_5Y

*~Mathkidsbymax*
## Video Solution by OmegaLearn
https://youtu.be/ZhAZ1oPe5Ds?t=3975

*~pi_is_3.14*
## See Also
