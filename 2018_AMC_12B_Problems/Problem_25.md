# 2018 AMC 12B Problem 25

## Problem
Circles $\omega_1, \omega_2,$ and $\omega_3$ each have radius 4 and are placed in the plane so that each circle is externally tangent to the other two.  Points $P_1, P_2$, and $P_3$ lie on $\omega_1, \omega_2,$ and $\omega_3$ respectively such that $P_1P_2=P_2P_3=P_3P_1$ and line P_$iP_{i+1}$ is tangent to $\omega_i$ for each $i=1$,2,3, where $P_4=P_1$.  See the figure below.  The area of $\triangle P_1P_2P_3$ can be written in the form $\sqrt{a}+\sqrt{b}$ for positive integers a and b.  What is a+b?


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(12); pair A = (0, 8/sqrt(3)), B = rotate(-120)*A, C = rotate(120)*A; real theta = 41.5; pair P1 = rotate(theta)*(2+2*sqrt(7/3), 0), P2 = rotate(-120)*P1, P3 = rotate(120)*P1; filldraw(P1--P2--P3--cycle, gray(0.9)); draw(Circle(A, 4)); draw(Circle(B, 4)); draw(Circle(C, 4)); dot(P1); dot(P2); dot(P3); defaultpen(fontsize(10pt)); label("$P_1$", P1, E*1.5); label("$P_2$", P2, SW*1.5); label("$P_3$", P3, N); label("$\omega_1$", A, W*17); label("$\omega_2$", B, E*17); label("$\omega_3$", C, W*17);
```


$\textbf{(A) }546\qquad\textbf{(B) }548\qquad\textbf{(C) }550\qquad\textbf{(D) }552\qquad\textbf{(E) }554$
## Solution 1
Let $O_1$ and $O_2$ be the centers of $\omega_1$ and $\omega_2$ respectively and draw $O_1O_2, O_1P_1$, and $O_2P_2$. Note that $\angle{O_1P_1P_2}$ and $\angle{O_2P_2P_3}$ are both right. Furthermore, since $\triangle{P_1P_2P_3}$ is equilateral, $m\angle{P_1P_2P_3} = 60^\circ$ and $m\angle{O_2P_2P_1} = 30^\circ.$ Mark M as the base of the altitude from $O_2 to P_1P_2$. Since $\triangle P_2O_2M$ is a 30-60-90 triangle, $O_2M = 2$ and $P_2M=2\sqrt{3}.$ Also, since $O_1O_2 = 8$ and $O_1P_1 = 4$, we can find $P_1M=\sqrt{8^2 - (4 + 2)^2} = 2\sqrt{7}.$ Thus, $P_1P_2=P_1M + P_2M=2\sqrt{3} + 2\sqrt{7}.$ This makes $\left$[$P_1P_2P_3\right$] = $\frac{\sqrt 3}4\cdot\left(2\sqrt 3 + 2\sqrt 7\right)^2 = 10\sqrt 3 + 6\sqrt 7 = \sqrt{300} + \sqrt{252}.$  So, our answer is 252 + $300 =\boxed{\textbf{D) }552}.$

Note by diyarv:

A way to see that $P_1M = 2{\sqrt 7$} is through similar triangles. Call the intersection between $P_1M$ and $O_1O_2$ S. Since angles $\angle{O_1P_1S}$ and $\angle{O_2MS}$ are both right angles, and $\angle{P_1SO_1}$ and $\angle{MSO_2}$ are congruent, triangles $\triangle{P_1SO_1}$ and $\triangle{MSO_2}$ are similar by AA similarity. And, since $O_1P_1$ is 4 and $O_2M$ is 2, the common ratio is 2. Using the fact that $O_1S+SO_2 = 8$, we see that these lengths are $\frac{16}{3}$ and $\frac{8}{3}$ respectively. Using the Pythagorean theorem, we see that $P_1S$ and $SP_2$ are $\frac{2\sqrt{7}}{3}$ and $\frac{4\sqrt{7}}{3}$ respectively, giving us a sum of $2\sqrt{7}.$

A better note on why $P_1M=\sqrt{8^2 - (4 + 2)^2}$:

This is more easily seen by translating $O_1O_2$ so that $O_2$ is mapped to M and the resulting $O_1$’ remains collinear with the original $O_1$ and $P_1$. This forms a right triangle, with leg $O_$1’ P = $4+2 = 6$ and hypotenuse $O_$1’$O_2 = 8$. Therefore $P_1M=\sqrt{8^2 - (4 + 2)^2}$
## Solution 2
Let $O_i$ be the center of circle $\omega_i$ for $i=1$,2,3, and let K be the intersection of lines $O_1P_1$ and $O_2P_2$. Because $\angle P_1P_2P_3 = 60^\circ,$ it follows that $\triangle P_2KP_1$ is a 30-60-90 triangle. Let $x=P_1K$; then $P_2K = 2$x and $P_1P_2 = x \sqrt 3.$ The Law of Cosines in $\triangle O_1KO_2$ gives $8^2 =$ (x+4)^$2 + (2x-4)^2 - 2(x+4)(2x-4)\cos 60^\circ,w$hich simplifies to $3x^2-12x - 16 = 0$. The positive solution is $x = 2+\tfrac23\sqrt{21}.$ Then $P_1P_2=x\sqrt 3 = 2\sqrt 3 + 2\sqrt 7,$ and so the area of $\triangle P_1P_2P_3$ is $\frac{\sqrt 3}4\cdot\left(2\sqrt 3 + 2\sqrt 7\right)^2 = 10\sqrt 3 + 6\sqrt 7 = \sqrt{300} + \sqrt{252}.$ The requested sum is 300 + $252 =\boxed{552}.$
## Solution 3
Let $O_i$ be the center of circle $\omega_i$ for $i=1$,2,3. Let X be the centroid of $\triangle{O_1O_2O_3},$ which also happens to be the centroid of $\triangle{P_1P_2P_3}.$ Because $m\angle{O_1P_1P_2} = 90^\circ$ and $m\angle{O_1P_1X} = 30^\circ,m\angle{O_1P_1X} = 60^\circ. O_2M$ is 2/3 the height of  $\triangle{P_1P_2P_3},$ thus $O_2M$  is  $8*\sqrt{3}/3$.

Applying cosine law on $\triangle{O_1P_1X},$ one finds that $P_1X = 2+2*\sqrt{21}/3$. Multiplying by 3/2 to solve for the height of $\triangle{P_1P_2P_3},$ one gets 3 + $\sqrt{21}.$ Simply multiplying by $2/\sqrt{3}$ and then calculating the equilateral triangle's area, one would get the final result of $\sqrt{300} + \sqrt{252}.$

This makes the answer $252 + 300 = 552. \boxed{\textbf{D}.}$

*~AlbeePach~*
## Solution 4
> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(12); pair A = (0, 8/sqrt(3)), B = rotate(-120)*A, C = rotate(120)*A; real theta = 41.5; pair P1 = rotate(theta)*(2+2*sqrt(7/3), 0), P2 = rotate(-120)*P1, P3 = rotate(120)*P1; filldraw(P1--P2--P3--cycle, gray(0.9)); draw(Circle(A, 4)); draw(Circle(B, 4)); draw(Circle(C, 4)); dot(P1); dot(P2); dot(P3); defaultpen(fontsize(10pt)); label("$P_1$", P1, E*1.5); label("$P_2$", P2, SW*1.5); label("$P_3$", P3, N); label("$\omega_1$", A, W*30); label("$\omega_2$", B, E*17); label("$\omega_3$", C, W*17); label("$\Gamma$", A, W*15); draw(Circle(A,2),red); pair X=foot(A,P1,P3); dot(X,blue); draw(A--X,blue); label("$\sqrt{7}$", X--P3); label("$\sqrt{3}$",X--P1); label("$X$",X,dir(-80),blue);
```


