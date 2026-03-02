# 2021 AMC 12B Problem 14

## Problem
Let ABCD be a rectangle and let $\overline{DM}$ be a segment perpendicular to the plane of ABCD. Suppose that $\overline{DM}$ has integer length, and the lengths of $\overline{MA},\overline{MC},$ and $\overline{MB}$ are consecutive odd positive integers (in this order). What is the volume of pyramid MABCD?

$\textbf{(A) }24\sqrt5 \qquad \textbf{(B) }60 \qquad \textbf{(C) }28\sqrt5\qquad \textbf{(D) }66 \qquad \textbf{(E) }8\sqrt{70}$
## Solution 1
Let MA=a and MD=d. It follows that MC=$a+2$ and MB=$a+4$.

As shown below, note that $\triangle MAD$ and $\triangle MBC$ are both right triangles.

> [Asymptote diagram - not rendered in Markdown]

```asy
size(300); import graph3; import solids; currentprojection=orthographic((0.5,-0.25,-0.5)); triple A, B, C, D, M; A = (-2sqrt(10),0,0); B = (-2sqrt(10),-6sqrt(2),0); C = (0,-6sqrt(2),0); D = (0,0,0); M = (0,0,3); draw(surface(M--A--D--cycle),yellow); draw(surface(M--B--C--cycle),yellow); draw(D--A--B--C^^A--M^^B--M^^C--M^^D--M); draw(C--D,dashed); dot(A^^B^^C^^D^^M,linewidth(4.5)); label("$A$",A,2*dir(A-B)); label("$B$",B,2*dir(B-A)); label("$C$",C,2*dir(C-D)); label("$D$",D,2*dir(D-C)); label("$M$",M,2*dir((1,1,0))); label("$a$",midpoint(M--A),2*dir((-1,-1,0)),red); label("$d$",midpoint(M--D),2*dir((1,1,0)),red); label("$a+2$",midpoint(M--C),2*dir((1,-1,0)),red); label("$a+4$",midpoint(M--B),2*dir((-1,1,0)),red);
```

By the Pythagorean Theorem, we have

$$
\begin{alignat*}{6} AD^2 &= MA^2 - MD^2 &&= a^2 - d^2, \\ BC^2 &= MB^2 - MC^2 &&= (a+4)^2 - (a+2)^2. \end{alignat*}
$$

Since AD=BC in rectangle ABCD, we equate the expressions for $AD^2$ and $BC^2,$ then rearrange and factor:

$$
\begin{align*} a^2 - d^2 &= (a+4)^2 - (a+2)^2 \\ a^2 - d^2 &= 4a + 12 \\ a^2 - 4a - d^2 &= 12 \\ (a-2)^2 - d^2 &= 16 \\ (a+d-2)(a-d-2) &= 16. \end{align*}
$$

As a+$d-2$ and a-$d-2$ have the same parity, we get a+$d-2=8$ and a-$d-2=2$, from which (a,d)=(7,3).

Applying the Pythagorean Theorem to right $\triangle MAD$ and right $\triangle MCD,$ we obtain AD=$2\sqrt{10}$ and CD=$6\sqrt2,$ respectively.

Let the brackets denote areas. Together, the volume of pyramid MABCD is $\frac13\cdot$ [ABCD]$\cdot MD = \frac13\cdot (AD\cdot CD)\cdot MD = \boxed{\textbf{(A) }24\sqrt5}.$
*~Lopkiloinm ~MRENTHUSIASM*
## Solution 2
Let AD=b, CD=a, MD=x, MC=t. It follows that MA=$t-2$ and MB=$t+2$.

We have three equations:

$$
\begin{align*} a^2 + x^2 &= t^2, \\ a^2 + b^2 + x^2 &= t^2 + 4t + 4, \\ b^2 + x^2 &= t^2 - 4t + 4. \end{align*}
$$

Substituting the first and third equations into the second equation, we get:

$$
\begin{align*} t^2 - 8t - x^2 &= 0 \\ (t-4)^2 - x^2 &= 16 \\ (t-4-x)(t-4+x) &= 16. \end{align*}
$$

Therefore, we have $t = 9$ and $x = 3$.

