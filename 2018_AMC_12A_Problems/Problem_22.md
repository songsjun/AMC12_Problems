# 2018 AMC 12A Problem 22

## Problem
The solutions to the equations $z^2=4+4\sqrt{15}$i and $z^2=2+2\sqrt 3$i, where $i=\sqrt{-1},$ form the vertices of a parallelogram in the complex plane. The area of this parallelogram can be written in the form $p\sqrtq-r\sqrt$ s, where p, q, r, and s are positive integers and neither q nor s is divisible by the square of any prime number. What is p+q+r+s?

$\textbf{(A) } 20 \qquad \textbf{(B) } 21 \qquad \textbf{(C) } 22 \qquad \textbf{(D) } 23 \qquad \textbf{(E) } 24$
## Solution 1 (Complex Numbers in Rectangular Form)
We solve each equation separately:

$$1.   z^2=4+4\sqrt{15}i$$
Let z=a+bi for some real numbers a and b.

Substituting and expanding, we get $\begin{align*} (a+bi)^$2&=4+$4\sqrt{15}$i \\ $\left(a^2-b^2\right)+2$abi&=4+4$\sqrt{15}$i. $\end{align*}$ Equating the real parts and the imaginary parts, respectively, we get $\begin{align*}a^2-$b^2&=4, &&(1) \\ ab&=$2\sqrt{15}.$ &&(2) $\end{align*}$ We rearrange (1) and square (2):$\begin{align*}a^2&=b^2+4,\hspace{4mm}$ &&($1\star)$ \\ $a^$2b^2&=60. &&($2\star) \end{align*}$ Substituting ($1\star)$ into ($2\star),$ we obtain $\left(b^2+4\right)$b^2=60. Since $b^2\geq0$ for all real numbers b, either inspection or factoring gives b^2=6. Substituting this into either ($1\star)$ or ($2\star)$ produces a^2=10. Since ab>0 from (2), we have (a,b)=$\left(\sqrt{10},\sqrt{6}\right),\left(-\sqrt{10},-\sqrt{6}\right).$

The solutions to $z^2=4+4\sqrt{15}$i are $\boldsymbol{z=\sqrt{10}+\sqrt{6}i,-\sqrt{10}-\sqrt{6}i}.$

$$2.   z^2=2+2\sqrt{3}i$$

By the same process, we have (a,b)=$\left(\sqrt3,1\right),\left(-\sqrt3,-1\right).$

The solutions to $z^2=2+2\sqrt{3}$i are $\boldsymbol{z=\sqrt3+i,-\sqrt3-i}.$

Note that the problem is equivalent to finding the area of a parallelogram with consecutive vertices ($x_1,y_1)=\left(\sqrt{10}, \sqrt{6}\right),(x_2,y_2)=\left(\sqrt{3},1\right),(x_3,y_3)=\left(-\sqrt{10},-\sqrt{6}\right),$ and ($x_4,y_4)=\left(-\sqrt{3}, -1\right)$ in the coordinate plane. By the Shoelace Theorem, the area we seek is $\frac{1}{2} \left$|($x_1y_2+x_2y_3 + x_3y_4+x_4y_1) - (y_1x_2+y_2x_3 + y_3x_4+y_4x_1)\right$| = $6\sqrt2-2\sqrt{10},$ so the answer is $6+2+2+10=\boxed{\textbf{(A) } 20}.$

*~Rejas ~MRENTHUSIASM*
## Solution 2 (Complex Numbers in Polar Form)
We solve each equation separately:

$$1.   z^2=4+4\sqrt{15}i$$
Let z=r($\cos\theta+i\sin\theta)=r$\operatorname{cis}$\theta,$ where r is the magnitude of z such that $r\geq0,$ and $\theta$ is the argument of z such that $0\leq\theta<2\pi.$

By De Moivre's Theorem, we have $z^2=r^2$\operatorname{cis}($2\theta)=16\left(\frac14+\frac{\sqrt{15}}{4}i\right),$ from which

$$*   r^2=16, so r=4.$$


