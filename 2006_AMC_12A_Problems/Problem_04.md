# 2006 AMC 12A Problem 4

> This problem is the same as [2006 AMC 12A #4](https://artofproblemsolving.com/wiki/index.php/2006_AMC_12A_Problems) and [2006 AMC 10A #4](https://artofproblemsolving.com/wiki/index.php/2006_AMC_10A_Problems/Problem_4).
## Problem
A digital watch displays hours and minutes with AM and PM. What is the largest possible sum of the digits in the display?

$\textbf{(A)}\ 17\qquad\textbf{(B)}\ 19\qquad\textbf{(C)}\ 21\qquad\textbf{(D)}\ 22\qquad\textbf{(E)}\ 23$
## Solution 1
From the [greedy algorithm](https://artofproblemsolving.com/wiki/index.php/greedy_algorithm), we have 9 in the hours section and 59 in the minutes section. $9+5+9=\boxed{\textbf{(E) }23}$
## Solution 2 ([matrix](https://artofproblemsolving.com/wiki/index.php/matrix))
With a matrix, we can see

$$
\begin{bmatrix} 1+2&9&6&3\\ 1+1&8&5&2\\ 1+0&7&4&1 \end{bmatrix}
$$

The largest single digit sum we can get is 9.
For the minutes digits, we can combine the largest 2 digits, which are 9,5 $\Rightarrow 9+5=14,$ and finally $14+9=\boxed{\textbf{(E) }23}$
## Solution 3
We first note that since the watch displays time in AM and PM, the value for the hours section varies from 00-12. Therefore, the maximum value of the digits for the hours is when the watch displays 09, which gives us $0+9=9$.

Next, we look at the value of the minutes section, which varies from 00-59. Let this value be a number ab. We quickly find that the maximum value for a and b is respectively 5 and 9.

Adding these up, we get $9+5+9=\boxed{\textbf{(E) }23}.$

*~Dairyqueenxd*
## See also
