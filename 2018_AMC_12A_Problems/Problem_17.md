# 2018 AMC 12A Problem 17

> This problem is the same as [2018 AMC 10A #23](https://artofproblemsolving.com/wiki/index.php/2018_AMC_10A_Problems/Problem_23) and [2018 AMC 12A #17](https://artofproblemsolving.com/wiki/index.php/2018_AMC_12A_Problems/Problem_17).
## Problem
Farmer Pythagoras has a field in the shape of a right triangle. The right triangle's legs have lengths $3$ and $4$ units. In the corner where those sides meet at a right angle, he leaves a small unplanted square $S$ so that from the air it looks like the right angle symbol. The rest of the field is planted. The shortest distance from $S$ to the hypotenuse is $2$ units. What fraction of the field is planted?

<asy>
/* Edited by MRENTHUSIASM */

> [Asymptote diagram - not rendered in Markdown]

```asy
size(160);
pair A, B, C, D, F;
A = origin;
B = (4,0);
C = (0,3);
D = (2/7,2/7);
F = foot(D,B,C);
fill(A--(2/7,0)--D--(0,2/7)--cycle, lightgray);
draw(A--B--C--cycle);
draw((2/7,0)--D--(0,2/7));
label("$4$", midpoint(A--B), N);
label("$3$", midpoint(A--C), E);
label("$2$", midpoint(D--F), SE);
label("$S$", midpoint(A--D));
draw(D--F, dashed);
```

</asy>

$\textbf{(A) }   \frac{25}{27}   \qquad        \textbf{(B) }   \frac{26}{27}   \qquad    \textbf{(C) }   \frac{73}{75}   \qquad   \textbf{(D) } \frac{145}{147} \qquad  \textbf{(E) }   \frac{74}{75}$
## Solution 1 (Area Addition)
Note that the hypotenuse of the field is $5,$ and the area of the field is $6.$ Let $x$ be the side-length of square $S.$

We partition the field into a red triangle, a yellow triangle, and a green triangle, as shown below:
<asy>
/* Edited by MRENTHUSIASM */

> [Asymptote diagram - not rendered in Markdown]

```asy
size(180);
pair A, B, C, D, F;
A = origin;
B = (4,0);
C = (0,3);
D = (2/7,2/7);
F = foot(D,B,C);
fill(A--D--C--cycle, red);
fill(A--D--B--cycle, yellow);
fill(B--D--C--cycle, green);
draw(A--B--C--cycle);
label("$5$", midpoint(B--C), NE);
label("$4$", midpoint(A--B), S);
label("$3$", midpoint(A--C), W);
label("$2$", midpoint(D--F), SE);
label("$S$", midpoint(A--D));
label("$x$", midpoint((0,2/7)--D), N);
label("$x$", midpoint((2/7,0)--D), E);
draw((2/7,0)--D--(0,2/7));
draw(A--D^^B--D^^C--D, dashed);
draw(D--F, dashed);
```

</asy>
Let the brackets denote areas. By area addition, we set up an equation for $x:$


$$\begin{align*}
[$\text{Red Triangle}$]+[$\text{Yellow Triangle}$]+[$\text{Green Triangle}$]&=[$\text{Field}$] \\
$$\frac{3x}{2}+\frac{4x}{2}+\frac{5\cdot2}{2}&=6,$$
$\end{align*}$$$


from which $x=\frac27.$ Therefore, the answer is

$$\frac{[\text{Field}]-[S]}{[\text{Field}]}=\frac{6-x^2}{6}=\boxed{\textbf{(D) } \frac{145}{147}}.$$


*~MRENTHUSIASM*
## Solution 2 (Area Addition)
Let the square have side length $x$. Connect the upper-right vertex of square $S$ with the two vertices of the triangle's hypotenuse. This divides the triangle in several regions whose areas must add up to the area of the whole triangle, which is $6$.
<asy>
/* Edited by MRENTHUSIASM */

> [Asymptote diagram - not rendered in Markdown]

```asy
size(180);
pair A, B, C, D, F;
A = origin;
B = (4,0);
C = (0,3);
D = (2/7,2/7);
F = foot(D,B,C);
fill(A--(2/7,0)--D--(0,2/7)--cycle, lightgray);
draw(A--B--C--cycle);
label("$5$", midpoint(B--C), NE);
label("$4$", midpoint(A--B), S);
label("$3$", midpoint(A--C), W);
label("$2$", midpoint(D--F), SE);
label("$S$", midpoint(A--D));
label("$x$", midpoint((0,2/7)--D), N);
label("$x$", midpoint((2/7,0)--D), E);
draw((2/7,0)--D--(0,2/7));
draw(B--D^^C--D, dashed);
draw(D--F, dashed);
```

</asy>
Square $S$ has area $x^2$, and the two thin triangle regions have area $\dfrac{x(3-x)}{2}$ and $\dfrac{x(4-x)}{2}$. The final triangular region with the hypotenuse as its base and height $2$ has area $5$. Thus, we have

$$x^2+\dfrac{x(3-x)}{2}+\dfrac{x(4-x)}{2}+5=6.$$


Solving gives $x=\dfrac{2}{7}$. The area of $S$ is $\dfrac{4}{49}$ and the desired ratio is $\dfrac{6-\tfrac{4}{49}}{6}=\boxed{\textbf{(D) } \frac{145}{147}}$.

Alternatively, once you get $x=\frac{2}{7}$, you can avoid computation by noticing that there is a denominator of $7$, so the answer must have a factor of $7$ in the denominator, which only $\frac{145}{147}$ does.
## Solution 3 (Similar Triangles)
Let the square have side length $s$. If we were to extend the sides of the square further into the triangle until they intersect on point on the hypotenuse, we'd have a similar right triangle formed between the hypotenuse and the two new lines, and two smaller similar triangles that share a side of length $2$. Using the side-to-side ratios of these triangles, we can find that the length of the larger similar triangle is $\frac{5}{3}(2)=\frac{10}{3}$. Now, let's extend this larger similar right triangle to the left until it hits the side of length $3$. Now, the length is $\frac{10}{3}+s$, and using the ratios of the side lengths, the height is $\frac{3}{4}\left(\frac{10}{3}+s\right)=\frac{5}{2}+\frac{3s}{4}$. Looking at the diagram, if we add the height of this triangle to the side length of the square, we'd get $3$, so


$$\begin{align*}

$$
\frac{5}{2}+\frac{3s}{4}+s&=3 \\
\frac{5}{2}+\frac{7s}{4}&=3 \\
\frac{7s}{4}&=\frac{1}{2} \\
s&=\frac{2}{7}.
$$

$\end{align*}$$$


So, the area of the square is $\left(\frac{2}{7}\right)^2=\frac{4}{49}$.

Now comes the easy part--finding the ratio of the areas: $\frac{3\cdot 4 \cdot \frac{1}{2} -\frac{4}{49}}{3\cdot 4 \cdot \frac{1}{2}}=\frac{6-\frac{4}{49}}{6}=\frac{294-4}{294}=\frac{290}{294}=\boxed{\textbf{(D) } \frac{145}{147}}$.
## Solution 4 (Similar Triangles)
<asy>
/* Edited by MRENTHUSIASM */

> [Asymptote diagram - not rendered in Markdown]

```asy
size(180);
pair A, B, C, D, F;
A = origin;
B = (4,0);
C = (0,3);
D = (2/7,2/7);
F = foot(D,B,C);
fill(A--(2/7,0)--D--(0,2/7)--cycle, lightgray);
draw(A--B--C--cycle);
label("$4$", midpoint(A--B), S);
label("$3$", midpoint(A--C), W);
label("$2$", midpoint(D--F), SE);
label("$S$", midpoint(A--D));
label("$\ell$", midpoint((0,2/7)--D), N);
label("$\ell$", midpoint((2/7,0)--D), E);
label("$\ell$", midpoint((2/7,2/7+5/2)--(0,2/7+5/2)), S);
label("$\ell$", midpoint((2/7+10/3,2/7)--(2/7+10/3,0)), W);
label("$\frac{5}{2}$", midpoint((2/7,2/7+5/2)--D), E);
label("$\frac{10}{3}$", midpoint((2/7+10/3,2/7)--D), N);
draw((2/7,0)--D--(0,2/7));
draw((2/7,2/7+5/2)--D^^(2/7+10/3,2/7)--D, dashed);
draw((2/7,2/7+5/2)--(0,2/7+5/2)^^(2/7+10/3,2/7)--(2/7+10/3,0), dashed);
draw(D--F, dashed);
```

</asy>
On the diagram above, find two smaller triangles similar to the large one with side lengths $3$, $4$, and $5$; consequently, the segments with length $\frac{5}{2}$ and $\frac{10}{3}$.

With $\ell$ being the side length of the square, we need to find an expression for $\ell$. Using the hypotenuse, we can see that $\frac{3}{2}+\frac{8}{3}+\frac{5}{4}\ell+\frac{5}{3}\ell=5$. Simplifying, $\frac{35}{12}\ell=\frac{5}{6}$, or $\ell=\frac27$.

A different calculation would yield $\ell+\frac{3}{4}\ell+\frac{5}{2}=3$, so $\frac{7}{4}\ell=\frac{1}{2}$. In other words, $\ell=\frac{2}{7}$, while to check, $\ell+\frac{4}{3}\ell+\frac{10}{3}=4$. As such, $\frac{7}{3}\ell=\frac{2}{3}$, and $\ell=\frac{2}{7}$.

Finally, we get $A(\Square S)=\ell^2=\frac{4}{49}$, to finish. As a proportion of the triangle with area $6$, the answer would be $\frac{4}{49\cdot6}=1-\frac{2}{147}=\frac{145}{147}$, so $\boxed{\textbf{(D) } \frac{145}{147}}$ is correct.
## Solution 5 (Similar Triangles)
Let the side length of the square be $x$. First off, let us make a similar triangle with the segment of length $2$ and the top-right corner of $S$. Therefore, the longest side of the smaller triangle must be $2 \cdot \frac54 = \frac52$. We then do operations with that side in terms of $x$. We subtract $x$ from the bottom, and $\frac{3x}{4}$ from the top. That gives us the equation of $\frac{7x}{4} = \frac{5}{2}$. Solving,

$$12-7x = 10 \implies x = \frac{2}{7}.$$


Thus, $x^2 = \frac{4}{49}$, so the fraction of the triangle (area $6$) covered by the square is $\frac{2}{147}$. The answer is then $\boxed{\textbf{(D) } \frac{145}{147}}$.
## Solution 6 (Similar Triangles)
<asy>
/* Geogebra to Asymptote conversion, documentation at artofproblemsolving.com/Wiki go to User:Azjps/geogebra */

> [Asymptote diagram - not rendered in Markdown]

```asy
import graph; size(180);
real labelscalefactor = 1.5; /* changes label-to-point distance */
```

// pen dps = linewidth(0.5) + fontsize(10);

> [Asymptote diagram - not rendered in Markdown]

```asy
// defaultpen(dps); /* default pen style */
```

// pen dotstyle = black; /* point style */

> [Asymptote diagram - not rendered in Markdown]

```asy
real xmin = -1.6030465381283199, xmax = 7.095084767820557, ymin = -1.3624649422453508, ymax = 4.065350676871526;  /* image dimensions */
```


 /* draw figures */

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((0,0)--(0,3));
draw((0,0)--(4,0));
draw((4,0)--(0,3));
draw((0,0.2857142857142857)--(0.2857142857142857,0.2857142857142857));
draw((0.2857142857142857,0.2857142857142857)--(0.2857142857142857,0));
draw((0.07142857142857142,0)--(1.4857142857142858,1.885714285714286));
label("$A$",(0, 0),SW*labelscalefactor);
label("$B$",(4,0),SE*labelscalefactor);
label("$C$",(0, 3),N*labelscalefactor);
label("$D$",(0.2857142857142857,0),S*labelscalefactor);
label("$E$",(0.2857142857142857, 0.2857142857142857),E*labelscalefactor);
label("$F$",(0.0714285714, 0),S*labelscalefactor);
label("$G$", (1.49, 1.89), NE*labelscalefactor);
```

 /* dots and labels */
clip((xmin,ymin)--(xmin,ymax)--(xmax,ymax)--(xmax,ymin)--cycle);
 /* end of picture */
</asy>
Let $AD=x$. Note that $\triangle DEF$ is a $3{-}4{-}5$ triangle, so $EF=\frac{5}{4}x$ and $FD=\frac{3}{4}x$. $BF=BD+FD=4-x+\frac{3}{4}\frac{1}{4}x$. We know that $GE$ is $2$ from the problem so $GF=2+\frac{5}{4}x$. $\triangle FGB$ is also a $3{-}4{-}5$ triangle with $GF:BF=3:5$. We now have $\left(4-\frac{1}{4}\right)=5\left(2+\frac{5}{4}\right)$. Solving this equation, we get that $x=\frac{2}{7}$ so the area of $S$ is $\frac{4}{49}$. The area of the triangle is $\frac{3\cdot 4}{2}=6$ so the fraction of field that is unplanted is $\frac{\frac{4}{49}}{6}=\frac{2}{147}$. Thus, the fraction of the field that is planted is $\frac{2}{147}=\boxed{\textbf{(D) } \frac{145}{147}}$.

*~Heavytoothpaste*
## Solution 7 (Coordinate Geometry)
We use coordinate geometry. Let the right angle be at $(0,0)$ and the hypotenuse be the line $3x+4y = 12$ for $\le \le 3$. Denote the position of $S$ as $(s,s)$, and by the point to line distance formula, we know that


$$\begin{align*}
$$\frac{|3s+4s-12|}{5} &= 2 \\$$
|$7s-12$| &= 10
$\end{align*}$$$


Solving this, we get $s=\frac{22}{7}, \frac{2}{7}$. Obviously $s<\frac{22}{7}$, so $s = \frac{2}{7}$, and from here, the rest of the solution follows to get $\boxed{\textbf{(D) } \frac{145}{147}}$.
## Solution 8 (Coordinate Geometry)
Let the right angle be at $(0,0)$, the point $(x,x)$ be the far edge of the unplanted square and the hypotenuse be the line $y=-\frac{3}{4}x+3$. Since the line from $(x,x)$ to the hypotenuse is the shortest possible distance, we know this line, call it line $\l$, is perpendicular to the hypotenuse and therefore has a slope of $\frac{4}{3}$.

Since we know $m=\frac{4}{3}$ , we can see that the line rises by $\frac{8}{5}$ and moves to the right by $\frac{6}{5}$ to meet the hypotenuse. (Let $2 = 5x$ and the rise be $4x$ and the run be $3x$ and then solve.) Therefore, line $\l$ intersects the hypotenuse at the point $\left(x+\frac{6}{5}, \frac{8}{5}\right)$. Plugging into the equation for the hypotenuse we have $x=\frac{2}{7}$ , and after a bit of computation we get $\boxed{\textbf{(D) } \frac{145}{147}}$.
## Solution 9 (Pythagorean Theorem)
Let the side length of the square be $a$, and the lengths that the line from $S$ hits the hypotenuse be $x$ and $5-x$. Also, connect the outermost vertex of $S$ to the vertices that $S$ isn't connected to. Note that the line that hits the hypotenuse must create a right angle, since it is the shortest possible distance. This creates two pairs of right triangles that share the same hypotenuse. This means that we can set up a system of equations using the Pythagorean Theorem:


$$\begin{align*}

$$
a^2+(4-a)^2&=(5-x)^2+2^2, \\
a^2+(3-a)^2&=x^2+2^2.
$$

$\end{align*}$$$


After *some* algebra, we obtain $a=\frac{2}{7}$, which gives the answer $\boxed{\textbf{(D) } \frac{145}{147}}$.
## Solution 10 (Proportions)
We name <i><b>small triangle</b></i> the  triangle similar to given in which unplanted square $S$ is inscribed.
The height of given triangle is 2.4 units so similarity coefficient is $\frac {2.4 - 2}{2.4} = \frac {1}{6}$ , the  area is $\frac {1}{36}$ of total area.

The ratio of planted area in <i><b>small triangle</b></i> to the area of the square is $\frac {3}{8} + \frac {2}{3} = \frac {25}{24}.$

The fraction of planted area in <i><b>small triangle</b></i> is $\frac {25}{25+24} = \frac {25}{49}.$

Therefore, the fraction of the planted  field is $\frac {25}{49} \cdot  \frac {1}{36} + \frac {35}{36} = \boxed{\textbf{(D) } \frac{145}{147}}.$

**vladimir.shelomovskii@gmail.com, vvsss**
## Solution 11 (Bash)
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(240);
pair A, B, C, D, F, X, Y, P, Q, M, N;
```

A = origin; label(A, "$A$", SW);
B = (4,0); label(B, "$B$", S);
C = (0,3); label(C, "$C$", W);
D = (2/7,2/7); label(D, "$D$", NE);
F = foot(D,B,C); label(F, "$F$", NE);
X = (2/7,39/14); label(X, "$X$", NE, red);
Y = (76/21,2/7); label(Y, "$Y$", NE, red);
P = foot(X,A,C); label(P, "$P$", W, red);
Q = foot(Y,A,B); label(Q, "$Q$", S, red);
M = (2/7,0); label(M, "$M$", S);
N = (0,2/7); label(N, "$N$", W);


> [Asymptote diagram - not rendered in Markdown]

```asy
fill(A--(2/7,0)--D--(0,2/7)--cycle, lightgray);
draw(A--B--C--cycle);
draw((2/7,0)--D--(0,2/7));
label("$x$", midpoint(A--M), S);
label("$x$", midpoint(A--N), W);
label("$2$", midpoint(D--F), SE);
draw(D--F);
draw(D--X, red);
draw(D--Y, red);
draw(X--P, red);
draw(Y--Q, red);
```

</asy>

Denote $A,B,C$ to be the three vertices of the triangular field. Also denote $A,M,D,N$ to be the vertices of the square $S$. Let $X$ be on $BC$ such that $AC\parallel DX$ and $Y$ be on $BC$ such that $AB\parallel DY$. Let $P$ and $Q$ be the foot of the altitudes from $X$ to $AC$ and from $Y$ to $AB$ respectively.

Note that $\triangle ABC \sim \triangle DYX \sim \triangle PXC \sim \triangle QBY$. Thus, $PC = x \cdot \frac34$ and $QB = x \cdot \frac43$, making


$$\begin{align*}

$$
DX &= 3-x-\dfrac{3}{4}x = 3-\dfrac{7}{4}x, \\
MQ &= 4-x-\dfrac{4}{3}x = 4-\dfrac{7}{3}x.
$$

$\end{align*}$$$


Also from the similarity ratio is the fact that $CX = \frac54 x$ and BY $= \frac53 x$, making


$$XY = 5 - \dfrac{5}{4}x - \dfrac{5}{3}x = 5 - \dfrac{35}{12}x.$$


Computing the area of $\triangle XDY$ in two ways gives an equation for $x$:


$$\begin{align*}

$$
\left(3-\dfrac{7}{4}x\right)\left(4-\dfrac{7}{3}x\right) &= 2\cdot \left(5 - \dfrac{35}{12}x\right) \\
10-\dfrac{35}{6}x &= \dfrac{49}{12}x^2 - 14x + 12 \\
\dfrac{49}{12}x^2 - \dfrac{49}{6}x + 2 &= 0 \\
49x^2 - 98x + 24 &= 0 \\
x&=\dfrac{2}{7} \text{ or } \dfrac{12}{7}.
$$

$\end{align*}$$$


But $x=\dfrac{12}{7}$ is extraneous. Thus, the area of square $S = x^2 = \dfrac{4}{49}$, making the portion of the field that is planted being

$$1 - \dfrac{\tfrac{4}{49}}{6} = 1 - \dfrac{2}{147} = \boxed{\textbf{(D) } \frac{145}{147}}.$$


*~Solution by sml1809*
## Solution 12
Let the square have side length $x$. Note that when $x = \dfrac{12}{7}$, the square is inscribed and touching the hypotenuse. Denote $f(x)$ to be the minimum distance from the square to the hypotenuse. Notably, $f$ is linear with respect to $x$. $f(0) = \dfrac{12}{5}$, because it is simply the length of the hypotenuse's altitude. Similarly, $f(\dfrac{12}{7}) = 0$. We can find that $f(x) = \dfrac{12-7x}{5}$. Setting this equal to $2$, we get that $f(\dfrac{2}{7}) = 2$. Therefore, the side has side length $\dfrac27$, and has area $\dfrac{4}{49}$. So, the unshaded area is $1 - \dfrac{\frac{4}{49}}{6} = \boxed{\dfrac{145}{147}}$, or $(D)$. ~Puck_0
## Video Solution by Pi Academy (Fast and Easy with Area Addition)
https://youtu.be/Jdx74PGIgpw?si=kO6EGrKQQUkp22X1

*~Pi Academy*
## Video Solution (#21-#25)
https://youtube.com/playlist?list=PLpxy89D2tvVow8EoCSsNY3Y-2SwJly_SZ&si=aEJ3Ttjck10aCIUH
## Video Solution by Richard Rusczyk
https://www.youtube.com/watch?v=p9npzq4FY_Y

*~dolphin7*
## See Also