$$
- \begin{cases} \begin{aligned} \cos(2\theta) &= \frac14 \\ \sin(2\theta) &= \frac{\sqrt{15}}{4} \end{aligned}, \end{cases} so \cos\theta=\pm\sqrt{\frac{1+\cos(2\theta)}{2}}=\pm\frac{\sqrt{10}}{4} and \sin\theta=\pm\sqrt{\frac{1-\cos(2\theta)}{2}}=\pm\frac{\sqrt{6}}{4} by Half-Angle Formulas.
$$


 Since $\cos(2\theta)>0$ and $\sin(2\theta)>0,$ it follows that $2\theta\in\biggl(0,\frac{\pi}{2}\biggr)\cup\biggl(2\pi,\frac{5\pi}{2}\biggr),$ or $\theta\in\biggl(0,\frac{\pi}{4}\biggr)\cup\biggl(\pi,\frac{5\pi}{4}\biggr).$ We conclude that (r,\operatorname{cis}$\theta)=\left(4,\frac{\sqrt{10}}{4}+\frac{\sqrt{6}}{4}i\right),\left(4,-\frac{\sqrt{10}}{4}-\frac{\sqrt{6}}{4}i\right).$

 The solutions to $z^2=4+4\sqrt{15}$i are $\boldsymbol{z=\sqrt{10}+\sqrt{6}i,-\sqrt{10}-\sqrt{6}i}.$

$$2.   z^2=2+2\sqrt 3i,$$

By a similar process, we conclude that (r,$\theta)=\biggl(2,\frac{\pi}{6}\biggr),\biggl(2,\frac{7\pi}{6}\biggr).$

The solutions to $z^2=2+2\sqrt{3}$i are $\boldsymbol{z=\sqrt3+i,-\sqrt3-i}.$

We continue with the last paragraph of Solution 1 to get the answer $\boxed{\textbf{(A) } 20}.$

*~trumpeter ~MRENTHUSIASM*
## Solution 3 (Vectors)
Let $z_1$ and $z_2$ be the solutions to the equation $z^2=4+4\sqrt{15}$i, and $z_3$ and $z_4$ be the solutions to the equation $z^2=2+2\sqrt 3$i. Clearly, $z_1$ and $z_2$ are opposite complex numbers, so are $z_3$ and $z_4$. _**This solution refers to the results of De Moivre's Theorem in Solution 2.**_

From Solution 2, let $z_1=4$\operatorname{cis}$\phi$ for some 0<$\phi<\frac{\pi}{4}.$ It follows that $z_2=4$\operatorname{cis}($\phi+\pi).$ On the other hand, we have $z_3=2$\operatorname{cis}$\frac{\pi}{6}$ and $z_4=2$\operatorname{cis}$\frac{7\pi}{6}$ without loss of generality. Since $\tan(2\phi)>\tan\frac{\pi}{3},$ we deduce that $2\phi>\frac{\pi}{3},$ from which $\phi>\frac{\pi}{6}.$

In the complex plane, the positions of $z_1,z_2,z_3$, and $z_4$ are shown below:

> [Asymptote diagram - not rendered in Markdown]

