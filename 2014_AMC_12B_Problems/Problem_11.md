# 2014 AMC 12B Problem 11

## Problem
A list of 11 positive integers has a mean of 10, a median of 9, and a unique mode of 8. What is the largest possible value of an integer in the list?

$\textbf{(A)}\ 24\qquad\textbf{(B)}\ 30\qquad\textbf{(C)}\ 31\qquad\textbf{(D)}\ 33\qquad\textbf{(E)}\ 35$
## Solution
We start off with the fact that the median is 9, so we must have a, b, c, d, e, 9, f, g, h, i, j, listed in ascending order. Note that the integers do not have to be distinct.

Since the mode is 8, we have to have at least 2 occurrences of 8 in the list. If there are 2 occurrences of 8 in the list, we will have a, b, c, 8, 8, 9, f, g, h, i, j. In this case, since 8 is the unique mode, the rest of the integers have to be distinct. So we minimize a,b,c,f,g,h,i in order to maximize j. If we let the list be 1,2,3,8,8,9,10,11,12,13,j, then $j = 11\times 10 - (1+2+3+8+8+9+10+11+12+13) = 33.$

Next, consider the case where there are 3 occurrences of 8 in the list. Now, we can have two occurrences of another integer in the list. We try 1,1,8,8,8,9,9,10,10,11,j. Following the same process as above, we get $j = 11\times 10 - (1+1+8+8+8+9+9+10+10+11) = 35.$ As this is the highest choice in the list, we know this is our answer. Therefore, the answer is $\boxed{\textbf{(E) }35}$
## See also
