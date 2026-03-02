# 2017 AMC 12B Problem 8

## Problem
The ratio of the short side of a certain rectangle to the long side is equal to the ratio of the long side to the diagonal. What is the square of the ratio of the short side to the long side of this rectangle?

$\textbf{(A)}\ \frac{\sqrt{3}-1}{2}\qquad\textbf{(B)}\ \frac{1}{2}\qquad\textbf{(C)}\ \frac{\sqrt{5}-1}{2} \qquad\textbf{(D)}\ \frac{\sqrt{2}}{2} \qquad\textbf{(E)}\ \frac{\sqrt{6}-1}{2}$
## Solution 1: Cross-Multiplication
Let a be the short side of the rectangle, and b be the long side of the rectangle. The diagonal, therefore, is $\sqrt{a^2 + b^2}.$ We can get the equation $\frac{a}{b} = \frac{b}{\sqrt{a^2 + b^2}}.$ Cross-multiplying, we get $a\sqrt{a^2 + b^2} =$ b^2. Squaring both sides of the equation, we get $a^2 (a^2 + b^2) = b^4,$ which simplifies $to a^4 +a^2b^2$ - b^4 = 0. Solving for a quadratic $in a^2,$ using the quadratic formula we get $a^2 =\frac{-b^2 \pm \sqrt{5b^4}}{2}$ which gives us $\frac{a^2}{b^2} = \frac{-1 \pm \sqrt{5}}{2}.$ We know that the square of the ratio must be positive (the square of any real number is positive), so the solution is $\boxed{\textbf{(C)} \frac{\sqrt{5}-1}{2}}.$

Solution by: vedadehhc
## Solution 2: Substitution
Solution by HydroQuantum

Let the short side of the rectangle be a and let the long side of the rectangle be b. Then, the diagonal, according to the Pythagorean Theorem, is $\sqrt{a^2+b^2}.$ Therefore, we can write the equation:

$$\frac{a}{b} = \frac{b}{\sqrt{a^2 + b^2}}.$$

We are trying to find the square of the ratio of a to b. Let's let our answer, $\frac{a^2}{b^2},$ be k. Then, squaring the above equation,


$$\frac{a^2}{b^2}=k=\frac{b^2}{a^2 + b^2}=\frac{b^2}{a^2}-\frac{b^2}{b^2}=\frac{1}{k}-1.$$


Thus, $k=\frac{1}{k}-1.$

Multiplying each side of the equation by k,

$$k^2=1-k.$$

Adding each side by $k-1$,

$$k^2+k-1=0.$$

Solving for k using the Quadratic Formula,

$$k=\frac{-1\pm\sqrt{1^2-4(1)(-1)}}{2}=\frac{-1\pm\sqrt{5}}{2}.$$

Since the ratio of lengths and diagonals of a rectangle cannot be negative, and $\sqrt{5}>1,$ the $\pm$ symbol can only take on the +. Therefore,

$$k=\frac{-1+\sqrt{5}}{2}=\boxed{\textbf{(C)} \frac{\sqrt{5}-1}{2}}.$$
## Solution 3
WLOG, assume the short side of the rectangle is 1 and the long side is x.  Then, we wish to find $\frac{1}{x^2}$ when we are given $\frac{1}{x}=\frac{x}{\sqrt{x^2+1}}\impliesx^4-x^2-1=0.  Let y=x^2$ and note that $y^2-y-1=0$ has solutions $y=\frac{1\pm\sqrt{5}}{2}.$  Since we want the positive answer, then $x^2=y=\frac{1+\sqrt{5}}{2}$ and $\frac{1}{x^2}=\boxed{\textbf{(C)} \frac{\sqrt{5}-1}{2}}.$

Solution by Jzhang21
## See Also