```asy
/* Made by MRENTHUSIASM */ size(200); int xMin = -5; int xMax $= 5$; int yMin = -5; int yMax $= 5$; int numRays $= 24$; //Draws a polar grid that goes out to a number of circles //equal to big, with numRays specifying the number of rays: void polarGrid(int big, int numRays) { for (int $i = 1$; i < big+1; ++i) { draw(Circle((0,0),i), gray+linewidth(0.4)); } for(int $i=0$;i Note that the diagonals of every parallelogram partition the shape into four triangles with equal areas. Therefore, to find the area of the parallelogram with vertices $z_1,z_2,z_3$, and $z_4$, we find the area of the triangle with vertices 0,$z_1$, and $z_3$, then multiply by 4. Recall that |$z_$1|=4, |$z_$2|=2, $\sin\phi=\frac{\sqrt6}{4},$ and $\cos\phi=\frac{\sqrt{10}}{4}$ from Solution 2. The area of the parallelogram is $\begin{align*} 4\cdot\left$[$\frac12\cdot$|$z_$1|$\cdot$|$z_$3|$\cdot\sin\left(\phi-\frac{\pi}{6}\right)\right$] &= $16\sin\left(\phi-\frac{\pi}{6}\right)$ \\ &= $16\left$[$\sin\phi\cos\frac{\pi}{6}-\cos\phi\sin\frac{\pi}{6}\right$] \\ &= $16\left$[$\frac{\sqrt3}{2}\sin\phi-\frac12\cos\phi\right$] \\ &= $6\sqrt2-2\sqrt{10}, \end{align*}$ so the answer is $6+2+2+10=\boxed{\textbf{(A) } 20}.$ ~MRENTHUSIASM
## Solution 4 (Vectors)
Rather than thinking about this with complex numbers, notice that if we take two solutions and think of them as vectors, the area of the parallelogram they form is half the desired area. Also, notice that the area of a parallelogram is ab$\sin \theta$ where a and b are the side lengths. The side lengths are easily found since we are given the squares of z. Thus, the magnitude of z in the first equation is just $\sqrt{16} = 4$ and in the second equation is just $\sqrt{4} = 2.$ Now, we need $\sin \theta.$ To find $\theta,$ think about what squaring is in complex numbers. The angle between the squares of the two solutions is twice the angle between the two solutions themselves. In addition, we can find $\cos$ of this angle by taking the dot product of those two complex numbers and dividing by their magnitudes. The vectors are $\Bigl\langle 4, 4\sqrt{15}\Bigr\rangle$ and $\Bigl\langle 2, 2\sqrt{3}\Bigr\rangle,$ so their dot product is 8 + $24\sqrt{5}.$ Dividing by the magnitudes yields: $\dfrac{8+24\sqrt{5}}{4 \cdot 16} = \dfrac{1 + 3\sqrt{5}}{8}.$ This is $\cos 2\theta,$ and recall the identity $\cos 2\theta = 1 - 2\sin^2 \theta.$ This means that $\sin^2 \theta = \dfrac{7 - 3\sqrt{5}}{16},$ so $\sin \theta = \dfrac{\sqrt{7- 3\sqrt{5}}}{4}.$ Now, notice that $\sqrt{7- 3\sqrt{5}} = \dfrac{3\sqrt{2}-\sqrt{10}}{2} (w$hich is not too hard to discover) so $\sin \theta = \dfrac{3\sqrt{2}-\sqrt{10}}{8}.$ Finally, putting everything together yields: $2\cdot 4 \cdot \dfrac{3\sqrt{2}-\sqrt{10}}{8} = 3\sqrt{2} - \sqrt{10}$ as the area of the parallelogram found by treating two of the solutions as vectors. However, drawing a picture out shows that we actually want twice this (each fourth of the parallelogram from the problem is one half of the parallelogram whose area was found above) so the desired area is actually $6\sqrt{2} - 2\sqrt{10}.$ Then, the answer is $\boxed{\textbf{(A) } 20}.$ ~Aathreyakadambi
## Solution 5 (Shoelace, Similar to Solution 1)
Let z = x+yi. Then, z^2 = x^2-y^2 + 2xyi. This means $x^2 - y^2 = 4,xy =2\sqrt15.$ We can quickly see $x=\sqrt{10}$ and $y=\sqrt{6}.$ Another solution would be $x=-\sqrt{10},y=-\sqrt{6}.$ From the other equation, our solutions are $x=\pm \sqrt{3}$ and $y =\pm 1.$ Then, our four coordinates are A($\sqrt{10}, \sqrt{6}), B(-\sqrt{10}, -\sqrt{6}), C(\sqrt{3}, 1), D(-\sqrt{3}, -1).$ Note that ABCD isn't a convex parallelogram, so we'll use ACBD. Applying shoelace theorem, we get $6\sqrt{2} - 2\sqrt{10},$ which is $\boxed{\textbf{(A) } 20}.$
## Video Solution by Richard Rusczyk
https://artofproblemsolving.com/videos/amc/2018amc12a/472 ~ dolphin7
