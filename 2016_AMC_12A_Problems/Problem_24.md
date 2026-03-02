# 2016 AMC 12A Problem 24

## Problem
There is a smallest positive real number a such that there exists a positive real number b such that all the roots of the polynomial $x^3-ax^2+bx-a$ are real. In fact, for this value of a the value of b is unique. What is this value of b?

$\textbf{(A)}\ 8\qquad\textbf{(B)}\ 9\qquad\textbf{(C)}\ 10\qquad\textbf{(D)}\ 11\qquad\textbf{(E)}\ 12$
## Solution 1 (calculus)
The acceleration must be zero at the x-intercept; this intercept must be an inflection point for the minimum a value.
Derive f(x) so that the acceleration f''(x)=0. Using the power rule,

$$
\begin{align*} f(x) &= x^3-ax^2+bx-a \\ f’(x) &= 3x^2-2ax+b \\ f’’(x) &= 6x-2a \end{align*}
$$

So $x=\frac{a}{3}$ for the inflection point/root. Furthermore, the slope of the function must be zero - maximum - at the intercept, thus having a triple root at x=a/3 (if the slope is greater than zero, there will be two complex roots and we do not want that).

The function with the minimum a:


$$
f(x)=\left(x-\frac{a}{3}\right)^3
x^3-ax^2+\left(\frac{a^2}{3}\right)x-\frac{a^3}{27}
$$

Since this is equal to the original equation $x^3-ax^2+bx-a,$ equating the coefficients, we get that


$$
\frac{a^3}{27}=a\rightarrow a^2=27\rightarrow a=3\sqrt{3}
b=\frac{a^2}{3}=\frac{27}{3}=\boxed{\textbf{(B) }9}
$$


The actual function:
$$f(x)=x^3-\left(3\sqrt{3}\right)x^2+9x-3\sqrt{3}$$

$f(x)=0\rightarrowx=\sqrt{3}$ triple root. "Complete the cube."
## Solution 2
Let the roots of the polynomial be r, s, t. By Vieta's formulas we have r+s+t=a, rs+st+rt=b, and rst=a. Since both a and b are positive, it follows that all 3 roots r, s, t are positive as well, and so we can apply AM-GM to get $\tfrac 13 (r+s+t) \ge \sqrt$[3]{rst} $\quad \Rightarrow \quad$ a $\ge 3\sqrt$[3]{a}. Cubing both sides and then dividing by a (since a is positive we can divide by a and not change the sign of the inequality) yields $a^2 \ge 27 \quad \Rightarrow \quad$ a $\ge 3\sqrt{3}.$
Thus, the smallest possible value of a is $3\sqrt{3}$ which is achieved when all the roots are equal to $\sqrt{3}.$ For this value of a, we can use Vieta's to get $b=\boxed{\textbf{(B) }9}.$
## Solution 3 (SUPER RISKY) do if you have no time
We see that with cubics, the number 3 comes up a lot, and as $9=3\cdot3$ has the most relation to 3, we can assume $b=\boxed{\textbf{(B) }9}.$

-Sorry, but the number 3 doesn't actually come up very often as you said, so this solution might not actually be a good idea. ~get-rickrolled

-It's also probably better to get 1.5 points for not answering than using this method. Sorry! ~slamgirls~
## Solution 3.5(SUPER TECHNICAL)
The question offers us information that there is only one b.

If there are 3 roots, only one of the two operation, increasing b or decreasing b, could let the root become imaginary.

As a result, there could only be one root, and we could thus get the answer.
## Video Solution by the Art of Problem Solving
https://www.youtube.com/watch?v=OkI1HDEj2B8&list=PLyhPcpM8aMvI7N78mYZyatqveRU30iNcf&index=4

- AMBRIGGS
## See Also
