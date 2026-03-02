# 2021 AMC 12A Problem 21

## Problem
The five solutions to the equation$(z-1)(z^2+2z+4)(z^2+4z+6)=0$ may be written in the form $x_k+y_ki$ for $1\lek\le 5,$ where $x_k$ and $y_k$ are real. Let $\mathcal E$ be the unique ellipse that passes through the points $(x_1,y_1),(x_2,y_2),(x_3,y_3),(x_4,y_4)$, and $(x_5,y_5)$. The eccentricity of $\mathcal E$ can be written in the form $\sqrt{\frac mn},$ where m and n are relatively prime positive integers. What is m+n? (Recall that the eccentricity of an ellipse $\mathcal E$ is the ratio $\frac$ ca, where $2a$ is the length of the major axis of $\mathcal E$ and $2c$ is the is the distance between its two foci.)

$\textbf{(A) }7 \qquad \textbf{(B) }9 \qquad \textbf{(C) }11 \qquad \textbf{(D) }13\qquad \textbf{(E) }15$
## Solution 1 (Perpendicular Bisectors)
The solutions to this equation are $z = 1, z = -1 \pmi\sqrt 3,$ and $z =-2\pmi\sqrt 2.$ Consider the five points (1,0), $\left(-1,\pm\sqrt 3\right),$ and $\left(-2,\pm\sqrt 2\right)$; these are the five points which lie on $\mathcal E.$ Note that since these five points are symmetric about the x-axis, so must $\mathcal E.$

Now let r=b/a denote the ratio of the length of the minor axis of $\mathcal E$ to the length of its major axis. Remark that if we perform a transformation of the plane which scales every x-coordinate by a factor of r, $\mathcal E$ is sent to a circle $\mathcal E$'. Thus, the problem is equivalent to finding the value of r such that (r,0), $\left(-r,\pm\sqrt 3\right),$ and $\left(-2r,\pm\sqrt 2\right)$ all lie on a common circle; equivalently, it suffices to determine the value of r such that the circumcenter of the triangle formed by the points $P_1 = (r,0), P_2=\left(-r,\sqrt 3\right),$ and $P_3=\left(-2r,\sqrt 2\right)$ lies on the x-axis.

Recall that the circumcenter of a triangle ABC is the intersection point of the perpendicular bisectors of its three sides. The equations of the perpendicular bisectors of the segments $\overline{P_1P_2}$ and $\overline{P_1P_3}arey =\tfrac{\sqrt 3}2 + \tfrac{2r}{\sqrt 3}x\qquad\text{and}\qquady =\tfrac{\sqrt 2}2 + \tfrac{3r}{\sqrt 2}\left(x + \tfracr2\right)$respectively. These two lines have different slopes for $r\neq 0,$ so indeed they will intersect at some point $(x_0,y_0)$; we want $y_0 = 0$. Plugging $y = 0$ into the first equation yields $x =-\tfrac{3}{4r},$ and so plugging $y=0$ into the second equation and simplifying yields$-\tfrac{1}{3r} =$ x + $\tfracr2 =-\tfrac{3}{4r} + \tfrac{r}{2}.$Solving yields $r=\sqrt{\tfrac 56}.$

Finally, recall that the lengths a, b, and c (where c is the distance between the foci of $\mathcal E)$ satisfy c = $\sqrt{a^2 - b^2}.$ Thus the eccentricity of $\mathcal E$ is $\tfrac$ ca = $\sqrt{1 - \left(\tfrac ba\right)^2} = \sqrt{\tfrac 16}$ and the requested answer is $\boxed{\textbf{(A) } 7}.$
## Solution 2 (Three Variables, Three Equations)
Completing the square in the original equation, we have ($z-1)\left((z+1)^2+3\right)\left((z+2)^2+2\right)=0,$ from which $z=1,-1\pm\sqrt{3}$i,-$2\pm\sqrt{2}$i.

Now, we will find the equation of an ellipse $\mathcal E$ that passes through (1,0),$\left(-1,\pm\sqrt3\right),$ and $\left(-2,\pm\sqrt2\right)$ in the xy-plane. By symmetry, the center of $\mathcal E$ must be on the x-axis.

The formula of $\mathcal E$ is $\frac{(x-h)^2}{a^2}+\frac{y^2}{b^2}=1, \hspace{44.5mm} ($\bigstar) with the center (h,0) and the axes' lengths $2a$ and $2b$.

Plugging the points (1,0),$\left(-1,\sqrt3\right),$ and $\left(-2,\sqrt2\right)$ into (\bigstar), respectively, we have the following system of equations:

