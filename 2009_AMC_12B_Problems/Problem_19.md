# 2009 AMC 12B Problem 19

## Problem
For each positive integer n, let $f(n) = n^4-360n^2 + 400$. What is the sum of all values of f(n) that are prime numbers?

$\textbf{(A)}\ 794\qquad \textbf{(B)}\ 796\qquad \textbf{(C)}\ 798\qquad \textbf{(D)}\ 800\qquad \textbf{(E)}\ 802$
## Solutions
### Solution 1
To find the answer it was enough to play around with f. One can easily find that f(1)=41 is a prime, then f becomes negative for n between 2 and 18, and then f(19)=761 is again a prime number. And as $41 + 761 = 802$ is already the largest option, the answer must be $\boxed{802}.$
### Solution 2
We will now show a complete solution, with a proof that no other values are prime.

Consider the function $g(x) = x^2-360x + 400$, then obviously $f(x) = g(x^2).$

The roots of g are:
$$x_{1,2} = \frac{ 360 \pm \sqrt{ 360^2 - 4\cdot 400 } }2 = 180 \pm 80 \sqrt 5$$

We can then write $g(x) = (x - 180 - 80\sqrt 5)(x - 180 + 80\sqrt 5),$ and thus $f(x) = (x^2 - 180 - 80\sqrt 5)(x^2 - 180 + 80\sqrt 5).$

We would now like to factor the right hand side further, using the formula $(x^2 - y^2) = (x-y)(x+y). To$ do this, we need to express both constants as squares of some other constants. Luckily, we have a pretty good idea how they look like.

We are looking for rational a and b such that ($a+b\sqrt 5)^2 = 180 + 80\sqrt 5.$ Expanding the left hand side and comparing coefficients, we get ab=40 and $a^2 +5b^2 = 180$. We can easily guess (or compute) the solution $a=$10, $b=4$.

Hence 180 + $80\sqrt 5 = (10 + 4\sqrt 5)^2,$ and we can easily verify that also 180 - $80\sqrt 5 = (10 - 4\sqrt 5)^2.$

We now know the complete factorization of f(x):


$$f(x) = (x - 10 - 4\sqrt 5)(x + 10 + 4\sqrt 5)(x - 10 + 4\sqrt 5)(x + 10 - 4\sqrt 5)$$


As the final step, we can now combine the factors in a different way, in order to get rid of the square roots.

We have (x - 10 - $4\sqrt 5)(x - 10 + 4\sqrt 5) = (x-10)^2 - (4\sqrt 5)^2 = x^2 - 20x + 20$,
and (x + 10 - $4\sqrt 5)(x + 10 + 4\sqrt 5) =x^2 +20x + 20$.

Hence we obtain the factorization $f(x) = (x^2-20x + 20)(x^2 + 20x + 20$).

For $x\geq 20$ both terms are positive and larger than one, hence f(x) is not prime. For 1 the second factor is positive and the first one is negative, hence f(x) is not a prime. The remaining cases are $x=1$ and $x=19$. In both cases, f(x) is indeed a prime, and their sum is f(1) + f(19) = 41 + $761 =\boxed{802}.$
### Solution 3
Instead of doing the hard work, we can try to guess the factorization. One good approach: We can make the observation that f(x) looks similar $to (x^2 + 20)^2$ with the exception of the $x^2$ term. In fact, we have $(x^2 + 20)^2 = x^4 +40x^2 + 400$. But then we notice that it differs from the desired expression by a square: $f(x) = (x^2 + 20)^2 - 400x^2 = (x^2 + 20)^2 - (20x)$$^2. Now$ we can use the formula $(x^2 - y^2) = (x-y)(x+y) to$ obtain the same factorization as in the previous solution, without all the work.
### Solution 4
After arriving at the factorization $f(x) = (x^2-20x + 20)(x^2 + 20x + 20$), a more mathematical approach would be to realize that the second factor is always positive when x is a positive integer. Therefore, in order for f(x) to be prime, the first factor has to be 1. We can set it equal to 1 and solve for x:  $x^2-20x+20=1  x^2-20x+19=0  (x-1)(x-19)=0  x=1, x=19$  Substituting these values into the second factor and adding would give the answer.
### A way to find the desired factorization
Essentially since we want to find when the function is prime, we shall attempt to factor the polynomial. Notice we have $(n^2+20)^2-400n^2=n^4-360n^2+400$, and difference of squares gives the desired factorization, and we can continue as in any other solution. Furthermore, the motivation from doing $(n^2+20)^2$ is since it matches the leading term in f(x) and the constant term.
## See Also
