# 2013 AMC 12A Problem 25

## Problem
Let f : $\mathbb{C} \to \mathbb{C}$  be defined by  $f(z) = z^2$ + iz + 1 . How many complex numbers z  are there such that  $\text{Im}(z) > 0$  and both the real and the imaginary parts of f(z) are integers with absolute value at most  10 ?

$\textbf{(A)} \ 399 \qquad \textbf{(B)} \ 401 \qquad \textbf{(C)} \ 413 \qquad \textbf{(D)} \ 431 \qquad \textbf{(E)} \ 441$
## Solution
Suppose $f(z)=z^2+iz+1$=c=a+bi. We look for z with \operatorname{Im}(z)>0 such that a,b are integers where |a|, |b|$\leq 10.$

First, use the quadratic formula:


$$z = \frac{1}{2} (-i \pm \sqrt{-1-4(1-c)}) = -\frac{i}{2} \pm \sqrt{ -\frac{5}{4} + c }$$


Generally, consider the imaginary part of a radical of a complex number: $\sqrt{u},$ where u = v+wi = r $e^{i\theta}$.


$$\operatorname{Im}(\sqrt{u}) = \operatorname{Im}(\pm \sqrt{r} e^{i\theta/2}) = \pm \sqrt{r} \sin(\theta/2) = \pm \sqrt{r}\sqrt{\frac{1-\cos\theta}{2}} = \pm \sqrt{\frac{r-v}{2}}.$$


Now let u= -5/4 + c, then v = -5/4 + a, w=b, $r=\sqrt{v^2 + w^2}.$

Note that \operatorname{Im}(z)>0 if and only if $\pm \sqrt{\frac{r-v}{2}}>\frac{1}{2}.$ The latter is true only when we take the positive sign, and that r-v > 1/2,

$$or v^2 + w^2 > (1/2 + v)^2 = 1/4 + v + v^2, w^2 > 1/4 + v, or b^2 > a-1.$$

In other words, when $b^2>a-1$, the equation $f(z)=a+bi$ has unique solution z in the region \operatorname{Im}(z)>0; and when $b^2 \leqa-1$ there is no solution. Therefore the number of desired solution z is the same as the number of ordered pairs (a,b) such that integers |a|, |b|$\leq 10,$ and that $b^2 \geq$ a.

When $a\leq 0,$ there is no restriction on b so there are $11\cdot 21 = 231$ pairs;

when a > 0, there are $2(1+4+9+10+10+10+10+10+10+10)=2(84)=168$ pairs.

So there are $231+168=\boxed{399}$ in total.
## Solution 2 (motivated by coordinate geometry)
We consider the function f(z) as a mapping from the 2-D complex plane onto itself. We complete the square of $f(z)=z^2+iz+1=(z+\frac{i}{2})^2+\frac{5}{4}.$

Now, we must decide the range of f(z) based on the domain of z, \operatorname{Im}(z)>0. To do this, we are interested in mapping the boundary line \operatorname{Im}(z)=0. To make the mapping simpler, let $f(z)=g(z)+\frac{5}{4},$ or $g(z)=(z+\frac{i}{2})^2.$

We intend to map of the line \operatorname{Im}(z)=0 using the function g(z). This transformation is equivalent to the polar equation r=($\frac{1}{2}\csc(\frac{\theta}{2}))^2.$ Using polar and trig identities, we can restate this equation as the rectangular form of a parabola,

$$x=y^2-\frac{1}{4},$$

where x=\operatorname{Re}(z) and y=\operatorname{Im}(z). So, we conclude that f(z) maps the line \operatorname{Im}(z)=0 to the parabola

$$x=y^2-\frac{1}{4}+\frac{5}{4}=y^2+1.$$

A quick check reveals that the range of f(z) is to the left of the parabola, meaning that any point on or to the right of parabola cannot be reached.

Since the problem requires |\operatorname{Re}(z)| and |\operatorname{Im}(z)| to both be integers and at most 10, all that remains is counting all points with integer coordinates in the range of f(z), \operatorname{Im}(z)>0. To do this, we employ complementary counting.

The points of interest are |\operatorname{Re}(z)|$\leq 10$ and |\operatorname{Im}(z)|$\leq 10,$ resulting in a total of 441 points. For lattice points on or to the right of the parabola, there are 10 points for $x=0$, 9 points for $x=\pm 1, 6$ points for $x=\pm 2,$ and 1 point for $x=\pm 3.$ Summing it all together, our answer is 441-(10+2*9+2*6+2*1)=$\boxed{399}.$
## Video Solution by Richard Rusczyk
https://artofproblemsolving.com/videos/amc/2013amc12a/365
## See also
