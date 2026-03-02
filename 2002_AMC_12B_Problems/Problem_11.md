# 2002 AMC 12B Problem 11

> This problem is the same as [2002 AMC 12B #11](https://artofproblemsolving.com/wiki/index.php/2002_AMC_12B_Problems) and [2002 AMC 10B #15](https://artofproblemsolving.com/wiki/index.php/2002_AMC_10B_Problems).
## Problem
The positive integers A, B, A-B,  and A+B are all prime numbers. The sum of these four primes is

$\mathrm{(A)}$\ $\mathrm{even} \qquad\mathrm{(B)}$\ $\mathrm{divisible\ by\ }3 \qquad\mathrm{(C)}$\ $\mathrm{divisible\ by\ }5 \qquad\mathrm{(D)}$\ $\mathrm{divisible\ by\ }7 \qquad\mathrm{(E)}$\ $\mathrm{prime}$
## Solution 1
Since A-B and A+B must have the same [parity](https://artofproblemsolving.com/wiki/index.php/parity), and since there is only one even prime number, it follows that A-B and A+B are both odd. Thus one of A, B is odd and the other even. Since A+B > A > A-B > 2, it follows that A (as a prime greater than 2) is odd. Thus B = 2, and A-2, A, A+2 are consecutive odd primes. At least one of A-2, A, A+2 is divisible by 3, from which it follows that A-2 = 3 and A = 5. The sum of these numbers is thus 17, a prime, so the answer is $\boxed{\mathrm{(E)}\ \text{prime}}.$
## Solution 2
In order for both A - B and A + B to be prime, one of A, B must be 2, or else both A - B, A + B would be even numbers.

If A = 2, then A < B and A - B < 0, which is not possible. Thus B = 2.

Since A is prime and A > A - B > 2, we can infer that A > 3 and thus A can be expressed as $6n\pm 1$ for some natural number n.

However in either case, one of A - B and A + B can be expressed as $6n\pm 3 = 3(2n \pm 1)$ which is a multiple of 3. Therefore the only possibility that works is when A - B = 3 and A + B + (A - B) + (A + B) = $5 + 2 + 3 + 7 = 17$

Which is a prime number. $\boxed{(E)}$

*~Nafer*
## Solution 3 (intuitive)
Trying out some primes for A and B such that A-B and A+B are prime, A=5 and B=2 can be found almost immediately. Summing the four primes, the result is $5+2+3+7=17$, which is $\boxed{\mathrm{(E)}\ \text{prime}}.$
## See also
Note:
Simple trial and error gives us the primes 5 and 2 which fits the description the question asks for; 5, 2, 3, 7 are all primes.
