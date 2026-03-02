# 2017 AMC 12A Problem 18

## Problem
Let S(n) equal the sum of the digits of positive integer n. For example, S(1507) = 13. For a particular positive integer n, $S(n) = 1274.$ Which of the following could be the value of S$(n+1)$?

$\textbf{(A)}\ 1 \qquad\textbf{(B)}\ 3\qquad\textbf{(C)}\ 12\qquad\textbf{(D)}\ 1239\qquad\textbf{(E)}\ 1265$
## Solution 1
Note that $n\equiv S(n)\bmod 9,$ so S($n+1)-S(n)\equivn+1-n =1\bmod 9.$ So, since $S(n)=1274\equiv 5\bmod 9,$ we have that S($n+1)\equiv 6\bmod 9.$ The only one of the answer choices $\equiv 6\bmod 9$ is $\boxed{(D)=\ 1239}.$
## Solution 2
One possible value of S(n) would be 1275, but this is not any of the choices. Therefore, we know that n ends in 9, and after adding 1, the last digit 9 carries over, turning the last digit into 0. If the next digit is also a 9, this process repeats until we get to a non-9 digit. By the end, the sum of digits would decrease by 9 multiplied by the number of carry-overs but increase by 1 as a result of the final carrying over. Therefore, the result must be $9x-1$ less than original value of S(n), 1274, where x is a positive integer. The only choice that satisfies this condition is $\boxed{1239},$ since (1274-1239+1) $\bmod 9 = 0.$ The answer is $\boxed{D}.$
## Solution 3
Another way to solve this is to realize that if you continuously add the digits of the number 1274 $(1 + 2 + 7 + 4 = 14, 1 + 4 = 5)$, we get 5. Adding one to that, we get 6. So, if we assess each option to see which one attains 6, we would discover that 1239 satisfies the requirement, because $1 + 2 + 3 + 9 = 15. 1 + 5 = 6$. The answer is $\boxed{D}.$
## Solution 4(Similar to Solution 1)
Note that a lot of numbers can have a sum of 1274, but what we use wishful thinking and want is some simple number n where it is easy to compute the sum of the digits of $n+1$. This number would consists of basically all digits 9, since when you add 1 a lot of stuff will cancel out and end up at $0(ex: 399+1=400)$. We see that the maximum number of $9s$ that can be in 1274 is 141 and we are left with a remainder of 5, so n is in the form 99...9599...9. If we add 1 to this number we will get 99...9600...0 so this the sum of the digits of $n+1$ is congruent to 6 $\mod 9.$ The only answer choice that is equivalent to 6 $\mod 9$ is 1239, so our answer is $\boxed{D} -s$risainandan6
## Remark
Notice that S($n+1)=S(n)+1-9k$, where k is the # of carry overs that happen

*~tsun26*
## Video Solution by OmegaLearn
https://youtu.be/zfChnbMGLVQ?t=3996

*~pi_is_3.14*
## See Also