$$
\begin{align*} \frac{(1-h)^2}{a^2}&=1, \\ \frac{(-1-h)^2}{a^2}+\frac{{\sqrt3}^2}{b^2}&=1, \\ \frac{(-2-h)^2}{a^2}+\frac{{\sqrt2}^2}{b^2}&=1. \end{align*}
$$

Since t^2=(-t)^2 holds for all real numbers t, we clear fractions and simplify:

$$
\begin{align*} (1-h)^2&=a^2, \hspace{30.25mm} &(1)\\ b^2(1+h)^2 + 3a^2 &= a^2b^2, &(2)\\ b^2(2+h)^2 + 2a^2 &= a^2b^2. &(3) \end{align*}
$$

Applying the Transitive Property to (2) and (3), we isolate $a^2$:

$$
\begin{align*} b^2(1+h)^2 + 3a^2 &= b^2(2+h)^2 + 2a^2 \\ a^2 &= b^2\left((2+h)^2-(1+h)^2\right) \\ a^2 &= b^2(2h+3). \hspace{26.75mm} (*) \end{align*}
$$

Substituting (1) and (*) into (2), we solve for h:

$$
\begin{align*} b^2(1+h)^2 + 3\underbrace{b^2(2h+3)}_{\text{by }(*)} &= \underbrace{(1-h)^2}_{\text{by }(1)}b^2 \\ (1+h)^2+3(2h+3)&=(1-h)^2 \\ 1+2h+h^2+6h+9&=1-2h+h^2 \\ 10h&=-9 \\ h&=-\frac{9}{10}. \end{align*}
$$

Substituting this into (1), we get $a^2=\frac{361}{100}.$

Substituting the current results into (*), we get $b^2=\frac{361}{120}.$

Finally, we obtain
$$c^2 = a^2-b^2 = 361\left(\frac{1}{100}-\frac{1}{120}\right) = \frac{361}{600},$$
from which $\frac{c}{a}=\sqrt{\frac{c^2}{a^2}}=\sqrt{\frac{361/600}{361/100}}=\sqrt{\frac 16}.$
The answer is $1+6=\boxed{\textbf{(A) } 7}.$

The graph of $\mathcal E$ is shown below. Note that the foci are at ($h\pm$ c,0)=$\left(-\frac{9}{10}\pm\frac{19\sqrt6}{60},0\right),$ as shown in the blue points.

> [Asymptote diagram - not rendered in Markdown]

```asy
/* Made by MRENTHUSIASM */ size(220); int xMin = -4; int xMax $= 2$; int yMin = -3; int yMax $= 3$; //Draws the horizontal gridlines void horizontalLines() { for (int i = yMin+1; i < yMax; ++i) { draw((xMin,i)--(xMax,i), mediumgray+linewidth(0.4)); } } //Draws the vertical gridlines void verticalLines() { for (int i = xMin+1; i < xMax; ++i) { draw((i,yMin)--(i,yMax), mediumgray+linewidth(0.4)); } } //Draws the horizontal ticks void horizontalTicks() { for (int i = yMin+1; i < yMax; ++i) { draw((-1/8,i)--(1/8,i), black+linewidth(1)); } } //Draws the vertical ticks void verticalTicks() { for (int i = xMin+1; i < xMax; ++i) { draw((i,-1/8)--(i,1/8), black+linewidth(1)); } } horizontalLines(); verticalLines(); horizontalTicks(); verticalTicks(); draw((xMin,0)--(xMax,0),black+linewidth(1.5),EndArrow(5)); draw((0,yMin)--(0,yMax),black+linewidth(1.5),EndArrow(5)); label("$x$",(xMax,0),(2,0)); label("$y$",(0,yMax),(0,2)); draw(ellipse((-9/10,0),19/10,19/sqrt(120)),red); pair A = (-9/10,0); pair B = (1,0); pair C = (-1,sqrt(3)); pair D = (-1,-sqrt(3)); pair E = (-2,sqrt(2)); pair F = (-2,-sqrt(2)); pair G = (-9/10+19/sqrt(600),0); pair H = (-9/10-19/sqrt(600),0); dot(A,red+linewidth(4.5)); dot(B,red+linewidth(4.5)); dot(C,red+linewidth(4.5)); dot(D,red+linewidth(4.5)); dot(E,red+linewidth(4.5)); dot(F,red+linewidth(4.5)); dot(G,blue+linewidth(4.5)); dot(H,blue+linewidth(4.5)); label("$\left(-\frac{9}{10},0\right)$",A,(0,-2),UnFill); label("$(1,0)$",B,(1.5,-2),UnFill); label("$\left(-1,\sqrt3\right)$",C,N,UnFill); label("$\left(-1,-\sqrt3\right)$",D,S,UnFill); label("$\left(-2,\sqrt2\right)$",E,NW,UnFill); label("$\left(-2,-\sqrt2\right)$",F,SW,UnFill);
```