First, note that because the $\angle P_1=\angle P_2=\angle P_3=\pi/3$, the arcs inside the shaded equilateral triangle are each $2\pi/3$. Also, the distances between the centers of any two of the 3 given circles are each 8.
Draw the circle $\Gamma$ concentric with $\omega_1$ with radius 2. Because the arc of $\omega_1$ inside said triangle is $2\pi/3, \Gamma$ touches $P_1P_3$, say at a point X. Thus, $P_1P_3$ is a common tangent of $\omega_3$ and $\Gamma,$ and it can be seen from inspection of the given diagram that the line is an common internal tangent.
The length of the common internal tangent segment $XP_3$ of $\Gamma$ and $\omega_3$ is then $\sqrt{8^2-(2+4)^2}=2\sqrt{7},$ and it is easily seen that XP_$1=4\sin \pi/3=2\sqrt{3}.$
Because $P_1P_3=2(\sqrt{3}+\sqrt{7}),$ the area of the shaded equilateral triangle is $\sqrt{3}(\sqrt{3}+\sqrt{7})^2=10\sqrt{3}+6\sqrt{7}.$ We get $\sqrt{300}+\sqrt{252}\Rightarrow\boxed{\textbf{(D) }552}.$

*~crazyeyemoody907*
## Solution 5 (Pure Coordinate Bash)
This seems like a coordinate bashable problem. To do this, we notice that it is easier to graph the equilateral triangle first, then the circles, rather than the other way around. Let's forget the lengths of the radius for a moment and focus instead on the ratio of the circles' radius to $\triangle P_1P_2P_3$'s side length.

