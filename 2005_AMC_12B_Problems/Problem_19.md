# 2005 AMC 12B Problem 19

## Problem
Let x and y be two-digit integers such that y is obtained by reversing the digits of x. The integers x and y satisfy $x^{2}-y^{2}=m^{2}$ for some positive integer m. What is x+y+m?


$$\mathrm{(A)}\ 88 \qquad \mathrm{(B)}\ 112 \qquad \mathrm{(C)}\ 116 \qquad \mathrm{(D)}\ 144 \qquad \mathrm{(E)}\ 154 \qquad$$

## Solution
let $x=10a$+b, then $y=10b$+a where a and b are nonzero digits.

By [difference of squares](https://artofproblemsolving.com/wiki/index.php/difference_of_squares),

$$
x^2-y^2=(x+y)(x-y)
=(10a+b+10b+a)(10a+b-10b-a)
=(11(a+b))(9(a-b))
$$


For this product to be a square, the factor of 11 must be repeated in either (a+b) or (a-b), and given the constraints it has to be (a+b)=11. The factor of 9 is already a square and can be ignored. Now (a-b) must be another square, and since a cannot be 10 or greater then (a-b) must equal 4 or 1. If a-$b=4$ then (a+b)+(a-b)=11+4, $2a=$15, $a=15/2$, which is not a digit. Hence the only possible value for a-b is 1. Now we have (a+b)+(a-b)=11+1, $2a=$12, $a=6$, then $b=5, x=65, y=56, m=33$, and $x+y+m=154\Rightarrow\boxed{\mathrm{E}}$
## See also