Solving for other values, we get b = $2\sqrt{10},$ a = $6\sqrt{2}.$
The volume is then $\frac{1}{3}$ abx = $\boxed{\textbf{(A) }24\sqrt5}.$

*~jamess2022 (burntTacos)*
## Solution 3
First and foremost, the diagram must be drawn.

> [Asymptote diagram - not rendered in Markdown]

```asy
import graph; size(250); pair A = (0,0); pair B = (4.5,0); pair C = (6,1.1); pair D = (1.5,1.1); pair M = (1.5,3.45); draw(A--B); draw(C--B); draw(A--D, dashed); draw(C--D, dashed); draw(M--A); draw(M--B); draw(M--C); draw(M--D, dashed); draw((1.5,1.3)--(1.7,1.3)--(1.7,1.1)); dot(A,linewidth(4.5)); dot(B,linewidth(4.5)); dot(C,linewidth(4.5)); dot(D,linewidth(4.5)); dot(M,linewidth(4.5)); label("$A$", A, W); label("$B$", B, SE); label("$C$", C, E); label("$D$", D, NW); label("$M$", M, N); label("$x$", midpoint(M--A), NW, red); label("$x+4$", midpoint(M--B), SE, red); label("$x+2$", midpoint(M--C), NE, red); label("$a$", midpoint(A--D), W, red); label("$b$", midpoint(A--B), S, red); label("$I$", midpoint(M--D), E, red);
```

With the diagram, an impulse to utilize Pythagorean theorem is created. Thereby, the shaded right triangles may be used.

> [Asymptote diagram - not rendered in Markdown]

```asy
import graph; size(250); pair A = (0,0); pair B = (4.5,0); pair C = (6,1.1); pair D = (1.5,1.1); pair M = (1.5,3.45); draw(A--B); draw(C--B); draw(A--D, dashed); draw(C--D, dashed); draw(D--B, dashed); draw(M--A); draw(M--B); draw(M--C); draw(M--D, dashed); draw(M--A--D--cycle, blue); draw(M--B--D--cycle, green); draw(M--C--D--cycle, red); draw((1.5,1.3)--(1.7,1.3)--(1.7,1.1)); dot(A,linewidth(4.5)); dot(B,linewidth(4.5)); dot(C,linewidth(4.5)); dot(D,linewidth(4.5)); dot(M,linewidth(4.5)); label("$A$", A, W); label("$B$", B, SE); label("$C$", C, E); label("$D$", D, NW); label("$M$", M, N); label("$x$", midpoint(M--A), NW, red); label("$x+4$", midpoint(M--B), SE, red); label("$x+2$", midpoint(M--C), NE, red); label("$a$", midpoint(A--D), W, red); label("$b$", midpoint(A--B), S, red); label("$I$", midpoint(M--D), E, red);
```


The following equations could be obtained from Pythagorean Theorem.

$$
\begin{align*} I^2+a^2&=x^2 \\ I^2+b^2&=(x+2)^2 \\ I^2+a^2+b^2&=(x+4)^2 \\ \end{align*}
$$

Because x and I are integers, writing an equation in terms of only x and I may be beneficial for trial and error.

$$
\begin{align*} x^2+(x+2)^2&=(x+4)^2+I^2 \\ 2x^2+4x+4&=x^2+8x+16+I^2 \\ x^2-4x-12&=I^2 \\ (x-6)(x+2)&=I^2 \end{align*}
$$

$x=7$ seems valid since I=3 when $x=7$. Therefore, when $x=7, a=2\sqrt{10}$ and $b=6\sqrt{2}.$ We could double check that $40+72+9=11^2$. Thereby,

$$\frac{a\cdot b\cdot I}{3}=\frac{2\sqrt{10}\cdot6\sqrt{2}\cdot3}{3}=\boxed{\textbf{(A) }24\sqrt5}.$$


*~MaPhyCom*
## Video Solution (Fast! Just 4 min!)
https://youtu.be/Bo2EvRZdRnA

*~_Education, the Study of Everything_*
## Video Solution by Hawk Math
https://www.youtube.com/watch?v=p4iCAZRUESs
## Video Solution by OmegaLearn (Pythagorean Theorem and Volume of Pyramid)
https://youtu.be/4_Oqp_ECLRw

*~pi_is_3.14*
## See Also