WLOG let $P_1P_2 = 2$. Place triangle $P_1P_2P_3$ on the coordinate plane with $P_1(0,\sqrt3), P_2(1,0),$ and $P_3(-1,0)$. Let r be the radius of the circles.

Now, we find the coordinates of the centers of circles $\omega_1$ and $\omega_2.$ Since $\omega_2$ is tangent to the x-axis at (1,0), the center of $\omega_2$ is (1,r). Draw a right triangle with legs parallel to the x and y axes, and with hypotenuse as the segment from the center of $\omega_1 to P_1$. Since the slope of $\overline{P_1P_2}$ is $-\sqrt3,$ the slope of the hypotenuse is $\frac{1}{\sqrt{3}},$ so the right triangle is 30-60-90. It's easy to see that the center of $\omega_1$ is $\left(-\frac{r\sqrt{3}}{2}, \sqrt{3} - \frac{r}{2}\right).$

Since $\omega_1$ and $\omega_2$ are tangent, the distance between the centers is $2r$, so we have

$$
\sqrt{\left(1 + \frac{r\sqrt{3}}{2}\right)^2 + \left(\frac{3r}{2} - \sqrt{3}\right)^2} = 2r
\left(1 + \frac{r\sqrt{3}}{2}\right)^2 + \left(\frac{3r}{2} - \sqrt{3}\right)^2 = 4r^2
1 + r\sqrt{3} + \frac{3r^2}{4} + \frac{9r^2}{4} - 3r\sqrt{3} + 3 = 4r^2
4 - 2r\sqrt{3} + 3r^2 = 4r^2
r^2 + 2r\sqrt{3} - 4 = 0
$$

By the Quadratic Formula, r = $\frac{-2\sqrt{3} \pm \sqrt{12 + 16}}{2} = -\sqrt{3}\pm\sqrt{7}.$
We take the positive value to get the radius of the circle is $\sqrt{7} - \sqrt{3}.$

Therefore, the ratio of the radius to the side length of the equilateral triangle is $\sqrt{7} - \sqrt{3}$ : 2 = 4 : $\frac{8}{\sqrt{7} - \sqrt{3}} = $4 : 2(\sqrt{7} + \sqrt{3})$.$

The side length of the equilateral triangle is $2($\sqrt{7} + \sqrt{3})$,$ so its area is ($\sqrt{7} + \sqrt{3})^2\sqrt{3} = 10\sqrt{3} + 6\sqrt{7} = \sqrt{300} + \sqrt{252} \implies 300 + 252 = \boxed{\textbf{(D) }552}.$

