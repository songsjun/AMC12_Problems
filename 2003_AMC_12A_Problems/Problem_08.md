# 2003 AMC 12A Problem 8

> This problem is the same as [2003 AMC 12A #8](https://artofproblemsolving.com/wiki/index.php/2003_AMC_12A_Problems) and [2003 AMC 10A #8](https://artofproblemsolving.com/wiki/index.php/2003_AMC_10A_Problems).
## Problem
What is the probability that a randomly drawn positive factor of 60 is less than 7?


$$\mathrm{(A) \ } \frac{1}{10}\qquad \mathrm{(B) \ } \frac{1}{6}\qquad \mathrm{(C) \ } \frac{1}{4}\qquad \mathrm{(D) \ } \frac{1}{3}\qquad \mathrm{(E) \ } \frac{1}{2}$$

## Solution
### Solution 1
For any positive integer n which is not a perfect square, exactly half of its positive factors will be less than $\sqrt{n},$ since each such factor can be paired with one that is larger than $\sqrt{n}. ($By contrast, if n is a perfect square, one of its factors will be exactly $\sqrt{n},$ which would therefore have to be paired with itself.)

Since 60 is indeed not a perfect square, it follows that half of its positive factors are less than $\sqrt{60} \approx 7.746.$ This estimate clearly shows that there are not even any integers, let alone factors of 60, between 7 and $\sqrt{60}.$ Accordingly, exactly half of the positive factors of 60 are in fact less than 7, so the answer is precisely $\boxed{\mathrm{(E)}\ \frac{1}{2}}.$
### Solution 2
Testing all positive integers less than 7, we find that 1, 2, 3, 4, 5, and 6 all divide 60. The prime factorization of 60 is $2^2 \cdot 3 \cdot 5,$ so using the standard [formula for the number of divisors](https://artofproblemsolving.com/wiki/index.php/Divisor_function), the total number of divisors of 60 is 3 $\cdot 2 \cdot 2 = 12.$ Therefore, the required probability is $\frac{6}{12} = \boxed{\mathrm{(E)}\ \frac{1}{2}}.$
### Solution 3 (brute force)
Though this is not recommended for reasons of time, one can simply write out all the factors of 60, eventually finding that 60 = 1 $\cdot 60 = 2 \cdot 30 = 3 \cdot 20 = 4 \cdot 15 = 5 \cdot 12 = 6 \cdot 10.$ Hence 60 has 12 factors, of which 6 are less than 7 (namely, 1, 2, 3, 4, 5, and 6), so the answer is $\frac{6}{12} = \boxed{\mathrm{(E)}\ \frac{1}{2}}.$
## Video Solution
https://youtu.be/C3prgokOdHc ~savannahsolver

https://www.youtube.com/watch?v=jpMzPl7vkxE  ~David
## See Also
