# 2010 AMC 12B Problem 14

## Problem
Let a, b, c, d, and e be positive integers with a+b+c+d+$e=2010$ and let M be the largest of the sum a+b, b+c, c+d and d+e. What is the smallest possible value of M?

$\textbf{(A)}\ 670 \qquad \textbf{(B)}\ 671 \qquad \textbf{(C)}\ 802 \qquad \textbf{(D)}\ 803 \qquad \textbf{(E)}\ 804$
## Solution 1
We want to try make a+b, b+c, c+d, and d+e as close as possible so that M, the maximum of these, is smallest.

Notice that 2010=670+670+670. In order to express 2010 as a sum of 5 numbers, we must split up some of these numbers. There are two ways to do this (while keeping the sum of two numbers as close as possible): 2010=670+1+670+1+668 or 2010=670+1+669+1+669. We see that in both cases, the value of M is 671, so the answer is 671 $\Rightarrow \boxed{B}.$
## Solution 2
Since a + b $\le M,$ d + e $\le M,$ and c < b + c $\le M,$ we have that 2010 = a + b + c + d + e < 3M. Hence, M > 670, or M $\ge 671.$

For the values (a,b,c,d,e) = (669,1,670,1,669), M = 671, so the smallest possible value of M is $\boxed{671}.$ The answer is (B).

*~math31415926535*
## Solution 3
Notice that only the sums of adjacent numbers matter. (For example, a & c could be extremely high, as long as b is relatively low.)
Therefore creating "mountains" and "valleys" is the best way to lower the sum of adjacent numbers. We can do

1. (high, low, high, low, high)

or

2. (low, high, low, high, low)

In the extreme case that each "low" = 0, 2010 will be divided into either 3 or 2 numbers for cases 1 and 2, respectively. Obviously dividing by 3 will yield a lower number, so we consider case 1.

Dividing 2010 by 3 yields 670, or

(670, 0, 670, 0, 670)

However, all five numbers must be positive, and the closest we can get to this is

(668, 3, 668, 3, 668)

The lowest possible sum of two adjacent numbers then becomes 671, or $\boxed{B}.$
## Video Solution by CanadaMath
https://youtu.be/RDqm4GrKGyg?si=h7nKbYsKG-Yd8UFA&t=506
## See also
