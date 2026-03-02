# 2002 AMC 12A Problem 20

## Problem
Suppose that a and b are digits, not both nine and not both zero, and the repeating decimal $0.\overline{ab}$ is expressed as a fraction in lowest terms. How many different denominators are possible?


$$\text{(A) }3 \qquad \text{(B) }4 \qquad \text{(C) }5 \qquad \text{(D) }8 \qquad \text{(E) }9$$

## Solution
### Solution 1
The repeating decimal $0.\overline{ab}$ is equal to

$$\frac{10a+b}{100} + \frac{10a+b}{10000} + \cdots = (10a+b)\cdot\left(\frac 1{10^2} + \frac 1{10^4} + \cdots \right) = (10a+b) \cdot \frac 1{99} = \frac{10a+b}{99}$$


When expressed in the lowest terms, the denominator of this fraction will always be a divisor of the number 99 = $3\cdot 3\cdot 11.$ This gives us the possibilities $\{1,3,9,11,33,99\}$. As a and b are not both nine and not both zero, the denominator 1 can not be achieved, leaving us with $\boxed{\mathrm{(C) }5}$ possible denominators.

(The other ones are achieved e.g. for ab equal to 33, 11, 9, 3, and 1, respectively.)
### Solution 2
Another way to convert the decimal into a fraction (simplifying, I guess?). We have $100($0.\overline{ab})= ab.$\overline{ab} 99(0.\overline{ab}) = 100(0.\overline{ab}) - 0.\overline{ab} =$ ab.$\overline{ab} - 0.\overline{ab} =$ ab $0.\overline{ab} = \frac{ab}{99}$
where a, b are digits. Continuing in the same way by looking at the factors of 99, we have 5 different possibilities for the denominator. $\boxed{(C)}$

*~Nafer*
*~edit by SpeedCuber7*
*~edit by PojoDotCom*
### Solution 3
Since $\frac{1}{99}=0.\overline{01},$ we know that $0.\overline{ab} = \frac{ab}{99}.$ From here, we wish to find the number of factors of 99, which is 6. However, notice that 1 is not a possible denominator, so our answer is $6-1=\boxed{5}.$

*~AopsUser101*
### Solution 4 (Alcumus)
Since $0.\overline{ab} = \frac{ab}{99},$ the denominator must be a factor of $99 = $3^2 $\cdot 11.$ The factors of 99 are 1, 3, 9, 11, 33, and 99. Since a and b are not both nine, the denominator cannot be 1. By choosing a and b appropriately, we can make fractions with each of the other denominators.

Thus, the answer is $\boxed{5}.$
## Video Solution
https://youtu.be/0_0XpawpVVs
## Video Solution by SpreadTheMathLove
https://www.youtube.com/watch?v=x086uFh-i00
## See Also
