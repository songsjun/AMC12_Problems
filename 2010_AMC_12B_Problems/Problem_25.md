# 2010 AMC 12B Problem 25

## Problem
For every integer $n\ge2,$ let $\text{pow}(n)$ be the largest power of the largest prime that divides n. For example $\text{pow}(144)=\text{pow}(2^4\cdot3^2)=3^2.$ What is the largest integer m such that $2010^m$ divides

$\prod_{n=2}^{5300}\text{pow}(n)$?

$\textbf{(A)}\ 74 \qquad \textbf{(B)}\ 75 \qquad \textbf{(C)}\ 76 \qquad \textbf{(D)}\ 77 \qquad \textbf{(E)}\ 78$
## Solution
Because 67 is the largest prime factor of 2010, it means that in the prime factorization of $\prod_{n=2}^{5300}\text{pow}(n),$ there'll be $p_1 ^{e_1} \cdotp_2 ^{e_2} \cdot.... 67^x ...$ where x is the desired value we are looking for. Thus, to find this answer, we need to look for the number of times 67 is incorporated into the giant product.

All numbers $n=67\cdot$ x, given $x =p_1 ^ {e_1} \cdotp_2 ^{e_2} \cdot$ ... $\cdotp_m^ {e_m$} such that for any integer x between 1 and m, prime $p_x$ must be less than 67, contributes a 67 to the product. Considering 67 $\cdot 79 < 5300 < 67 \cdot 80,$ the possible values of x are 1,2,...,70,72,74,...78, since $x=71$,73,79 are primes that are greater than 67. However, $\text{pow}\left(67^2\right)$ contributes two $67s$ to the product, so we must count it twice. Therefore, the answer is 70 + 1 + $6 =\boxed{77} \Rightarrow \boxed{D}.$
## Similar Solution
After finding the prime factorization of $2010=2\cdot3\cdot5\cdot67,$ divide 5300 by 67 and add 5300 divided by $67^2 in$ order to find the total number of multiples of 67 between 2 and 5300. $\lfloor\frac{5300}{67}\rfloor+\lfloor\frac{5300}{67^2}\rfloor=80$ Since 71,73, and 79 are prime numbers greater than 67 and less than or equal to 80, subtract 3 from 80 to get the answer $80-3=\boxed{77}\Rightarrow\boxed{D}.$
## Solution 3 (quick, observations, similar to 2)
$$2010 = 2\cdot3\cdot5\cdot67.$$

There will probably be enough 2's, 3's, and 5's to not count them. Therefore we must count the number of 67's in $\prod_{n=2}^{5300}\text{pow}(n).$

Notice $\text{pow}\left(n\right)=67$ if and only if n={67}$\cdot{b},$ where $\text{pow}\left(b\right)$ is less than OR EQUAL TO 67. Therefore, we have $b\le\lfloor{\frac{5300}{67}}\rfloor,$ or $b\le{79}.$ Therefore we have 79 options plus one $(67^2$ will add 2 67's) minus 3 (for 71, 73, and 79) to get $\boxed{77}\Rightarrow\boxed{D}.$

*~Stress-couture*
## Need Discussion + Clarification?
Concern: How do we know that we only have to check 67? There is no solid relationship between 67 being the largest prime factor in 2010 and 67 giving the smallest result of 77.

Response to concern: Ok, 67 is waaaay larger than any of the other prime factors of 2010. 2001's prime factors are close so there might be some ambiguity but if you can't see why given intervals of 67, $2s3s$ and $5s$ don't need to be accounted for, you probably can't solve this problem .-.. Details in the Discussions page of this Article: http://artofproblemsolving.com/wiki/index.php?title=Talk:2010_AMC_12B_Problems/Problem_25

Response to concern:
When I solved it, I actually ended up trying 2, 3, and 5 just to be safe. It actually ends up not being that bad (since for each one, we only need to consider numbers that only have that prime and lower primes in its prime factorization, so you can just divide 5300 by your prime, find how many numbers less than that new number are only divisible by lower primes, divide by your prime again, and repeat). All said and done, it only ended up taking about 7-8 minutes of mental math (ran out of paper oops), and I think that reasonably speaking, many who are good enough to have a decent chance of solving this 25 can check 2, 3, and 5 on paper in 5 minutes.
## See Also