*~rayfish*
## Solution 6 (Trignometry Bash)
Let $O_1, O_2$, and $O_3$ be the centers of $\omega_1, \omega_2,$ and $\omega_3$

Let $P_1P_2 = a, \angle O_2O_1P_1= \alpha$


$$[O_1P_1O_2P_2O_3P_3] = [P_1P_2P_3] + 3 \cdot [O_1P_1P_3] = [O_1O_2O_3] + 3 \cdot [O_1P_1O_2]$$


$$[P_1P_2P_3] + 3 \cdot [O_1P_1P_3] = \frac12 \cdot a \cdot \frac{ \sqrt{3} }{2} a + 3 \cdot \frac12 \cdot 4 \cdot a \cdot \sin 30^{\circ} = \frac{ \sqrt{3} }{4} a^2 + 3a$$


$$[O_1O_2O_3] + 3 \cdot [O_1P_1O_2] = \frac12 \cdot 8 \cdot \frac{ \sqrt{3} }{2} \cdot 8 + 3 \cdot \frac12 \cdot 4 \cdot 8 \cdot \sin \alpha = 16 \sqrt{3} + 48 \sin \alpha$$


$$\frac{ \sqrt{3} }{4} a^2 + 3a = 16 \sqrt{3} + 48 \sin \alpha$$

$$\sin \alpha = \frac{ \sqrt{3} }{192} a^2 + \frac{a}{16} - \frac{ \sqrt{3} }{3}$$

By the Law of Cosine from $\triangle O_2P_1P_2, O_2P_1^2 = a^2 + 4^2 - 2 \cdot$ a $\cdot 4 \cdot \cos 30^{\circ} =a^2 + 16 -4a\sqrt{3}$

By the Law of Cosine from $\triangle O_1O_2P_1, O_2P_1^2 = 4^2 + 8 ^ 2 - 2 \cdot 4 \cdot 8 \cdot \cos \alpha = 80 - 64 \cos \alpha$

$$a^2 + 16 - 4a \sqrt{3} = 80 - 64 \cos \alpha$$

$$\cos \alpha = -(\frac{a^2}{64} - \frac{ \sqrt{3} }{16} a - 1)$$

$$\because \sin^2 \alpha + \cos^2 \alpha = 1$$


$$\therefore (\frac{ \sqrt{3} }{192} a^2 + \frac{a}{16} - \frac{ \sqrt{3} }{3})^2 + (\frac{a^2}{64} - \frac{ \sqrt{3} }{16} a - 1)^2 = 1$$


$$[ \frac{1}{\sqrt{3}} (\frac{ a^2 }{64} + \frac{ \sqrt{3} }{16} a - 1)]^2 + (\frac{a^2}{64} - \frac{ \sqrt{3} }{16} a - 1)^2 = 1$$


$$(\frac{ a^2 }{64} + \frac{ \sqrt{3} }{16} a - 1)^2 + 3 \cdot (\frac{a^2}{64} - \frac{ \sqrt{3} }{16} a - 1)^2 = 3$$


$$(a^2 + 4 \sqrt{3} a - 64)^2 + 3 \cdot (a^2 - 4 \sqrt{3} a - 64)^2 = 3 \cdot 64^2$$


$$(a^2 - 64)^2 + 2 (a^2 - 64) \cdot 4 \sqrt{3} a + (4 \sqrt{3} a)^2 + 3(a^2 - 64)^2 - 6 (a^2 - 64) \cdot 4 \sqrt{3} a + 3(4 \sqrt{3} a)^2 = 3 \cdot 64^2$$


$$4 (a^2 - 64)^2 - 4 (a^2 - 64) \cdot 4 \sqrt{3} a + 192 a^2 - 3 \cdot 64^2 = 0$$

$$4 (a^2 - 64)(a^2 - 64 - 4 \sqrt{3} a) + 192(a^2 - 64) = 0$$

$$4 (a^2 - 64)(a^2 - 64 - 4 \sqrt{3} a + 48) = 0$$

$$(a^2 - 64)(a^2 - 4 \sqrt{3} a - 16) = 0$$

