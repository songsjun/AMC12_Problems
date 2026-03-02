# 2021 AMC 12B Problem 7

> This problem is the same as [2021 AMC 10B #12](https://artofproblemsolving.com/wiki/index.php/2021_AMC_10B_Problems#Problem_12) and [2021 AMC 12B #7](https://artofproblemsolving.com/wiki/index.php/2021_AMC_12B_Problems#Problem_7).
## Problem
Let N = 34 $\cdot 34 \cdot 63 \cdot 270.$ What is the ratio of the sum of the odd divisors of N to the sum of the even divisors of N?

$\textbf{(A)} ~1 : 16 \qquad\textbf{(B)} ~1 : 15 \qquad\textbf{(C)} ~1 : 14 \qquad\textbf{(D)} ~1 : 8 \qquad\textbf{(E)} ~1 : 3$
## Solution 1
Prime factorize N to get N=$2^{3}\cdot 3^{5} \cdot 5\cdot 7\cdot 17^{2}.$ For each odd divisor n of N, there exist even divisors $2n$, $4n$, $8n$ of N, therefore the ratio is 1:(2+4+8)=$\boxed{\textbf{(C)} ~1 : 14}$
## Solution 2
Prime factorizing N, we see N=$2^{3}\cdot 3^{5} \cdot 5\cdot 7\cdot 17^{2}.$
The sum of N's odd divisors are the sum of the factors of N without 2, and the sum of the even divisors is the sum of the odds subtracted by the total sum of divisors.

BY SUM OF FACTORS FORMULA (search it up if you don't know):
The formula is actually for all factors, but we can just take out the $2^3,$ so we have:

The sum of odd divisors is given by $a = (1+3+3^2 + 3^3 + 3^4 + 3^5)(1 + 5)(1+7)(1+17+17^2)$ and the total sum of divisors is $(1+2+4+8)(1+3+3^2 + 3^3 + 3^4 + 3^5)(1 + 5)(1+7)(1+17+17^2) =15a$. Thus, our ratio is $\frac{a}{15a-a} = \frac{a}{14a} = \boxed{\textbf{(C)} ~1 : 14}.$

*~JustinLee2017*
*~WhySean38*
*~minor edits by SwordAxe*
## Solution 3
Prime factorizing N, we have that there is $2^3 in$ our factorization. Now, call the sum of the odd divisors k. We know that if we multiply k by 2, we will have even divisors. So, we can multiply k by $2, 2^2, 2^3$ respectively to get $14k$ as the sum of the even divisors. Therefore, the answer is $\frac{k}{14k} = \boxed{\textbf{(C)} ~1:14}.$
*~MC*
## Video Solution (Under 2 min!)
https://youtu.be/AiWQjjL85ZE

_~Education, the Study of Everything_
## Video Solution by Punxsutawney Phil
https://youtube.com/watch?v=qpvS2PVkI8A&t=643s
## Video Solution by OmegaLearn (Prime Factorization)
https://youtu.be/U3msAYWeMbI

*~pi_is_3.14*
## Video Solution by Hawk Math
https://www.youtube.com/watch?v=VzwxbsuSQ80
## Video Solution by TheBeautyofMath
https://youtu.be/L1iW94Ue3eI?t=478

*~IceMatrix*
## Video Solution by Interstigation
https://youtu.be/duZG-jirKRc

*~Interstigation*
## See Also
