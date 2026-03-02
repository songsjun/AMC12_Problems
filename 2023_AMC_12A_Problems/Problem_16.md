# 2023 AMC 12A Problem 16

## Problem
Consider the set of complex numbers z satisfying |1+z+$z^{2}$|=4. The maximum value of the imaginary part of z can be written in the form $\tfrac{\sqrt{m}}{n},$ where m and n are relatively prime positive integers. What is m+n?

$\textbf{(A)}~20\qquad\textbf{(B)}~21\qquad\textbf{(C)}~22\qquad\textbf{(D)}~23\qquad\textbf{(E)}~24$
## Solution 1
First, substitute in z=a+bi.


$$
|1+(a+bi)+(a+bi)^2|=4
|(1+a+a^2-b^2)+ (b+2ab)i|=4
(1+a+a^2-b^2)^2+ (b+2ab)^2=16
(1+a+a^2-b^2)^2+ b^2(1+4a+4a^2)=16
$$


Let $p=b^2$ and $q=1+a+a^2$


$$
(q-p)^2+ p(4q-3)=16
p^2-2pq+q^2 + 4pq -3p=16
$$


We are trying to maximize $b=\sqrt$ p, so we'll turn the equation into a quadratic to solve for p in terms of q.


$$
p^2+(2q-3)p+(q^2-16)=0
p=\frac{(-2q+3)\pm \sqrt{-12q+73}}{2}
$$


We want to maximize p. Since q is always negatively contributing to p's value, we want to minimize q.

Due to the trivial inequality:
$$q=1+a+a^2=(a+\frac 12)^2+\frac{3}4 \geq \frac{3}4$$

If we plug q's minimum value in, we get that p's maximum value is

$$p=\frac{(-2(\frac 34)+3)+ \sqrt{-12(\frac 34)+73}}{2}=\frac{\frac 32+ 8}{2}=\frac{19}{4}$$


Then
$$b=\frac{\sqrt{19}}{2}$$
and
$$m+n=\boxed{\textbf{(B)}~21}$$

- CherryBerry
## Solution 2
We are given that $1+z+z^2=c$ where c is some complex number with magnitude 4. Rearranging the quadratic to standard form and applying the quadratic formula, we have
$$z=\frac{-1\pm \sqrt{1^2-4(1)(1-c)}}{2}=\frac{-1\pm\sqrt{4c-3}}{2}.$$

The imaginary part of z is maximized when c=-4. (Why? See note below.)

Thus $z=-\tfrac 12 \pm$ i $\tfrac{\sqrt{19}}{2},$ and so the answer is $\boxed{\textbf{(B)}~21}.$

*~cantalon, centslordm*

Note: You can cheese/fakesolve c by assuming c is real. But there is a good reason for it, within the parameters of this problem:

c lies on a circle of radius 4, centered at the origin. Thus, {$4c-3$} is also a circle, centered at -3. Luckily, the center of this adjusted circle is a negative real number, so the most negative point on that circle (w = -19) has the largest magnitude (and so its square root also has the largest magnitude of any square root), and its positive square root is the most purely imaginary square root ("vertical"). [We ignore the alternative negative square root, since the problem asks for the most positive value.]

Thus, $\text{Im}(\sqrt$ w) = r $\sin(\theta)$ has both the largest r and largest $\sin(\theta)$ of any square root of $4c-3$, and so the largest product r $\sin(\theta). ($See note2 for more details)

[This argument and overall solution would not work if -3 were instead a positive or non-real number, which would happen if the original problem had |$C+Bz+Az^2$|=4 with $B^2-4AC > 0$ .]
*~oinava*

Note 2:

> [Asymptote diagram - not rendered in Markdown]

```asy
size(250); import TrigMacros; rr_cartesian_axes(-22,19,-19,19,complexplane=true, usegrid = false); Label f; f.p=fontsize(4); dot((-3, 0), red); label("$(-3, 0)$", (-3, 0), NW); dot((0,0)); draw(circle((-3, 0), 16), red); dot((-19, 0), blue); label("$w(-19, 0)$", (-19, 0), NW);
```


The circle in the graph is all the possible values of $4c - 3$.
Let {$4c - 3} = re ^ {i\theta$}.


$${4c - 3} = re ^ {i\theta} \implies \sqrt{4c - 3} = \sqrt{re ^ {i\theta}} = \sqrt{r} e ^ {i\frac{\theta}{2}}.$$

Therefore, Im($\sqrt{4c - 3}) = \sqrt{r}\sin(\frac{\theta}{2}).$

At w(-19, 0) as in the graph, $\theta = \pi$ and $r = 19$.
So $\sqrt{r}$ and $\sin(\frac{\theta}{2})$ are all at their maximum, which means that Im($\sqrt{4c - 3})$ is at its maximum.

*~JiYang*
## Solution 3 (Geometry + Logic)
> [Asymptote diagram - not rendered in Markdown]

```asy
size(250); import TrigMacros; rr_cartesian_axes(-6,5,-5,5,complexplane=true, usegrid = true); Label f; f.p=fontsize(6); xaxis(-6,5,Ticks(f, 1.0)); yaxis(-5,5,Ticks(f, 1.0)); dot((0,0)); draw(circle((-3/4, 0), 4), red + dashed); dot((-19/4, 0), blue); label("$\phi$", (-19/4, 0), NW); dot((0, 2.18), blue); label("$v'$", (0, 2.18), NE); draw(ellipse((0,0),1.8,2.18), green);
```

