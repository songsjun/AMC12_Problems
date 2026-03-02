# 2004 AMC 12B Problem 15

> This problem is the same as [2004 AMC 12B #15](https://artofproblemsolving.com/wiki/index.php/2004_AMC_12B_Problems) and [2004 AMC 10B #17](https://artofproblemsolving.com/wiki/index.php/2004_AMC_10B_Problems).
## Problem
The two digits in Jack's age are the same as the digits in Bill's age, but in reverse order. In five years Jack will be twice as old as Bill will be then. What is the difference in their current ages?


$$\mathrm{(A) \ } 9 \qquad \mathrm{(B) \ } 18 \qquad \mathrm{(C) \ } 27 \qquad \mathrm{(D) \ } 36\qquad \mathrm{(E) \ } 45$$

## Solution 1
If Jack's current age is $\overline{ab}=10$a+b, then Bill's current age is $\overline{ba}=10$b+a.

In five years, Jack's age will be $10a+b+5$ and Bill's age will be $10b+a+5$.

We are given that $10a+b+5=2(10b+a+5)$.

Thus $8a=19b+5\Rightarrowa=\dfrac{19b+5}{8}.$

For $b=1$ we get $a=3. For b=2$ and $b=3$ the value $\frac{19b+5}8$ is not an integer, and for $b\geq 4,$ a is more than 9. Thus the only solution is (a,b)=(3,1), and the difference in ages is $31-13=\boxed{\mathrm{(B)\ }18}.$
## Solution 2
Age difference does not change in time. Thus in five years Bill's age will be equal to their age difference.

The age difference is ($10a+b)-(10b+a)=9(a-b)$, hence it is a multiple of 9. Thus Bill's current age modulo 9 must be 4.

Thus Bill's age is in the set $\{13,22,31,40,49,58,67,76,85,94\}$.

As Jack is older, we only need to consider the cases where the tens digit of Bill's age is smaller than the ones digit. This leaves us with the options $\{13,49,58,67\}$.

Checking each of them, we see that only 13 works, and gives the solution $31-13=\boxed{\mathrm{(B)\ }18}.$
## See also
