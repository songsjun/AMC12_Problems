# 2011 AMC 12B Problem 21

## Problem
The arithmetic mean of two distinct positive integers x and y is a two-digit integer. The geometric mean of x and y is obtained by reversing the digits of the arithmetic mean. What is |x - y|?

$\textbf{(A)}\ 24 \qquad \textbf{(B)}\ 48 \qquad \textbf{(C)}\ 54 \qquad \textbf{(D)}\ 66 \qquad \textbf{(E)}\ 70$
## Solution 1
Answer: (D)

$\frac{x + y}{2} = 10$ a+b for some $1\lea\le 9 , 0\leb\le 9.$

$$\sqrt{xy} = 10 b+a$$

Squaring the first and second equations, $\frac{x^2 + 2xy + y^2}{4}=100 a^2 + 20 ab + b^2$

$$xy = 100b^2 + 20ab + a^2$$

Subtracting the previous two equations, $\frac{x^2 + 2xy + y^2}{4} -xy =\frac{x^2 - 2xy + y^2}{4} = \left(\frac{x-y}{2}\right)^2 = 99 a^2 - 99 b^2 =99(a^2 - b^2)$

$$|x-y| = 2\sqrt{99(a^2 - b^2)}=6\sqrt{11(a^2 - b^2)}$$

Note that for x-y to be an integer, (a^2 - b^2) has to be $11n$ for some perfect square n. Since a is at most 9, $n = 1$ or 4

If $n = 1$, |x-y| = 66, if $n = 4$, |x-y| = 132. In AMC, we are done. Otherwise, we need to show that $n=4$, or $a^2 -b^2 = 44$ is impossible.

(a-b)(a+b) = 44 -> a-$b = 1$, or 2 or 4 and a+$b = 44$, 22, 11 respectively. And since a+b $\le 18,$ a+$b = 11, a-b = 4$, but there is no integer solution for a, b.
### Short Cut
We can arrive at |x-y| = $6\sqrt{11(a^2 - b^2)}$ using the method above. Because we know that |x-y| is an integer, it must be a multiple of 6 and 11. Hence the answer is 66.

In addition:
Note that $11n$ with $n = 1$ may be obtained with $a = 6$ and $b = 5$ as $a^2 -b^2 =36 - 25 = 11$.
## Sidenote
It is easy to see that (a,b)=(6,5) is the only solution. This yields (x,y)=(98,32). Their arithmetic mean is 65 and their geometric mean is 56.
## Solution 2
Let (x+y)/$2 =10a$ + b and $\sqrt{xy} = 10$b + a. By AM-GM we know that a $\ge$ b. Squaring and multiplying by 4 on the first equation we get $x^2 + y^2 +2xy =400a^2+4b^2 + 80$ab. Squaring and multiplying the second equation by 4 we get $4xy =400b^2+4a^2 + 80$ab. Subtracting we get $(x-y)^2 =396(a^2 - b^2)$. Note that $396 = $2^2 $\cdot 3^2 \cdot 11.$ So to make it a perfect square a^2 - b^2 = 11. From [difference of squares](https://artofproblemsolving.com/wiki/index.php/difference_of_squares), we see that $a = 6$ and $b = 5$. So the answer is 3 $\cdot 2 \cdot 11 = 66.$
*~coolmath_2018*
## Solution 3 (whee!)
Let the 2 digit number be $10a$+b. We know x+y=20$a+2$b and $\sqrt{xy} = 10$b+a.

Thus. $x^2+2xy+y^2 =400a^2+80ab+4b^2$ and $xy =100b^2+20$ab+a^2. Notice that |x-y| = $\sqrt{(x-y)^2}.$ We know that $(x-y)^2 = (x+y)^2-4xy =396a^2-396b^2$. Then, |x-y| = $6\sqrt{11}\cdot \sqrt{b^2-a^2}.$ Clearly, |x-y| must be a multiple of 11, so the only possible answer is $\boxed{\textbf{(D) }66}.$

*~skibbysiggy*
## See also
