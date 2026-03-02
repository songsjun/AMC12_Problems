# 2012 AMC 12A Problem 8

> This problem is the same as [2012 AMC 12A #8](https://artofproblemsolving.com/wiki/index.php/2012_AMC_12A_Problems) and [2012 AMC 10A #13](https://artofproblemsolving.com/wiki/index.php/2012_AMC_10A_Problems).
## Problem
An *iterative average* of the numbers 1, 2, 3, 4, and 5 is computed the following way. Arrange the five numbers in some order. Find the mean of the first two numbers, then find the mean of that with the third number, then the mean of that with the fourth number, and finally the mean of that with the fifth number. What is the difference between the largest and smallest possible values that can be obtained using this procedure?

$\textbf{(A)}\ \frac{31}{16}\qquad\textbf{(B)}\ 2\qquad\textbf{(C)}\ \frac{17}{8}\qquad\textbf{(D)}\ 3\qquad\textbf{(E)}\ \frac{65}{16}$
## Solution 1
The iterative average of any 5 integers $a,b,c,d,e$ is defined as:


$$\frac{\frac{\frac{\frac{a+b} 2+c} 2+d} 2+e} 2=\frac{a+b+2c+4d+8e}{16}$$


Plugging in $1,2,3,4,5$ for $a,b,c,d,e$, we see that in order to maximize the fraction,

$a=1,b=2,c=3,d=4,e=5$,

and in order to minimize the fraction,

$a=5,b=4,c=3,d=2,e=1$.

After plugging in these values and finding the positive difference of the two fractions, we arrive with $\frac{34}{16} \Rightarrow \frac{17}{8}$, which is our answer of $\boxed{\textbf{(C)}}$
## Solution 2
The minimum and maximum can be achieved with the orders $5, 4, 3, 2, 1$ and $1, 2, 3, 4, 5$ respectively. We can see this because the iterative average is like a weighted average that gives more weight to later numbers.

$5,4,3,2,1 \Rightarrow \frac92,3,2,1 \Rightarrow \frac{15}{4},2,1 \Rightarrow \frac{23}{8},1 \Rightarrow \frac{31}{16}$

$1,2,3,4,5 \Rightarrow \frac32,3,4,5 \Rightarrow \frac94,4,5 \Rightarrow \frac{25}{8},5 \Rightarrow \frac{65}{16}$

The difference between the two is $\frac{65}{16}-\frac{31}{16}=\frac{34}{16}=\boxed{\textbf{(C)}\ \frac{17}{8}}$.
## See Also
