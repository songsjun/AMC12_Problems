# 2008 AMC 12A Problem 17

## Problem
Let $a_1,a_2,\ldots$ be a sequence determined by the rule $a_n=a_{n-1}/2$ if $a_{n-1}$ is even and $a_n=3a_{n-1}+1$ if $a_{n-1}$ is odd. For how many positive integers $a_1\le 2008$ is it true that $a_1$ is less than each of $a_2, a_3$, and $a_4$?


$$\mathrm{(A)}\ 250\qquad\mathrm{(B)}\ 251\qquad\mathrm{(C)}\ 501\qquad\mathrm{(D)}\ 502\qquad\mathrm{(E)} 1004$$

## Solution 1
All positive integers can be expressed as $4n$, 4n+1, $4n+2$, or $4n+3$, where n is a nonnegative integer.

*If $a_1=4$n, then a_$2=\frac{4n}{2}=2n. *If a_1=4$n+1, then $a_2=3(4n+1)+1=12n+$4, a_$3=\frac{12n+4}{2}=6$n+2, and a_$4=\frac{6n+2}{2}=3n+1. *If a_1=4$n+2, then $a_2=2n+1. *If a_1=4$n+3, then $a_2=3(4n+3)+1=12n+$10, a_$3=\frac{12n+10}{2}=6$n+5, and $a_4=3(6n+5)+1=18n+16$. Since 12$n+10, 6n+5, 18n+16 > 4$n+3, every positive integer $a_1=4$n+3 will satisfy $a_1$. Since one fourth of the positive integers $a_1\le 2008$ can be expressed as 4$n+3$, where n is a nonnegative integer, the answer is $\frac{1}{4}\cdot 2008 = 502 \Rightarrow D.$
## Solution 2
After checking the first few $a_n$ such as 1, 2 through 7, we can see that the only $a_1$ that satisfy the conditions are odd numbers that when tripled and added 1 to, are double an odd number. For example, for $a_n=3$, we notice the sequence yields 10, 5, and 16, a valid sequence. So we can set up an equation, $3x+1 =2($2k - $1)$ where x is equal to $a_1$. Rearranging the equation yields $(3x + 3)/4$ = k. Experimenting yields that every 4th x after 3 creates an integer, and thus satisfies the sequence condition. So the number of valid solutions is equal to $2008/4 = 502\Rightarrow D.$
