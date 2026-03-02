# 2014 AMC 12A Problem 8

> This problem is the same as [2014 AMC 12A #8](https://artofproblemsolving.com/wiki/index.php/2014_AMC_12A_Problems) and [2014 AMC 10A #11](https://artofproblemsolving.com/wiki/index.php/2014_AMC_10A_Problems).
## Problem
A customer who intends to purchase an appliance has three coupons, only one of which may be used:

Coupon 1: $10\%$ off the listed price if the listed price is at least $\textdollar50$

Coupon 2: $\textdollar 20$ off the listed price if the listed price is at least $\textdollar100$

Coupon 3: $18\%$ off the amount by which the listed price exceeds $\textdollar100$

For which of the following listed prices will coupon $1$ offer a greater price reduction than either coupon $2$ or coupon $3$?

$\textbf{(A) }\textdollar179.95\qquad
$\textbf{(B) }\textdollar199.95\qquad$
$\textbf{(C) }\textdollar219.95\qquad$
$\textbf{(D) }\textdollar239.95\qquad$
$\textbf{(E) }\textdollar259.95\qquad$$
## Solution 1
Let the listed price be $x$. Since all the answer choices are above $\textdollar100$, we can assume $x > 100$. Thus the discounts after the coupons are used will be as follows:

Coupon 1: $x\times10\%=.1x$

Coupon 2: $20$

Coupon 3: $18\%\times(x-100)=.18x-18$


For coupon $1$ to give a greater price reduction than the other coupons, we must have $.1x>\implies x>200$ and $.1x>.18x\implies.08x<\implies x<225$.

The only choice that satisfies such conditions is $\boxed{\textbf{(C)}\ \textdollar219.95}$
## Solution 2 (Using The Answers)
For coupon $1$ to be the most effective, we want 10% of the price to be greater than 20. This clearly occurs if the value is over 200. For coupon 1 to be more effective than coupon 3, we want to minimize the value over 200, so $\boxed{\textbf{(C) }\textdollar219.95}$ is the smallest answer choice over 200.
## Solution 3
Since all the answer choices are above $\$100$, let the price be $\$100 + x$, where $x > 0$. Then, the discount from Coupon 1 is $\10 + \frac{x}{10}$$, the discount from Coupon 2 is $\$20$, and the discount from Coupon 3 is $\frac{9}{50}x$. Thus we obtain the following inequalities:

$$
\begin{align*}
&10 + \frac{x}{10} > 20 \\
&10 + \frac{x}{10} > \frac{9}{50}x
\end{align*}
$$

Solving them, we obtain $x > 100$ and $x < 125$. Thus the price is between $\$200$ and $\$\Rightarrow \boxed{\text{(C)}}$.
## Video Solutions
### Video Solution 1
https://youtu.be/aGEB3ykW1BM

*~savannahsolver*
### Video Solution 2
https://youtu.be/rJytKoJzNBY
## See Also
