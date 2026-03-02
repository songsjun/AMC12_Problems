# 2015 AMC 12A Problem 19

> This problem is the same as [2015 AMC 12A #19](https://artofproblemsolving.com/wiki/index.php/2015_AMC_12A_Problems) and [2015 AMC 10A #24](https://artofproblemsolving.com/wiki/index.php/2015_AMC_10A_Problems).
## Problem 24
For some positive integers $p$, there is a quadrilateral $ABCD$ with positive integer side lengths, perimeter $p$, right angles at $B$ and $C$, $AB=2$, and $CD=AD$.  How many different values of $p<2015$ are possible?

$\textbf{(A) }30\qquad\textbf{(B) }31\qquad\textbf{(C) }61\qquad\textbf{(D) }62\qquad\textbf{(E) }63$
## Solution 1
Let $BC = x$ and $CD = AD = y$ be positive integers. Drop a perpendicular from $A$ to $CD$ to show that, using the Pythagorean Theorem, that


$$x^2 + (y - 2)^2 = y^2.$$


Simplifying yields $x^2 - 4y + 4 = 0$, so $x^2 = 4(y - 1)$. Thus, $y$ is one more than a perfect square.

The perimeter $p = 2 + x + 2y = 2y + \sqrt{y - 1} + 2$ must be less than 2015. Simple calculations demonstrate that $y = 31^2 + 1 = 962$ is valid, but $y = 32^2 + 1 = 1025$ is not. On the lower side, $y = 1$ does not work (because $x > 0$), but $y = 1^2 + 1$ does work. Hence, there are 31 valid $y$ (all $y$ such that $y = n^2 + 1$ for $1 \le n \le 31$), and so our answer is $\boxed{\textbf{(B) } 31}$
## Solution 2
Let $BC = x$ and $CD = AD = z$ be positive integers. Drop a perpendicular from $A$ to $CD$. Denote the intersection point of the perpendicular and $CD$ as $E$.

$AE$'s length is $x$, as well.
Call $EDy$.
By the Pythagorean Theorem,  $x^2 + y^2 = (y + 2)^2$.
And so: $x^2 = 4y + 4$, or $y = (x^2-4)/4$.

Writing this down and testing, it appears that this holds for all $x$. However, since there is a dividend of 4, the numerator must be divisible by 4 to conform to the criteria that the side lengths are positive integers.
In effect, $x$ must be a multiple of 2 to let the side lengths be integers. We test, and soon reach 62. It gives us $p = 1988$, which is less than 2015. However, 64 gives us $2116 > 2015$, so we know 62 is the largest we can go up to. Count all the even numbers from 2 to 62, and we get $\boxed{\textbf{(B) } 31}$.

*~jackshi2006*
## Solution 3 (Less Counting)
Let $BC = n$ and $CD = AD = m$ be positive integers. Drop a perpendicular from $A$ to $CD$. Denote the intersection point of the perpendicular and $CD$ as $E$.

$AE$'s length is $n$, and $ED = m-2$
By the Pythagorean Theorem,  $m^2 = (m-2)^2 + n^2$
, therefore $n^2 = 4(m-1)$

Notice that 4 is already a perfect square and $n$ is an integer, meaning $m-1$ also has to be a perfect square.
We can denote $m-1$ as $x^2$, therefore we have $m = x^2 + 1, n = 2x$, and each $x$ will correspond to a pair of $(n, m)$.

Since $p<2015, 2 + n + m + m<2015$ which gives us $n+2m<2013$. Substituting $x$ will give us $2x+2(x^2 + 1) < 2013$, simplify this will again give us $x^2 + x + 1 < 1006.5$
Try $x = 32, x^2 + x + 1 = 1057 > 1006.5$, exceeded
so $x$ must be less than $32$

When $x=31, x^2 + x + 1 = 993 < 1006.5, x=31$ works for us.

For $x$ in (0, \infty), $f(x) = x^2 + x + 1$ increases, therefore for any $x<31, f(x) < f(31) < 1006.5$

Thus, any $x$ in $[1, 31]$ satisfy the condition that $x^2 + x + 1 < 1006.5. x$ needs to be integer, and there are $31$ integers in the interval $[1, 31]$.

Each $x$ corresponds to a $(n, m)$, meaning there are $31$ possible value for different pairs of $(n, m)$ and lead to $\boxed{\textbf{(B) } 31}$ possible values for the perimeter $p$.

~ [https://artofproblemsolving.com/wiki/index.php/User:Andy_li0805 Andy_li0805]
## Video Solution by Richard Rusczyk
https://artofproblemsolving.com/videos/amc/2015amc10a/398

*~dolphin7*
## Video Solution
https://youtu.be/9DSv4zn7MyE

*~savannahsolver*
## See Also
