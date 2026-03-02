# 2020 AMC 12B Problem 4

> This problem is the same as [2020 AMC 10B #4](https://artofproblemsolving.com/wiki/index.php/2020_AMC_10B_Problems) and [2020 AMC 12B #4](https://artofproblemsolving.com/wiki/index.php/2020_AMC_12B_Problems).
## Problem
The acute angles of a right triangle are $a^{\circ}$ and $b^{\circ}$, where $a>b$ and both $a$ and $b$ are prime numbers. What is the least possible value of $b$?

$\textbf{(A)}\ 2 \qquad\textbf{(B)}\ 3 \qquad\textbf{(C)}\  5 \qquad\textbf{(D)}\ 7 \qquad\textbf{(E)}\ 11$
## Solution 1
Since the three angles of a triangle add up to $180^{\circ}$ and one of the angles is $90^{\circ}$ because it's a right triangle, $a^{\circ} + b^{\circ} = 90^{\circ}$.

The greatest prime number less than $90$ is $8$9. If $a=89^{\circ}$, then $b=90^{\circ}-89^{\circ}=1^{\circ}$, which is not prime.

The next greatest prime number less than $90$ is $8$3. If $a=83^{\circ}$, then $b=7^{\circ}$, which IS prime, so we have our answer $\boxed{\textbf{(D)}\ 7}$ ~quacker88
## Solution 2
Looking at the answer choices, only $7$ and $11$ are coprime to $90$. Testing $7$, the smaller angle, makes the other angle $83$ which is prime, therefore our answer is $\boxed{\textbf{(D)}\ 7}$
## Solution 3 (Euclidean Algorithm)
It is clear that $\gcd(a,b)=1.$ By the Euclidean Algorithm, we have

$$\gcd(a,b)=\gcd(a+b,b)=\gcd(90,b)=1,$$

 so $90$ and $b$ are relatively prime.

The least such prime number $b$ is $7,$ from which $a=90-b=83$ is also a prime number. Therefore, the answer is $\boxed{\textbf{(D)}\ 7}.$

*~MRENTHUSIASM*
## Video Solution (HOW TO CREATIVELY PROBLEM SOLVE!!!)
https://youtu.be/hE2fEOfviDw

*~Education, the Study of Everything*
## Video Solutions
https://youtu.be/Gkm5rU5MlOU


https://youtu.be/y_nsQ7pO63c

*~savannahsolver*

https://youtu.be/wH7xhYxwaFc

*~AlexExplains*
## See Also
