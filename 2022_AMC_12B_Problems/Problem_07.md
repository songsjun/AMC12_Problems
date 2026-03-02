# 2022 AMC 12B Problem 7

> This problem is the same as [2022 AMC 10B #10](https://artofproblemsolving.com/wiki/index.php/2022_AMC_10B_Problems/Problem_10) and [2022 AMC 12B #7](https://artofproblemsolving.com/wiki/index.php/2022_AMC_12B_Problems/Problem_7).
## Problem
Camila writes down five positive integers. The unique mode of these integers is $2$ greater than their median, and the median is $2$ greater than their arithmetic mean. What is the least possible value for the mode?

$\textbf{(A)}\ 5 \qquad\textbf{(B)}\ 7 \qquad\textbf{(C)}\ 9 \qquad\textbf{(D)}\ 11 \qquad\textbf{(E)}\ 13$
## Solution 1 (Variables)
Let $M$ be the median. It follows that the two largest integers are both $M+2.$

Let $a$ and $b$ be the two smallest integers such that $a<b.$ The sorted list is

$$a,b,M,M+2,M+2.$$


Since the median is $2$ greater than their arithmetic mean, we have $\frac{a+b+M+(M+2)+(M+2)}{5}+2=M,$ or

$$a+b+14=2M.$$


Note that $a+b$ must be even. We minimize this sum so that the arithmetic mean, the median, and the unique mode are minimized. Let $a=1$ and $b=3,$ from which $M=9$ and $M+2=\boxed{\textbf{(D)}\ 11}.$

*~MRENTHUSIASM*
## Solution 2 (Elimination)
We can also easily test all the answer choices. (This strategy is generally good to use for multiple-choice questions if you don't have a concrete method to proceed with!)

For answer choice $\textbf{(A)},$ the mode is $5,$ the median is $3,$ and the arithmetic mean is $1.$ However, we can quickly see this doesn't work, as there are five integers, and they can't have an arithmetic mean of $1$ while having a mode of $5.$

Trying answer choice $\textbf{(B)},$ the mode is $7,$ the median is $5,$ and the arithmetic mean is $3.$ From the arithmetic mean, we know that all the numbers have to sum to $15.$ We know three of the numbers: $\underline{\hspace{3mm}},\underline{\hspace{3mm}},5,7,7.$ This exceeds the sum of $15.$

Now we try answer choice $\textbf{(C)}.$ The mode is $9,$ the median is $7,$ and the arithmetic mean is $5.$ From the arithmetic mean, we know that the list sums to $25.$ Three of the numbers are $\underline{\hspace{3mm}},\underline{\hspace{3mm}},7,9,9,$ which is exactly $25.$ However, our list needs positive integers, so this won't work.

Since we were really close on answer choice $\textbf{(C)},$ we can intuitively feel that the answer is probably going to be $\textbf{(D)}.$ We can confirm this by creating a list that satisfies the problem and choose $\textbf{(D)}: 1,3,9,11,11.$

So, our answer is $\boxed{\textbf{(D)}\ 11}.$
## Video Solution (🚀 Very Fast 🚀)
https://youtu.be/2tx9GEbIRxU

*~Education, the Study of Everything*
## Video Solution(1-16)
https://youtu.be/SCwQ9jUfr0g

~~Hayabusa1
## Video Solution by Interstigation
https://youtu.be/_KNR0JV5rdI?t=1241
## See Also
