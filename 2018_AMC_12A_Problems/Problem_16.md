# 2018 AMC 12A Problem 16

> This problem is the same as [2018 AMC 10A #21](https://artofproblemsolving.com/wiki/index.php/2018_AMC_10A_Problems/Problem_21) and [2018 AMC 12A #16](https://artofproblemsolving.com/wiki/index.php/2018_AMC_12A_Problems/Problem_16).
## Problem
Which of the following describes the set of values of $a$ for which the curves $x^2+y^2=a^2$ and $y=x^2-a$ in the real $xy$-plane intersect at exactly $3$ points?

$\textbf{(A) }a=\frac14 \qquad
$\textbf{(B) }\frac14 < a < \frac12 \qquad$
$\textbf{(C) }a>\frac14 \qquad$
$\textbf{(D) }a=\frac12 \qquad$
$\textbf{(E) }a>\frac12 \qquad$$
## Solution 1 (Algebra)
Substituting $y=x^2-a$ into $x^2+y^2=a^2$, we get


$$x^2+(x^2-a)^2=a^2 \implies x^2+x^4-2ax^2=0 \implies x^2(x^2-(2a-1))=0$$


Since this is a quartic, there are $4$ total roots (counting multiplicity). We see that $x=0$ always has at least one intersection at $(0,-a)$ (and is in fact a double root).

The other two intersection points have $x$ coordinates $\pm\sqrt{2a-1}$. We must have $2a-1> 0;$ otherwise we are in the case where the parabola lies entirely below the circle (tangent at the point $(0,-a)$). This only results in a single intersection point in the real coordinate plane. Thus, we see that $\boxed{\textbf{(E) }a>\frac12}$.

(projecteulerlover)
## Solution 2 (Algebra)
Substituting $y = x^2 - a$ gives $x^2 + (x^2 - a)^2 = a^2$, which simplifies to $x^2 + x^4 - 2x^2a + a^2 = a^2$. This further simplifies to $x^2(1 + x^2 - 2a) = 0$. Thus, either $x^2 = 0$, or $x^2 - 2a + 1 = 0$.

Since we care about $a$, we consider the second case. We solve in terms of $a$, giving $a = \frac{x^2}{2} + \frac{1}{2}$. We see that in order to find the range in which $a$ lies, we must find the vertex of this equation, which turns out to be $\left(0, \frac{1}{2}\right)$. Hence, we know that the minimum is $\frac{1}{2}$, which further implies that $\boxed{\textbf{(E) }a>\frac12}$.
## Solution 3 (Graphs)
<asy>
Label f;
f.p=fontsize(6);
xaxis(-2,2,Ticks(f, 0.2));
yaxis(-2,2,Ticks(f, 0.2));
real g(real x)
{
return $x^2-1$;
}

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(graph(g, 1.7, -1.7));
```

real h(real x)
{
return sqrt(1-x^2);
}

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(graph(h, 1, -1));
```

real j(real x)
{
return -sqrt(1-x^2);
}

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(graph(j, 1, -1));
```

</asy>

Looking at a graph, it is obvious that the two curves intersect at $(0, -a)$. We also see that if the parabola goes "in" the circle, then by going out of it (as it will), it will intersect five times. This is impossible. Thus, we only look for cases where the parabola becomes externally tangent to the circle.

We have $x^2 - a = \sqrt{a^2 - x^2}$. Squaring both sides and solving yields $x^4 - (2a - 1)x^2 = 0$. Since $x = 0$ is already accounted for, we only need to find one solution for $x^2 = 2a - 1$, where the right hand side portion is obviously increasing. Since $a = \frac{1}{2}$ begets $x = 0$ (an overcount), we have $\boxed{\textbf{(E) }a>\frac12}$ as the right answer.

Solution by JohnHankock
## Solution 4 (Graphs)
This describes a unit parabola, with a circle centered on the axis of symmetry and tangent to the vertex. As the curvature of the unit parabola at the vertex is $2$, the radius of the circle that matches it has a radius of $\frac{1}{2}$. This circle is tangent to an infinitesimally close pair of points, one on each side. Therefore, it is tangent to only $1$ point. When a larger circle is used, it is tangent to $3$ points because the points on either side are now separated from the vertex. Therefore, $\boxed{\textbf{(E) }a>\frac12}$ is correct.
## Solution 5 (Graphs)
Now, let's graph these two equations. We want the blue parabola to be inside this red circle.
<asy>
import graph;

> [Asymptote diagram - not rendered in Markdown]

```asy
size(6cm);
draw((0,0)--(0,10),EndArrow);
draw((0,0)--(0,-10),EndArrow);
draw((0,0)--(10,0),EndArrow);
draw((0,0)--(-10,0),EndArrow);
Label f;
f.p=fontsize(6);
xaxis(-10,10);
yaxis(-10,10);
```

real f(real x)
{
return $x^2-5$;
}

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(graph(f,-4,4),blue+linewidth(1));
draw(circle((0,0),5),red);
```

dot(scale(.7)*"$a$",(0,5),NE);
dot(scale(.7)*"$-a$",(0,-5),N);
dot(scale(.7)*"$a$",(5,0),NE);
dot(scale(.7)*"$-a$",(-5,0),SE);
</asy>
Then we substitute $y$ into the first equation to get $x^2+(x^2-a)^2=a^2$. Expanding, we get $x^4-2ax^2+x^2=0$. Factoring out the $x^2$, we get $x^2(x^2-2a+1)=0$. Then we find that $x=0$ or $x=\pm\sqrt{2a-1}$. Therefore, $2a-1>0$, which means $\boxed{\textbf{(E) }a>\frac12}$.

- kante314 -
*~minor edit by junokim1011 and RJ5303707*
## Solution 6 (Calculus)
In order to solve for the values of $a$, we need to just count multiplicities of the roots when the equations are set equal to each other: in other words, take the derivative. We know that $\sqrt{a^2 - x^2} = x^2 - a$. Now, we take square of both sides, and rearrange to obtain $x^4 - (2a - 1)x^2 = 0$. Now, we may take the second derivative of the equation to obtain $6x^2 - (2a - 1) = 0$. Now, we must take discriminant. Since we need the roots of that equation to be real and not repetitive (otherwise they would not intersect each other at three points), the discriminant must be greater than zero. Thus,


$$b^2 - 4ac > 0 \rightarrow 0 - 4(6)(-(2a - 1)) > 0 \rightarrow a > \frac{1}{2}$$


The answer is $\boxed{\textbf{(E) }a>\frac12}$ and we are done.

*~awesome1st*

(Edited by OlutosinNGA)
## Solution 7 (Calculus)
Notice, the equations are of that of a circle of radius a centered at the origin and a parabola translated down by a units. They always intersect at the point $(0, a)$, and they have symmetry across the $y$-axis, thus, for them to intersect at exactly $3$ points, it suffices to find the $y$ solution.

First, rewrite the second equation to $y=x^2-a\implies x^2=y+a$
And substitute into the first equation: $y+a+y^2=a^2$
Since we're only interested in seeing the interval in which a can exist, we find the discriminant: $1-4a+4a^2$. This value must not be less than $0$ (It is the square root part of the quadratic formula). To find when it is $0$, we find the roots:


$$4a^2-4a+1=0 \implies a=\frac{4\pm\sqrt{16-16}}{8}=\frac{1}{2}$$


Since $\lim_{a\to \infty}(4a^2-4a+1)=\infty$, our range is $\boxed{\textbf{(E) }a>\frac12}$.

Solution by ktong
## Solution 8 (Observations)
We can see that if $a = 1$, we know that the points where the two curves intersect are $(0, -1), (1, 0)$ and $(-1, 0)$ .Because there are only $3$ intersections and $a > 1/2$, as well as $a > 1/4$ we know that either $\textbf{(D)}$ or $\textbf{(E)}$ is the correct answer. Then we can test a number from $(1/2, 1/4)$ to eliminate the remaining answer. So  $\boxed{\textbf{(E) }a>\frac12}$ is the correct answer.

*~josephwidjaja (Solution)*

*~username_taken12 (Revision)*
## Solution 9 (Observations)
Simply plug in $a = \frac{1}{2}, \frac{1}{4}, 1$ and solve the systems. (This shouldn't take too long.) And then realize that only $a=1$ yields three real solutions for $x$, so we are done and the answer is $\boxed{\textbf{(E) }a>\frac12}$.

*~ccx09*
## Solution 10 (Observations)
An ideal solution come to mind is where they intersect at the $x$-axis at the same time, which is $(a, 0)$ and $(-a, 0).$ Take the root of our $y=x^2-a$ we get $x=\sqrt{a}$, set them equal we get $a=\sqrt{a}.$ The only answer is $1$ so it only left us with the answer choice $\boxed{\textbf{(E) }a>\frac12}$.

~@azure123456
## Solution 11 (Curvature, Calculus)
From observing the graph of the two functions, we notice that there will be exactly 3 solutions when the curvature of $y = x^2-a$ is greater than the curvature of the circle $x^2+y^2 = a^2$ near $x=0$ (this means the graph of $y=x^2-a$ will reside within the circle). Formally, curvature is the magnitude of the rate of change of the unit tangent in respect to arc length. Let there be function $r(x)$ be a vector-valued function. The unit tangent has formula $T(x)=\frac{r'(x)}{|r'(x)|}=\frac{dr}{ds}$, and arc length has formula $s(t)=\int_b^{t}\sqrt{\left( 1+ \left( \frac{dr}{dx} \right) ^2 \right) }dx$. We have the relation $\frac{ds}{dx}=\sqrt{\left( 1+ \left( \frac{dr}{dx} \right) ^2 \right) }=|r'(x)|$. Our goal, curvature, is $\kappa= \left| \frac{d^2r}{ds^2} \right| =\frac{dT}{ds}|=\frac1{|\frac{ds}{dt}|}|\frac{dT}{dt}|$. After deriving, we end up with the formula:


$$\kappa = \frac{y^{\prime\prime}}{(1+(y^{\prime})^2)^\frac{3}{2}}$$


For a circle, curvature is just the inverse of the radius or $1/a$ in our case. For the parabola, we use the equation above:


$$\kappa = \frac{y^{\prime\prime}}{(1+(y^{\prime})^2)} = \frac{2}{(1+4x^2)^{1.5}}$$


where $\kappa \approx 2$ when $x \approx 0$. Since curvature of the parabola should be greater than that of the circle, $2>\frac{1}{a}$ or answer choice $\boxed{\textbf{(E)}a>\frac12}$.

*~Chupdogs*
## Remark
The graph of $x^2+y^2=a^2$ is a circle with the center $(0,0)$ and the radius $|a|.$

The graph of $y=x^2-a$ is an upward-opening parabola with the vertex $(0,-a).$

The circle and the parabola are shown here in Desmos: https://www.desmos.com/calculator/rfeknuhjum

Move the slider around for $\frac12\leq \leq5$ to observe that they intersect at exactly $3$ points: $(0,-a)$ and $\left(\pm\sqrt{2a-1},a-1\right),$ provided that $a>\frac12.$

*~MRENTHUSIASM*
## Solution 12 (cheap)
We observe that there is more than one value for $a$, so we can eliminate $(A)$ and $(D)$. We can also observe that as we increase $a$, the parabola will always intersect the circle at 3 points, which eliminates $(B)$. Finally, we notice that if the $a=1/4$ case is not a perfect square, then $(C)$ is not the correct answer.


Substituting $1/4$ for $a$, we get:


$x^2+y^2=(1/4)^2$

$x^2-1/4=y$ --> $x^2=y+1/4$

$y^2+y+1/4=(1/4)^2$ --> $y^2+y+3/16$


From this, we can see that the $a=1/4$ case is incorrect, so our final answer is $\boxed{\textbf{(E)}a>\frac12}$.

- WB0s0n
## Video Solution by Pi Academy (Fast and easy Algebra)
https://youtu.be/UvzCuc_VjAY?si=eITJBLBQMPnl6D7F

*~Pi Academy*
## Video Solution by Richard Rusczyk
https://artofproblemsolving.com/videos/amc/2018amc10a/466

*~dolphin7*
## See Also
