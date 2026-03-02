# 2005 AMC 12B Problem 15

## Problem
The sum of four two-digit numbers is 221. None of the eight digits is 0 and no two of them are the same. Which of the following is **not** included among the eight digits?


$$\mathrm{(A)}\ 1 \qquad \mathrm{(B)}\ 2 \qquad \mathrm{(C)}\ 3 \qquad \mathrm{(D)}\ 4 \qquad \mathrm{(E)}\ 5$$

## Solution 1
221 can be written as the sum of four two-digit numbers, let's say $\overline{ae}, \overline{bf}, \overline{cg},$ and $\overline{dh}.$ Then $221=10(a+b+c+d)$+(e+f+g+h). The last digit of 221 is 1, and $10(a+b+c+d)$ won't affect the units digits, so (e+f+g+h) must end with 1. The smallest value (e+f+g+h) can have is (1+2+3+4)=10, and the greatest value is (6+7+8+9)=30. Therefore, (e+f+g+h) must equal 11 or 21.

Case 1: (e+f+g+h)=11

The only distinct positive integers that can add up to 11 is (1+2+3+5). So, a,b,c, and d must include four of the five numbers (4,6,7,8,9). We have $10(a+b+c+d)=221-11=210$, or a+b+c+$d=21$. We can add all of $4+6+7+8+9=34$, and try subtracting one number to get to 21, but none of them work. Therefore, (e+f+g+h) cannot add up to 11.

Case 2: (e+f+g+h)=21

Checking all the values for e,f,g,and h each individually may be time-consuming, instead of only having 1 solution like Case 1. We can try a different approach by looking at (a+b+c+d) first. If (e+f+g+h)=21, $10(a+b+c+d)=221-21=200$, or (a+b+c+d)=20. That means (a+b+c+d)+(e+f+g+h)=$21+20=41$. We know (1+2+3+4+5+6+7+8+9)=45, so the missing digit is $45-41=\boxed{\mathrm{(D)}\ 4}$
## Solution 2
Alternatively, we know that a number is congruent to the sum of its digits mod 9, so 221 $\equiv 5 \equiv 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 -$ d $\equiv -d,$ where d is some digit. Clearly, $\boxed{d = 4}.$
## See also