We can write the given condition as $\left$|$\left(z+\frac{1}{2}\right)^2 + \frac{3}{4}\right$| = 4.
Letting u = $\left(z+\frac{1}{2}\right)^2,$ the equation $\left$|u + $\frac{3}{4}\right$| = 4 equates to the circle centered at $-\frac{3}{4}$ with radius 4 in the complex plane, call it $\omega.$ Thus the locus of $\left(z+\frac{1}{2}\right)^2$ is $\omega.$ Let v = $z+\frac{1}{2},$ and since the +$\frac{1}{2}$ does not change z's imaginary part, we now need to find v with the largest imaginary part such that $v^2$ lies on $\omega.$

Note that the point on $\omega$ with largest magnitude is 19/4 and has argument $\pi,$ call it $\phi ($The leftmost point on $\omega).$ The value v' with positive imaginary part such that (v'$)^2 =\phi$ has an argument of $\frac{\pi}{2}$ and a magnitude of $\frac{\sqrt{19}}{2}.$

Since across all values of v the imaginary part is given by $r\sin{\theta}$ and v' has the largest possible r and the largest possible value of $\sin{\theta},$ it must have the largest imaginary part.

This can non-rigorously be seen by sketching the oval which is the locus of v.

This gives 19 + 2 $\implies \boxed{\textbf{(B)}~21}$

*~AtharvNaphade*
## Solution 4
To start, we factor $1+z+z^2 to$ get:

$$\left|\left(z-\frac{-1+\sqrt{3}i}{2}\right)\cdot\left(z-\frac{-1-\sqrt{3}i}{2}\right)\right|=4.$$

Note that since the magnitude of a product of complex numbers is equal to the product of the magnitudes:

$$\left|\left(z+\frac{1-\sqrt{3}i}{2}\right)\right|\cdot\left|\left(z+\frac{1+\sqrt{3}i}{2}\right)\right|=4.$$

Now, we substitute z=a+bi (Note that we are trying to maximize b):

$$\left|a+\frac{1}{2}+\left(b+\frac{\sqrt{3}}{2}\right)i\right|\cdot\left|a+\frac{1}{2}+\left(b-\frac{\sqrt{3}}{2}\right)i\right|=4.$$

Since we are trying to maximize b, we want the real parts of the components to be as small as possible, which we can do by setting $a=-\frac{1}{2}.$ This leaves us with:

$$
\begin{align*} \left|\left(b+\frac{\sqrt{3}}{2}\right)i\right|\cdot\left|\left(b-\frac{\sqrt{3}}{2}\right)i\right|&=4 \\ \left(b+\frac{\sqrt{3}}{2}\right)\left(b-\frac{\sqrt{3}}{2}\right)&=4 \\ b^2-\frac{3}{4}&=4 \\ b^2&=\frac{19}{4} \\ b&=\frac{\sqrt{19}}{2}. \end{align*}
$$

This gives us 19 + $2=\boxed{\textbf{(B)}~21}.$

*~LTHMath*
## Solution 5
$z^2+z+1$ reminds me of $(z-1)(z^2+z+1)=z^3-1.$
Complex numbers z that satisfies |1+z+$z^{2}$|=4 either comply to 1+z+$z^{2}=4$ or 1+z+$z^{2}$=-4.
In another words, complex numbers z that satisfy $(z-1)(z^2+z+1)=4(z-1)$ or $(z-1)(z^2+z+1)=-4(z-1)$ corresponds to complex numbers z that satisfies |1+z+$z^{2}$|=4.
### Case I: (z-1)(z^2+z+1)=4(z-1)
$(z-1)(z^2+z+1)=4(z-1)$ could be rewritten as $z^3-1=4(z-1$).
$$z^3-4z+3=0$$
By substituting 1 for z and using synthetic division, it is evident that $z^3-4z+3=(z-1)(z^2+z-3$)=0.
$$z=1 \text{ or } z=\frac{-1\pm\sqrt{13}}{2}$$
### Case II: (z-1)(z^2+z+1)=-4(z-1)
$(z-1)(z^2+z+1)=-4(z-1)$ could be rewritten as $z^3-1=-4(z-1)$.
$$z^3+4z-5=0$$
By substituting 1 for z and using synthetic division, it is evident that $z^3+4z-5=(z-1)(z^2+z+5$)=0.
$$z=1 \text{ or } z=\frac{-1\pm\sqrt{-19}}{2}$$
### Determining the Maximum Value of the Imaginary Part of z
It is important to note the 1 cannot be a value for z because while multiplying $(z-1)$ to both sides, 1 became a solution for z. Therefore, four values for possible z are $\frac{-1\pm\sqrt{13}}{2} \text{ and } \frac{-1\pm\sqrt{-19}}{2}.$
Because m and n are positive integers, the only possible value for m+n is 19+2, or $\boxed{(B) \text{ } 21}.$
*~MaPhyCom*
## Video Solution
https://youtu.be/Aq0iIp0ipyM

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## See Also