$$a^2 -64 = 0 \quad or \quad a^2 - 4 \sqrt{3} a - 16 = 0$$

If $a^2 =64,a= 8, P_1O_2^2 = 8^2 + 4^2 - 2 \cdot 8 \cdot 4 \cdot \cos 30^{\circ} = 80 - 32 \sqrt{3} < 16, P_1O_2 < 4,$ meaning that $P_1$ is inside the circle.

However, $P_1$ is not inside the circle.

$$So, \quad a^2 - 4 \sqrt{3} a - 16 = 0$$


$$a = \frac{ 4 \sqrt{3} + \sqrt{ (4 \sqrt{3})^2 - 4(-16) } }{2} = 2 \sqrt{3} + 2 \sqrt{7}$$


$$[P_1P_2P_3] = a^2 \cdot \frac{ \sqrt{3} }{4} = (2 \sqrt{3} + 2 \sqrt{7})^2 \cdot \frac{ \sqrt{3} }{4} = \sqrt{300} + \sqrt{252}$$


Therefore, the answer is 300 + 252 = $\boxed{\textbf{(D) } 552}.$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 7
> [Asymptote diagram - not rendered in Markdown]

```asy
import geometry; unitsize(12); pair A = (0, 8/sqrt(3)), B = rotate(-120)*A, C = rotate(120)*A; real theta = 41.5; pair P1 = rotate(theta)*(2+2*sqrt(7/3), 0), P2 = rotate(-120)*P1, P3 = rotate(120)*P1; filldraw(P1--P2--P3--cycle, gray(0.9)); draw(Circle(A, 4)); draw(Circle(B, 4)); draw(Circle(C, 4)); dot(P1); dot(P2); dot(P3); pair M = extension(P3, origin, P1, P2); pair H = extension(A, P1, origin, rotate(90) * M); dot(M ^^ H ^^ origin $^^ A)$; draw(H -- P1 ^^ P3 -- M, dashed); draw(A -- H -- origin -- cycle, red); markrightangle(A, H, origin, 0.2 * markangleradius(), red); defaultpen(fontsize(10pt)); label("$P_1$", P1, E*1.5); label("$P_2$", P2, SW*1.5); label("$P_3$", P3, N); label("$\omega_1$", A, W*17); label("$\omega_2$", B, E*17); label("$\omega_3$", C, W*17); label("$M$", M, SE); label("$H$", H, NE); label("$O_1$", A, N); label("$O$", origin, NE);
```


Suppose $P_1P_2$ = x, noticed that $OMP_1H$ is rectangle.

$$
OO_1 = \frac{O_1O_2}{\sqrt{3}} = \frac83\sqrt{3}
OH = P_1M = \frac{1}{2}P_1P_2 = \frac12 x
O_1H = O_1P_1 - HP_1 = O_1P_1 - OM = O_1P_1 - \frac{P_1P_2}{2\sqrt{3}} = 4 - \frac{\sqrt{3}}{6}x
$$

$\triangle O_1HO$ is right triangle, we can use Pythagorean theorem to establish an equation,

$$
OH^2 + O_1H^2 = OO_1^2
\left(\frac12 x\right)^2 + \left(4 - \frac{\sqrt{3}}{6}x\right)^2 = \left(\frac83\sqrt{3}\right)^2
x^2 - 4\sqrt{3}x - 16 = 0
x = 2\sqrt{3} + 2\sqrt{7}
$$

The side length of the equilateral triangle is $2($\sqrt{7} + \sqrt{3})$,$ so its area is ($\sqrt{7} + \sqrt{3})^2\sqrt{3} = 10\sqrt{3} + 6\sqrt{7} = \sqrt{300} + \sqrt{252} \implies 300 + 252 = \boxed{\textbf{(D) }552}.$

~[https://artofproblemsolving.com/wiki/index.php/User:Reda_mandymath reda_mandymath]
## Video Solution by MOP 2024
https://youtu.be/wINL0J76HYw

*~r00tsOfUnity*
## See Also
