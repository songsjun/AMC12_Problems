# 2004 AMC 12A Problem 19

> This problem is the same as [2004 AMC 12A #19](https://artofproblemsolving.com/wiki/index.php/2004_AMC_12A_Problems) and [2004 AMC 10A #23](https://artofproblemsolving.com/wiki/index.php/2004_AMC_10A_Problems).
## Problem 19
Circles A, B and C are externally tangent to each other, and internally tangent to circle D. Circles B and C are congruent. Circle A has radius 1 and passes through the center of D. What is the radius of circle B?


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(15mm); pair A=(-1,0),B=(2/3,8/9),C=(2/3,-8/9),D=(0,0); draw(Circle(D,2)); draw(Circle(A,1)); draw(Circle(B,8/9)); draw(Circle(C,8/9)); label("$A$", A); label("$B$", B); label("$C$", C); label("$D$", (-1.2,1.8));
```


$$\text{(A) } \frac23 \qquad \text{(B) } \frac {\sqrt3}{2} \qquad \text{(C) } \frac78 \qquad \text{(D) } \frac89 \qquad \text{(E) } \frac {1 + \sqrt3}{3}$$

## Video solution by Punxsutawney Phil (Private link)
https://www.youtube.com/watch?v=4-lbEZkFJdc
## Solution 1
> [Asymptote diagram - not rendered in Markdown]

```asy
import graph; size(400); defaultpen(fontsize(10)); pair OA=(-1,0),OB=(2/3,8/9),OC=(2/3,-8/9),OD=(0,0),E=(2/3,0); real $t = 2.5$; pair OA1=(-2+2*t,0),OB1=(4/3+2*t,16/9),OC1=(4/3+2*t,-16/9),OD1=(0+2*t,0),E1=(4/3+2*t,0); draw(Circle(OD,2)); draw(Circle(OA,1)); draw(Circle(OB,8/9)); draw(Circle(OC,8/9)); draw(OA--OB--OC--cycle); draw(OD--OB--OB+(OB-OD)*4/5); draw(OA--E); label("$O_{A}$",OA,(-1,0)); label("$O_{B}$",OB,(-1,1)); label("$O_{C}$",OC,(-1,-1)); label("$O_{D}$",OD,(-1,-1)); label("$E$",E,(0.5,-1)); label("$r$",OB+(OB-OD)*2/5,(-0.5,1)); label("$r$",(1*OA+3*OB)/4,(-0.5,1)); dot(OA^^OB^^OC^^OD^^E); draw(OA1--OB1--OC1--cycle); draw(OD1--OB1); draw(OA1--E1); label("$O_{A}$",OA1,(-1,0)); label("$O_{B}$",OB1,(1,1)); label("$O_{C}$",OC1,(1,-1)); label("$O_{D}$",OD1,(0,-1)); label("$E$",E1,(1,0)); label("$1+r$",(OA1+OB1)/2,(-0.5,1)); label("$r$",(E1+OB1)/2,(1,0)); label("$r$",(E1+OC1)/2,(1,0)); label("$2-r$",(OB1+OD1)/2,(-1,0)); label("$1$",(OA1+OD1)/2,(0,-1)); label("$x$",(E1+OD1)/2,(0,-1)); dot(OA1^^OB1^^OC1^^OD1^^E1);
```


Let $O_{i}$ be the center of circle i for all i $\in\{A,B,C,D\}$ and let E be the tangent point of B,C. Since the radius of D is the diameter of A, the radius of D is 2.

Let the radius of B,C be r and let $O_{D}$E = x. If we connect $O_{A}$,$O_{B}$,$O_{C}$, we get an [isosceles triangle](https://artofproblemsolving.com/wiki/index.php/isosceles_triangle) with lengths 1 + r, $2r$.

Then right triangle $O_{D}O_{B}O_{E}$ has legs r, x and [hypotenuse](https://artofproblemsolving.com/wiki/index.php/hypotenuse) 2-r. Solving for x, we get $x^2 = (2-r)^2 - $r^2 $\Longrightarrowx =\sqrt{4-4r}.$

Also, right triangle $O_{A}O_{B}O_{E}$ has legs r, 1+x, and hypotenuse 1+r. Solving,


$$
\begin{eqnarray*} r^2 + (1+\sqrt{4-4r})^2 &=& (1+r)^2\\ 1+4-4r+2\sqrt{4-4r}&=& 2r + 1\\ 1-r &=& \left(\frac{6r-4}{4}\right)^2\\ \frac{9}{4}r^2-2r&=& 0\\ r &=& \frac 89 \end{eqnarray*}
$$


So the answer is $\boxed{\mathrm{(D)}\ \frac{8}{9}}.$
## Solution 2
> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(15mm); pair A=(0,1),B=(-8/9,-2/3),C=(8/9,-2/3),D=(0,0), E=(0,-2/3); draw(Circle(D,2)); draw(Circle(A,1)); draw(Circle(B,8/9)); draw(Circle(C,8/9)); draw(A--B--C--A); draw(B--D--C); draw(A--E); dot(A);dot(B);dot(C);dot(D);dot(E); label("$D$", D,NW); label("$A$", A,N); label("$B$", B,W); label("$C$", C,E); label("$E$", E,SE); label("$1$",(-.4,.7)); label("$1$",(0,0.5),W); label("$r$", (-.8,-.1)); label("$r$", (-4/9,-2/3),S); label("$h$", (0,-1/3), W);
```


Note that BD= 2-r since D is the center of the larger circle of radius 2. Using the Pythagorean Theorem on $\triangle BDE,$


$$
\begin{align*} r^2 + h^2 &= (2-r)^2 \\ r^2 + h^2 &= 4 - 4r + r^2 \\ h^2 &= 4 - 4r \\ h &= 2\sqrt{1-r} \end{align*}
$$


Now using the [Pythagorean Theorem](https://artofproblemsolving.com/wiki/index.php/Pythagorean_Theorem) on $\triangle BAE,$


$$
\begin{align*} r^2 + (h+1)^2 &= (r+1)^2 \\ r^2 + h^2 + 2h + 1 &= r^2 + 2r + 1 \\ h^2 + 2h &= 2r \end{align*}
$$


Substituting h,


$$
\begin{align*} (4-4r) + 4\sqrt{1-r} &= 2r \\ 4\sqrt{1-r} &= 6r - 4 \\ 16-16r &= 36r^2 - 48r + 16 \\ 0 &= 36r^2 - 32r \\ r &= \frac{32}{36} = \frac{8}{9} \Longrightarrow \qquad \textbf{(D)} \end{align*}
$$

## Solution 3
We can apply [Descartes' Circle Formula](https://artofproblemsolving.com/wiki/index.php/Descartes'_Circle_Formula).

The four circles have curvatures $-\frac{1}{2}, 1, \frac{1}{r},$ and $\frac{1}{r}.$

We have $2(($-\frac{1}{2})^2+$1^2+\frac{1}{r^2}+\frac{1}{r^2})=(-\frac{1}{2}+1+\frac{1}{r}+\frac{1}{r})^2$

Simplifying, we get $\frac{10}{4}+\frac{4}{r^2}=\frac{1}{4}+\frac{2}{r}+\frac{4}{r^2}$

$$\frac{2}{r}=\frac{9}{4}$$

$$r=\frac{8}{9} \Longrightarrow \qquad \textbf{(D)}$$
## See Also
