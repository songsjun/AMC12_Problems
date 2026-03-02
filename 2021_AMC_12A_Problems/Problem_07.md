# 2021 AMC 12A Problem 7

> This problem is the same as [2021 AMC 10A #9](https://artofproblemsolving.com/wiki/index.php/2021_AMC_10A_Problems/Problem_9) and [2021 AMC 12A #7](https://artofproblemsolving.com/wiki/index.php/2021_AMC_12A_Problems/Problem_7).
## Problem
What is the least possible value of $(xy-1)^2+(x+y)^2$ for real numbers x and y?

$\textbf{(A)} ~0\qquad\textbf{(B)} ~\frac{1}{4}\qquad\textbf{(C)} ~\frac{1}{2} \qquad\textbf{(D)} ~1 \qquad\textbf{(E)} ~2$
## Solution 1 (Expand)
Expanding, we get that the expression is $x^2+2xy+y^2+x^2y^2-2$xy+1 or $x^2+y^2+x^2y^2+1$. By the Trivial Inequality (all squares are nonnegative) the minimum value for this is $\boxed{\textbf{(D)} ~1},$ which can be achieved at $x=y=0$.

*~aop2014*
## Solution 2 (Expand and then Factor)
We expand the original expression, then factor the result by grouping:

$$
\begin{align*} (xy-1)^2+(x+y)^2&=\left(x^2y^2-2xy+1\right)+\left(x^2+2xy+y^2\right) \\ &=x^2y^2+x^2+y^2+1 \\ &=x^2\left(y^2+1\right)+\left(y^2+1\right) \\ &=\left(x^2+1\right)\left(y^2+1\right). \end{align*}
$$

Clearly, both factors are positive. By the Trivial Inequality, we have $\left(x^2+1\right)\left(y^2+1\right)\geq\left(0+1\right)\left(0+1\right)=\boxed{\textbf{(D)} ~1}.$
Note that the least possible value of $(xy-1)^2+(x+y)^2$ occurs at $x=y=0$.

*~MRENTHUSIASM*
## Solution 3 (Beyond Overkill)
Like solution 1, expand and simplify the original equation $to x^2+y^2+x^2y^2+1$ and let $f(x, y) = x^2+y^2+x^2y^2+1$. To find local extrema, find where $\nabla$ f(x, y) = $\boldsymbol{0}.$ First, find the first partial derivative with respect to x and y and find where they are 0:

$$
\frac{\partial f}{\partial x} = 2x + 2xy^{2} = 2x(1 + y^{2}) = 0 \implies x = 0
\frac{\partial f}{\partial y} = 2y + 2yx^{2} = 2y(1 + x^{2}) = 0 \implies y = 0
$$

Thus, there is a local extremum at (0, 0). Because this is the only extremum, we can assume that this is a minimum because the problem asks for the minimum (though this can also be proven using the partial second derivative test) and the global minimum since it's the only minimum, meaning f(0, 0) is the minimum of f(x, y). Plugging (0, 0) into f(x, y), we find 1 $\implies \boxed{\textbf{(D)} ~1}.$

*~DBlack2021*

Remark:
Honestly, this isn't even that overkill. I did it this way, and it was not very bashy.
*~vaishnav*
## Video Solution (Simple & Quick)
https://youtu.be/2CZ1u4J9yk4

*~Education, the Study of Everything*
## Video Solution by Aaron He (Trivial Inequality)
https://www.youtube.com/watch?v=xTGDKBthWsw&t=6m58s
## Video Solution by North America Math Contest Go Go Go (Trivial Inequality, Simon's Favourite Packing Theorem)
https://www.youtube.com/watch?v=PbJK4KKfQjY&list=PLexHyfQ8DMuKqltG3cHT7Di4jhVl6L4YJ&index=8
## Video Solution by Hawk Math
https://www.youtube.com/watch?v=P5al76DxyHY
## Video Solution by OmegaLearn (Trivial Inequality, Simon's Favorite Factoring)
https://youtu.be/DP0ppuQzFPE

*~pi_is_3.14*
## Video Solution 6
https://youtu.be/hmOGYmVmY1c

*~savannahsolver*
## Video Solution by TheBeautyofMath
https://youtu.be/s6E4E06XhPU?t=640 (for AMC 10A)

https://youtu.be/cckGBU2x1zg?t=95 (for AMC 12A)

*~IceMatrix*
## Video Solution by The Learning Royal
https://youtu.be/AWjOeBFyeb4
## Yet another Video Solution
https://youtu.be/pUdeIBlp-y8
## See also
