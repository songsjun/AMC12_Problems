# 2017 AMC 12B Problem 19

## Problem
Let N=$123456789101112\dots4344$ be the 79-digit number that is formed by writing the integers from 1 to 44 in order, one after the other. What is the remainder when N is divided by 45?

$\textbf{(A)}\ 1\qquad\textbf{(B)}\ 4\qquad\textbf{(C)}\ 9\qquad\textbf{(D)}\ 18\qquad\textbf{(E)}\ 44$
## Solution 1
We will consider this number $\bmod$\ 5 and $\bmod$\ 9. By looking at the last digit, it is obvious that the number is $\equiv 4\bmod$\ 5. To calculate the number $\bmod$\ 9, note that


$$123456\cdots 4344 \equiv 1+2+3+4+5+6+7+8+9+(1+0)+(1+1)+\cdots+(4+3)+(4+4) \equiv 1+2+\cdots+44 \bmod\ 9,$$


so it is equivalent to

$$\frac{44\cdot 45}{2} = 22\cdot 45 \equiv 0\bmod\ 9.$$

Let x be the remainder when this number is divided by 45. We know that $x\equiv 0 \pmod$ {9} and $x\equiv 4 \pmod$ {5}, so by the Chinese remainder theorem, since 9(-1)$\equiv 1 \pmod{5},x\equiv 5(0)+9(-1)(4) \pmod$ {$5\cdot 9$}, or $x\equiv -36 \equiv 9 \pmod$ {45}. So the answer is $\boxed$ {$\textbf$ {(C)}}.
## Solution 2
We know that this number is divisible by 9 because the sum of the digits is 270, which is divisible by 9. If we subtracted 9 from the integer we would get 1234 $\cdots 4335,$ which is also divisible by 5 and by 45. Thus the remainder is 9, or $\boxed{\textbf{C}}.$
## Solution 3 (Beginner's Method)
To find the sum of digits of our number, we break it up into 5 cases, starting with 0, 1, 2, 3, or 4.

Case 1: $1+2+3+\cdots+9 = 45,$

Case 2: $1+0+1+1+1+2+\cdots+1+8+1+9 = 55 ($We add 10 to the previous cases, as we are in the next ten's place)

Case 3: $2+0+2+1+\cdots+2+9 = 65,$

Case 4: $3+0+3+1+\cdots+3+9 = 75,$

Case 5: $4+0+4+1+\cdots+4+4 = 30,$

Thus the sum of the digits is $45+55+65+75+30 = 270$, so the number is divisible by 9. We notice that the number ends in "4", which is 9 more than a multiple of 5. Thus if we subtracted 9 from our number it would be divisible by 5, and $5\cdot 9 = 45. ($Multiple of n - n = Multiple of n)

So our remainder is $\boxed{\textbf{(C)}\,9},$ the value we need to add to the multiple of 45 to get to our number.
## Solution 4
We notice that $10^{k}\equiv 10 \pmod$ {45}.

Hence N = $44+43\cdot10^{2}+42\cdot10^{4}+\cdots+10^{78} \equiv 44+10\cdot(1+2+3+\cdots+43)\equiv 9 \pmod$ {45}.

Choose $\boxed{\textbf{(C)}\,9}$

*~PythZhou*
## Solution 5 (Solution 2 but more in-depth)
The sum of all of the digits is just the sum of consecutive numbers from 1 -> 44 or $\frac{44}{2}(45) = 990.$ The prime factorization of 45 is $3^2 * 5.$ So if a number is divisible by 45 it has to both be divisible by 9 and 5. The first number that satisfies this ends in 35 because the ten's digit is one greater than the ten's digit in the consecutive numbers from 1 to 44, and the one's digit is one less than this number, and the number ends in a 5. The difference between 35 and 44 is 9 giving $\boxed{\textbf{(C)}\,9}.$

*~PeterDoesPhysics*
## Video Solution by OmegaLearn
https://youtu.be/zfChnbMGLVQ?t=3342

*~pi_is_3.14*
## See Also
