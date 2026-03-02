# 2007 AMC 12B Problem 21

## Problem
The first 2007 positive integers are each written in base 3. How many of these base-3 representations are palindromes? (A palindrome is a number that reads the same forward and backward.)


$$\mathrm {(A)}\ 100 \qquad \mathrm {(B)}\ 101 \qquad \mathrm {(C)}\ 102 \qquad \mathrm {(D)}\ 103 \qquad \mathrm {(E)}\ 104$$

## Solution 1
$$2007_{10} = 2202100_{3}$$

All numbers of six or less digits in base 3 have been written.

The form of each palindrome is as follows

1 digit  - a

2 digits - aa

3 digits - aba

4 digits - abba

5 digits - abcba

6 digits - abccba

Where a,b,c are base 3 digits

Since a $\neq 0,$ this gives a total of 2 + 2 + $2\cdot 3 + 2\cdot 3 + 2\cdot 3^2 + 2\cdot 3^2 = 52$ palindromes so far.

7 digits - abcdcba, but not all of the numbers are less than $2202100_{3}$

Case: $a=1$

All of these numbers are less than 2202100_3 giving $3^3$ more palindromes

Case: $a=2, b\neq 2$

All of these numbers are also small enough, giving $2\cdot 3^2$ more palindromes

Case: $a=2, b=2$

It follows that $c=0$, since any other c would make the value too large. This leaves the number as 220d022_3. Checking each value of d, all of the three are small enough, so that gives 3 more palindromes.

Summing our cases there are
$$52 + 3^3 + 2\cdot 3^2 + 3 = 100 \Rightarrow \mathrm{(A)}$$
## Solution 2 (similar to 1, no cases)
Notice 2017 (base 3) is 2202100. This means we aim to find palindromes up to 2202100 using only digits (0,1,2) as we are in base 3. Therefore, there are 3 options for each letter (with the exception of a, which has 2 options; this is because we don't want to consider leading zeroes as this only complicates things).
Then, consider:
1 digit palindromes are of the form a,
2 digit of the form aa,
3 of the form aba,
4 of the form abba,
and so on.

Since some digits repeat, it suffices to call them of the form
a, a,
ab, ab,
abc, abc,
for palindromes up to six digits. This gives us (2, 2, 6, 6, 18, 18) options respectively, or 106 total.

For seven digits, we aim to find all 7-digit palindromes, minus the ones greater than 2202100.
There are $2\cdot3\cdot3\cdot3$ options for 7-digit palindromes (as they are of the form abcd), and if we aim to find ones greater than 2202100, we know the last two digits are both 2 (considering there are no options greater than 22 for the first two). Therefore we are left with aba, with 2 options for a (because there are no palindromes above 021 with $a = 0$), and 3 options for b, giving 6 options total.
Therefore the total number of base-3 palindromes below 2202100 is $106-6=\boxed{\mathrm{(A)}{100}}$

*~Stress-couture*
## See Also
