# 2019 AMC 12B Problem 7

> This problem is the same as [2019 AMC 10B #13](https://artofproblemsolving.com/wiki/index.php/2019_AMC_10B_Problems) and [2019 AMC 12B #7](https://artofproblemsolving.com/wiki/index.php/2019_AMC_12B_Problems).
## Problem
What is the sum of all real numbers x for which the median of the numbers 4,6,8,17, and x is equal to the mean of those five numbers?

$\textbf{(A) } -5 \qquad\textbf{(B) } 0 \qquad\textbf{(C) } 5 \qquad\textbf{(D) } \frac{15}{4} \qquad\textbf{(E) } \frac{35}{4}$
## Solution
The mean is $\frac{4+6+8+17+x}{5}=\frac{35+x}{5}.$

There are three possibilities for the median: it is either 6, 8, or x.

Let's start with 6.

$\frac{35+x}{5}=6$ has solution x=-5, and the sequence is -5, 4, 6, 8, 17, which does have median 6, so this is a valid solution.

Now let the median be 8.

$\frac{35+x}{5}=8$ gives x=5, so the sequence is 4, 5, 6, 8, 17, which has median 6, so this is not valid.

Finally we let the median be x.

$\frac{35+x}{5}=x \implies 35+x=5x \impliesx=\frac{35}{4}=8.75,$ and the sequence is 4, 6, 8, 8.75, 17, which has median 8. This case is therefore again not valid.

Hence the only possible value of x is $\boxed{\textbf{(A) }-5}.$
## Video Solution
https://youtu.be/eHdp481w9I0

*~Education, the Study of Everything*
## Video Solution
https://youtu.be/IziHKOubUI8?t=600
## See Also
