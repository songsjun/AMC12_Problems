# 2017 AMC 12B Problem 16

## Problem
The number 21!=51,090,942,171,709,440,000 has over 60,000 positive integer divisors. One of them is chosen at random. What is the probability that it is odd?

$\textbf{(A)}\ \frac{1}{21} \qquad \textbf{(B)}\ \frac{1}{19} \qquad \textbf{(C)}\ \frac{1}{18} \qquad \textbf{(D)}\ \frac{1}{2} \qquad \textbf{(E)}\ \frac{11}{21}$
## Solution 1
We can consider a factor of 21! to be odd if it does not contain a 2; hence, finding the exponent of 2 in the prime factorization of 21! will help us find our answer. We can start off with all multiples of 2 up to 21, which is 10. Then, we find multiples of 4, which is 5. Next, we look at multiples of 8, of which there are 2. Finally, we know there is only one multiple of 16 in the set of positive integers up to 21. Now, we can add all of these to get $10+5+2+1=18$. We know that, in the prime factorization of 21!, we have $2^{18}$, and the only way to have an odd number is if there is not a 2 in that number's prime factorization. This only happens with $2^{0}$, which is only one of the 19 different exponents of 2 we could have (of which having each exponent is equally likely). Hence, we have  $\boxed{\text{(B)} \dfrac{1}{19}}.$

Solution by: armang32324
## Solution 2
If 21! prime factorizes into p prime factors with exponents $e_1$ through $e_k$, then the product of the sums of each of these exponents plus 1 should be over 60,000. If $e_2$ is the exponent of 2 in the prime factorization of 21!, then we can find the number of odd factors of 21! by dividing the total by $e_2+1$. Then, the number of odd divisors over total divisors is $\dfrac{1}{e_2+1}.$ We can find $e_2$ easily using Legendre's, so our final answer is $\dfrac{1}{10 + 5 + 2 + 1+1} = \boxed{\text{(B)} \dfrac{1}{19}}.$

*~icecreamrolls8*
## Solution 3
If a factor of 21! is odd, that means it contains no factors of 2. We can find the number of factors of two in 21! by counting the number multiples of 2, 4, 8, and 16 that are less than or equal to 21 (Legendre's Formula). After some quick counting we find that this number is $10+5+2+1 = 18$. If the prime factorization of 21! has 18 factors of 2, there are 19 choices for each divisor for how many factors of 2 should be included (0 to 18 inclusive). The probability that a randomly chosen factor is odd is the same as if the number of factors of 2 is 0 which is     $\boxed{\textbf{(B)}\frac{1}{19}}.$

Solution by: vedadehhc

Note: Legendre's Formula states that the exponent of p in the prime factorization of n! is given by

$$e_p(n!)=\sum_{i=1}^{\infty}\left\lfloor\frac{n}{p^i}\right\rfloor=\frac{n-S_p(n)}{p-1},$$

where $S_p(n)$ is the sum of the digits of n when written in base p. For example, 21 in binary is 1011, so $S_2(21)=1+0+1+1=3$. We have $e_2(21!)=\frac{21-3}{2-1}=18,$ then proceed with the rest of solution 3.

*~happyhippos*
## Solution 4
We can write 21! as its prime factorization:
$$21!=2^{18}\times3^9\times5^4\times7^3\times11\times13\times17\times19$$

Each exponent of these prime numbers are one less than the number of factors at play here. This makes sense; $2^{18}$ is going to have 19 factors: $2^0, 2^1, 2^2,...\text{ }2^{18},$ and the other exponents will behave identically.

In other words, 21! has (18+1)(9+1)(4+1)(3+1)(1+1)(1+1)(1+1)(1+1) factors.

We are looking for the probability that a randomly chosen factor of 21! will be odd--numbers that do not contain multiples of 2 as factors.

From our earlier observation, the only factors of 21! that are even are ones with at least one multiplier of 2, so our probability of finding an odd factor becomes the following:
P($\text{odd})=\dfrac{\text{number of odd factors}}{\text{number of all factors}}=\dfrac{(9+1)(4+1)(3+1)(1+1)(1+1)(1+1)(1+1)}{(18+1)(9+1)(4+1)(3+1)(1+1)(1+1)(1+1)(1+1)}=\dfrac{1}{(18+1)}=\boxed{\dfrac{1}{19}}$

Solution submitted by David Kim
## Video Solution
https://youtu.be/ZLHNTSIcGM8

*~MistyMathMusic*
## See Also
