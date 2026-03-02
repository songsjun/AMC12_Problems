# 2025 AMC 12B Problem 5

## Problem
Positive integers x and y satisfy the equation $57x+22y = 400$. What is the least possible value of x+y?

$\textbf{(A) } 10 \qquad\textbf{(B) } 11 \qquad\textbf{(C) } 13 \qquad\textbf{(D) } 14 \qquad\textbf{(E) } 15$
## Solution 1
Let x+y = a. Then we have the equation
$$35x + 22a = 400.$$
Because the other two terms are divisible by 5, $22a$ must be divisible by 5 too. Specifically, a is divisible by 5. Let $a=5b$ and substitute:

$$
35x + 110b = 400
7x + 22b = 80.
$$

After some analysis, we find that if $b=3, x = 2$. In fact, this is the only solution with positive integer solutions. Therefore, a = x+$y = 5\cdot 3 = \boxed{\textbf{(E) }15}.$

*~lprado*
## Solution 2 (Extended Euclid Algorithm)
We first solve for integers x and y such that $57x+22$y=400. Use the Extended Euclid Algorithm to find that $x_1 = -5, y_1 = 13$. We multiply both $x_1$ and $y_1$ by 400. Since we require both x and y to be positive integers, let $x_k$ = -5 $\cdot 400 + 22k y_k = 13\cdot 400 - 57$k. We can check this method of writing $x_k$ and $y_k$ is valid by substitution into the original equation. Finally, we add $x_k$ and $y_k$, to find -5 $\cdot 400 + 13 \cdot 400 - 35$k. We want to minimize this value, and after evaluation we find 3200 - $35k$. Minimizing this value over the positive integers, we find $k = 91$, which yields $\boxed{\textbf{(E) }15}.$
## Solution 3 (Mod 11)
Taking mod 11, we see that $2x\equiv 4 \pmod{11}\iffx\equiv 2 \pmod{11}.$ This forces $x=2$ as bigger numbers make the sum pass 400, so that $y=\frac{400-2\cdot 57}{22}=\frac{200-57}{11}=\frac{143}{11}=13.$ So the answer is $x+y=2+13=\boxed{ \textbf{(E) } 15 }.$

*~imosilver*
*~Minor edits by KINGFIREBOY*
## Solution 4 (Brute Force)
List all the factors of 57 and 22 that are less than 400

Iterate through and find a solution to find $x=2$ and $y=13$

*~Yes i did this during competition*
## Video Solution 1 by SpreadTheMathLove
https://www.youtube.com/watch?v=dLSWVrrKsgs

*~lprado*