*~MRENTHUSIASM*
## Solution 3 (Alternate Version of Solution 2)
Starting from this system of equations from Solution 2:

$$
\begin{align*} \frac{(1-h)^2}{a^2}&=1, \\ \frac{(-1-h)^2}{a^2}+\frac{{\sqrt3}^2}{b^2}&=1, \\ \frac{(-2-h)^2}{a^2}+\frac{{\sqrt2}^2}{b^2}&=1. \end{align*}
$$

Let A=$a^{-2}$ and B=$b^{-2}$. Therefore, the system can be rewritten as:

$$
\begin{align*} (h^2-2h+1)A&=1, &(1)\\ (h^2+2h+1)A+3B&=1, &(2)\\ (h^2+4h+4)A+2B&=1. &(3) \end{align*}
$$

Subtracting (1) from (2) and (3), we get
4hA+3B=0$\quad\text{and}\quad 3A-6$hA+3B=0.
Plugging the former into the latter and simplifying yields 6A=5B. Hence a^2:b^2=6:5. Since c^2=a^2-b^2, we get $a^2=6c^2$, so the eccentricity is $\fracca=\sqrt{\frac16}.$

Therefore, the answer is $1+6=\boxed{\textbf{(A) }7}.$

*~wzs26843545602*
## Solution 4 (Four Variables, Three Equations)
The five roots are 1,$-1+i\sqrt{3},-1-i\sqrt{3},-2+i\sqrt{2},-2-i\sqrt{2}.$

So, we express this conic in the form ax^2+by^2+cx+$z=0$. Note that this conic cannot have the ky term since the roots are symmetric about the x-axis.

Now we have equations

$$
\begin{align*} a+c+z&=0, \\ a+3b-c+z&=0, \\ 4a+2b-2c+z&=0, \end{align*}
$$

from which a:b:$c=5$:6:9.

So, the conic can be written in the form $5x^2+6y^2+9x=14$. If it is written in the form of $\frac{(x-m)^2}{r^2}+\frac{y^2}{s^2}=1,$ then $r^2:s^2=6$:5.

Therefore, the desired eccentricity is $\sqrt{\frac{\sqrt{6-5}}{6}}=\sqrt{\frac{1}{6}},$ and the answer is $1+6=\boxed{\textbf{(A) }7}.$

*~bluesoul*
## Solution 5 (Transformations)
After calculating the 5 points that lie on $\mathcal E,$ we try to find a transformation that sends $\mathcal E$ to the unit circle. Scaling about (1, 0) works, since (1, 0) is already on the unit circle and such a transformation will preserve the ellipse's symmetry about the x-axis. If $2a$ and $2b$ are the lengths of the major and minor axes, respectively, then the ellipse will be scaled by a factor of r := $\frac1$a in the x-dimension and s := $\frac1$b in the y-dimension.

The transformation then sends the points $\left(-1,\pm\sqrt 3\right)$ and $\left(-2,\pm\sqrt 2\right)$ to the points $\left(1-2r, \pms\sqrt 3\right)$ and $\left(1-3r, \pms\sqrt 2\right),$ respectively. These points are on the unit circle, so
(1-$2r)^2 + 3s^2 = $1 $\quad \text{and} \quad (1-3r)^2 + 2$$s^2 = 1.$
This yields $4r^2+$3$s^2 =4r\quad \text{and} \quad $$9r^2 +2s^2 =6r$, from which

$$
\begin{align*} 12r^2 + 9s^2 &= 18r^2 + 4s^2 \\ \frac{r^2}{s^2} &= \frac56. \end{align*}
$$

Recalling that r = $\frac1$a and s = $\frac1$b, this implies $\frac{b^2}{a^2} = \frac56.$ From this, we get
$$\frac{c^2}{a^2} = \frac{a^2-b^2}{a^2} = 1 - \frac{b^2}{a^2} = \frac{1}{6},$$
so $\frac$ ca = $\sqrt{\frac16},$ giving an answer of 1 + 6 = $\boxed{\textbf{(A) } 7}.$

*~building*
## Video Solution by OmegaLearn (Using Ellipse Properties & Quadratic)
https://youtu.be/eIYFQSeIRzM

*~pi_is_3.14*
## Video Solution by MRENTHUSIASM (English & Chinese)
https://www.youtube.com/watch?v=PQdz8IBAZig&t=8s

*~MRENTHUSIASM*
## Video Solution
https://youtu.be/zAIcLfye_Mc

*~MathProblemSolvingSkills.com*
## See also
