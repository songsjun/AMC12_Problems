# 2014 AMC 12A Problem 15

## Problem
A five-digit palindrome is a positive integer with respective digits abcba, where a is non-zero.  Let S be the sum of all five-digit palindromes.  What is the sum of the digits of S?

$\textbf{(A) }9\qquad \textbf{(B) }18\qquad \textbf{(C) }27\qquad \textbf{(D) }36\qquad \textbf{(E) }45\qquad$
## Solution 1
For each digit $a=1,2,\ldots,9$ there are $10\cdot10 (w$ays of choosing b and c) palindromes. So the as contribute ($1+2+\cdots+9)(100)(10^4+1)$ to the sum.
For each digit $b=0,1,2,\ldots,9$ there are $9\cdot10 (s$ince a $\neq 0)$ palindromes. So the bs contribute ($0+1+2+\cdots+9)(90)(10^3+10)$ to the sum.
Similarly, for each $c=0,1,2,\ldots,9$ there are $9\cdot10$ palindromes, so the c contributes ($0+1+2+\cdots+9)(90)(10^2)$ to the sum.

It just so happens that  ($1+2+\cdots+9)(100)(10^4+1)+(1+2+\cdots+9)(90)(10^3+10)+(1+2+\cdots+9)(90)(10^2)=49500000$  so the sum of the digits of the sum is $\boxed{\textbf{(B)}\; 18}.$
## Solution 2
Notice that $10001+ 99999 = 110000$. In fact, ordering the palindromes in ascending order, we find that the sum of the nth palindrome and the nth to last palindrome is 110000. We have $9\cdot 10\cdot 10$ palindromes, or 450 pairs of palindromes summing to 110000. Performing the multiplication gives 49500000, so the sum  $\boxed{\textbf{(B)}\; 18}.$
## Solution 3
As shown above, there are a total of 900 five-digit palindromes.  We can calculate their sum by finding the expected value of a randomly selected palindrome satisfying the conditions given, then multiplying it by 900 to get our sum.  The expected value for the ten-thousands and the units digit is $\frac{1+2+3+\cdots+9}{9}=5,$ and the expected value for the thousands, hundreds, and tens digit is $\frac{0+1+2+\cdots+9}{10}=4.5.$  Therefore our expected value is $5\times10^4+4.5\times10^3+4.5\times10^2+4.5\times10^1+5\times10^0=55,$\!000.  Since the question asks for the sum of the digits of the resulting sum, we do not need to keep the trailing zeros of either 55,\!000 or 900.  Thus we only need to calculate $55\times9=495,$ and the desired sum is $\boxed{\textbf{(B) }18}.$
## Solution 4 (Variation of #2)
First, allow a to be zero, and then subtract by how much we overcount. We'll also sum each palindrome with its $\textit{complement}.$ If $\overline{abcba} (t$he line means a, b, and c are digits and abcba$\nea\cdotb\cdotc\cdotb\cdot$ a) is a palindrome, then its complement is $\overline{defed}$ where $d=9-a, e=9-b, f=9$-c. Notice how every palindrome has a unique compliment, and that the sum of a palindrome and its complement is 99999. Therefore, the sum of our palindromes is $99999\times (10^3/2). ($There are $10^3/2$ pairs.)

However, we have overcounted, as something like 05350 $\textit{isn't}$ a palindrome by the problem's definition, but we've still included it. So we must subtract the sum of numbers in the form $\overline{0nmn0}.$ By the same argument as before, these sum to $9990\times (10^2/2).$ Therefore, the sum that the problem asks for is:


$$
500\times99999-50\times 9990
=500\times99999-500\times 999
=500(99999-999)
=500\times 99000
$$


Since all we care about is the sum of the digits, we can drop the 0's.


$$
5\times99
=5\times(100-1)
=495
$$


And finally, $4+9+5=\boxed{\textbf{(B)}18}$
## See Also
