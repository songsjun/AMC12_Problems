# 2020 AMC 12B Problem 18

> This problem is the same as [2020 AMC 10B #21](https://artofproblemsolving.com/wiki/index.php/2020_AMC_10B_Problems) and [2020 AMC 12B #18](https://artofproblemsolving.com/wiki/index.php/2020_AMC_12B_Problems).
## Problem
In square $ABCD$, points $E$ and $H$ lie on $\overline{AB}$ and $\overline{DA}$, respectively, so that $AE=AH.$ Points $F$ and $G$ lie on $\overline{BC}$ and $\overline{CD}$, respectively, and points $I$ and $J$ lie on $\overline{EH}$ so that $\overline{FI} \perp \overline{EH}$ and $\overline{GJ} \perp \overline{EH}$. See the figure below. Triangle $AEH$, quadrilateral $BFIE$, quadrilateral $DHJG$, and pentagon $FCGJI$ each has area $1.$ What is $FI^2$?

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
real x=2sqrt(2);
real y=2sqrt(16-8sqrt(2))-4+2sqrt(2);
real z=2sqrt(8-4sqrt(2));
pair A, B, C, D, E, F, G, H, I, J;
A = (0,0);
B = (4,0);
C = (4,4);
D = (0,4);
E = (x,0);
F = (4,y);
G = (y,4);
H = (0,x);
I = F + z * dir(225);
J = G + z * dir(225);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
draw(A--B--C--D--A);
draw(H--E);
draw(J--G^^F--I);
draw(rightanglemark(G, J, I), linewidth(.5));
draw(rightanglemark(F, I, E), linewidth(.5));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
dot("$A$", A, S);
dot("$B$", B, S);
dot("$C$", C, dir(90));
dot("$D$", D, dir(90));
dot("$E$", E, S);
dot("$F$", F, dir(0));
dot("$G$", G, N);
dot("$H$", H, W);
dot("$I$", I, SW);
dot("$J$", J, SW);
```


</asy>

$\textbf{(A) } \frac{7}{3} \qquad \textbf{(B) } 8-4\sqrt2 \qquad \textbf{(C) } 1+\sqrt2 \qquad \textbf{(D) } \frac{7}{4}\sqrt2 \qquad \textbf{(E) } 2\sqrt2$
## Solution 1
Since the total area is $4$, the side length of square $ABCD$ is $2$. We see that since triangle $HAE$ is a right isosceles triangle with area 1, we can determine sides $HA$ and $AE$ both to be $\sqrt{2}$. Now, consider extending $FB$ and $IE$ until they intersect. Let the point of intersection be $K$. We note that $EBK$ is also a right isosceles triangle with side $\sqrt{2}$ and find its area to be $\sqrt{2}$. Now, we notice that $FIK$ is also a right isosceles triangle (because $\angle EKB=45^\circ$) and find it's area to be $\frac{1}{2}FI^2$. This is also equal to $\sqrt{2}$ or $\sqrt{2}$. Since we are looking for $FI^2$, we want two times this. That gives $\boxed{\textbf{(B)}\ 8-4\sqrt{2}}$.~TLiu
## Solution 2
Draw the auxiliary line $AC$. Denote by $M$ the point it intersects with $HE$, and by $N$ the point it intersects with $GF$. Last, denote by $x$ the segment $FN$, and by $y$ the segment $FI$. We will find two equations for $x$ and $y$, and then solve for $y^2$.

Since the overall area of $ABCD$ is $4 \;\; \Longrightarrow \;\;  AB=2$, and $AC=2\sqrt{2}$. In addition, the area of $\bigtriangleup AME = \frac{1}{2} \;\; \Longrightarrow \;\; AM=1$.

The two equations for $x$ and $y$ are then:

$\bullet$ Length of $AC$: $1+y+x = 2\sqrt{2}  \;\; \Longrightarrow \;\; x = (2\sqrt{2}-1) - y$

$\bullet$ Area of CMIF: $\frac{1}{2}x^2+xy = \frac{1}{2}  \;\; \Longrightarrow \;\; x(x+2y)=1$.

Substituting the first into the second, yields
$\left[\left(2\sqrt{2}-1\right)-y\right]\cdot \left[\left(2\sqrt{2}-1\right)+y\right]=1$

Solving for $y^2$ gives $\boxed{\textbf{(B)}\ 8-4\sqrt{2}}$ ~DrB
## Solution 3
Plot a point $F'$ such that $F'I$ and $AB$ are parallel and extend line $FB$ to point $B'$ such that $FIB'F'$ forms a square. Extend line $AE$ to meet line $F'B'$ and point $E'$ is the intersection of the two. The area of this square is equivalent to $FI^2$. We see that the area of square $ABCD$ is $4$, meaning each side is of length 2. The area of the pentagon $EIFF'E'$ is $2$. Length $AE=\sqrt{2}$, thus $EB=2-\sqrt{2}$. Triangle $EB'E'$ is isosceles, and the area of this triangle is $\frac{1}{2}(4-2\sqrt{2})(2-\sqrt{2})=6-4\sqrt{2}$. Adding these two areas, we get

$$2+6-4\sqrt{2}=8-4\sqrt{2}\rightarrow \boxed{\textbf{(B)}\ 8-4\sqrt{2}}$$

. --OGBooger
## Solution 4 (HARD Calculation)
We can easily observe that the area of square $ABCD$ is 4 and its side length is 2 since all four regions that build up the square has area 1.
Extend $FI$ and let the intersection with $AB$ be $K$. Connect $AC$, and let the intersection of $AC$ and $HE$ be $L$.
Notice that since the area of triangle $AEH$ is 1 and $AE=AH$ , $AE=AH=\sqrt{2}$, therefore $BE=HD=2-\sqrt{2}$.
Let $CG=CF=m$, then $BF=DG=2-m$.
Also notice that $KB=2-m$, thus $KE=KB-BE=2-m-(\sqrt{2})=\sqrt{2}-m$.
Now use the condition that the area of quadrilateral $BFIE$ is 1, we can set up the following equation:
$\frac{1}{2}(2-m)^2-\frac{1}{4}(\sqrt{2}-m)^2=1$
We solve the equation and yield $m=\frac{8-2\sqrt{2}-\sqrt{64-32\sqrt{2}}}{2}$.
Now notice that
$FI=AC-AL-\frac{m}{\sqrt{2}}=2\sqrt{2}-1-\frac{\sqrt{2}}{2} \cdot \frac{8-2\sqrt{2}-\sqrt{64-32\sqrt{2}}}{2}$
$=2\sqrt{2}-1-\frac{8\sqrt{2}-4-\sqrt{128-64\sqrt2}}{4}$
$=\frac{\sqrt{128-64\sqrt{2}}}{4}$.
Hence $FI^2=\frac{128-64\sqrt{2}}{16}=8-4\sqrt{2}$.  -HarryW
## Solution 5 (Basically Same as Solution 3)
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
real x=2sqrt(2);
real y=2sqrt(16-8sqrt(2))-4+2sqrt(2);
real z=2sqrt(8-4sqrt(2));
real $k= 8-2$sqrt(2);
real l= 2sqrt(2)-4;
pair A, B, C, D, E, F, G, H, I, J, L, M, K;
A = (0,0);
B = (4,0);
C = (4,4);
D = (0,4);
E = (x,0);
F = (4,y);
G = (y,4);
H = (0,x);
I = F + z * dir(225);
L = (k,0);
M = F + z * dir(315);
K = (4,l);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
draw(A--B--C--D--A);
draw(H--E);
draw(J--G^^F--I);
draw(F--M);
draw(M--L);
draw(E--K,dashed+linewidth(.5));
draw(K--L,dashed+linewidth(.5));
draw(B--L);
draw(rightanglemark(G, J, I), linewidth(.5));
draw(rightanglemark(F, I, E), linewidth(.5));
draw(rightanglemark(F, M, L), linewidth(.5));
fill((4,0)--(k,0)--M--(4,y)--cycle, gray);
dot("$A$", A, S);
dot("$C$", C, dir(90));
dot("$D$", D, dir(90));
dot("$E$", E, S);
dot("$G$", G, N);
dot("$H$", H, W);
dot("$I$", I, SW);
dot("$J$", J, SW);
dot("$K$", K, S);
dot("$F(G)$", F, E);
dot("$H'$", L, S);
dot("$B(D)$", B, S);
```


</asy>
Easily, we can find that: quadrilateral $BFIE$ and $DHJG$ are congruent with each other, so we can move $DHJG$ to the shaded area ($F$ and $G$, $B$ and $D$ overlapping) to form a square $FIKJ'$ ($DG=FB$, $CG=FC$, ${\angle} CGF={\angle}CFG=45^{\circ}$ so ${\angle} IFJ'= 90^{\circ}$). Then we can solve $AH=AE=\sqrt{2}$, $EB=\sqrt{2}$, $EK=\sqrt{2}-2$.

$FI^2=\text{area of} \: BFIE+\text{area of} \:FJ'H'B+\text{area of} \:EH'K \\= 1 + 1 + \frac{1}{2}(2\sqrt{2}-2)^2=8-4\sqrt{2}\rightarrow \boxed{\textbf{(B)}\ 8-4\sqrt{2}}$

--Ryan Zhang @BRS
--Minor edit by WhySean38
## Solution 6
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
real x=2sqrt(2);
real y=2sqrt(16-8sqrt(2))-4+2sqrt(2);
real z=2sqrt(8-4sqrt(2));
pair A, B, C, D, E, F, G, H, I, J, K, L;
A = (0,0);
B = (4,0);
C = (4,4);
D = (0,4);
E = (x,0);
F = (4,y);
G = (y,4);
H = (0,x);
I = F + z * dir(225);
J = G + z * dir(225);
K = (4-x,4);
L = J + 1.68 * dir(45);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
draw(A--B--C--D--A);
draw(H--E);
draw(J--G^^F--I);
draw(H--K,dashed+linewidth(.5));
draw(L--K,dashed+linewidth(.5));
draw(rightanglemark(G, J, I), linewidth(.5));
draw(rightanglemark(F, I, E), linewidth(.5));
draw(rightanglemark(H, K, L), linewidth(.5));
draw(rightanglemark(K, L, G), linewidth(.5));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
dot("$A$", A, S);
dot("$B$", B, S);
dot("$C$", C, dir(90));
dot("$D$", D, dir(90));
dot("$E$", E, S);
dot("$F$", F, dir(0));
dot("$G$", G, N);
dot("$H$", H, W);
dot("$I$", I, SW);
dot("$J$", J, SW);
dot("$K$", K, N);
dot("$L$", L, S);
```

</asy>

$[ABCD] = 4$, $AB = 2$, $[AHE] = 1$, $AH = AE = \sqrt{2}$, $DH = 2 - \sqrt{2}$, $JL = HK = \sqrt{2} \cdot DH = 2 \sqrt{2} - 2$

Because $ABCD$ is a square and $AH = AE$, $AC$ is the line of symmetry of pentagon $CDHEB$. Because $[DHJG] = [BFIE]$, $DHJG$ is the reflection of $BFIE$ about line $AC$

Let $FI = GJ = x$, $KL = LG = GJ - LJ = x - 2 \sqrt{2} + 2$

$[DHK] = \frac{(2 - \sqrt{2})^2}{2} = 3 - 2 \sqrt {2}$

$[GKL] = \frac{(x - 2 \sqrt{2} + 2)^2}{2} = \frac{x^2}{2} + 2x - 2x \sqrt{2} - 4 \sqrt{2} + 6$

$[HKJL] = (x - 2 \sqrt{2} + 2) \cdot (2 \sqrt{2} - 2) = 2x \sqrt{2} - 2x + 8 \sqrt{2} -12$


$$[DHK] + [GKL] + [HKLJ] = [DHJG]$$


$$3 - 2 \sqrt {2} +  \frac{x^2}{2} + 2x - 2x \sqrt{2} - 4 \sqrt{2} + 6 + 2x \sqrt{2} - 2x + 8 \sqrt{2} -12= 1$$


$$\frac{x^2}{2} + 2 \sqrt{2} - 4 = 0$$


$$x^2 = 8 - 4 \sqrt{2}$$


$$FI^2 = \boxed{\textbf{(B)}\ 8-4\sqrt{2}}$$


~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 7 (Easy to See)
Note that the side length of $ABCD$ is 2 and thus the diagonal is of length $\sqrt{2}$. However, the height to side $HE$ in triangle $HAE$ is 1, implying that $CM = \sqrt{2}-1$ where $M$ is the midpoint of $JI$. From here suppose that $N$ is the midpoint of $\overline{FG}$ and let $x = NC$, which means $FG=2x$. The area of the pentagon is then


$$[FIJG]+[GCF]=GF \cdot FI + x^2 = (2x)(2\sqrt{2}-1-x)+x^2=1$$


Solving this quadratic for $x$ yields $x=2\sqrt{2}-1 \pm \sqrt{8-4\sqrt{2}}$ (technically the smaller value is the correct one but it doesn’t matter for our purposes). We can then calculate $FI^2 = (\sqrt{2} -1 -x)^2 = \boxed{\textbf{(B) } 8-4\sqrt{2}}$.

*~Dhillonr25*
## Solution 8
We extend $\overline{FB}$ and $\overline{IE}$ to meet at a point $X$. Since $\angle AEI = \angle BEX$ and $FX$ is parallel to $DA$, we know that $\triangle{BEX} \sim \triangle{AEH}$, and because $\angle BXE = \angle IXF$ and $\angle XBE = \angle XIF$, we can conclude that $\triangle{BEX} \sim \triangle{AEH} \sim \triangle{IFX}$.

Now, because $\triangle{AEH}$ is isosceles, right, and has an area of 1, we can conclude that $AE = AH = \sqrt{2}$ and that BE $= \sqrt{2}$. Armed with this knowledge, and setting $IF = a$ and the area of $\triangle{BEX} = b$, we can use similarity to say that


$$(\frac{a}{2-\sqrt{2}})^2 = \frac{1+b}{b}$$


Since we know the side lengths of $\triangle{BEX}$ due to the fact that it is also an isosceles right triangle, we know that the area is $\frac{(2-\sqrt{2})^2}{2}$.
Simplifying further and plugging in values, we have


$$\frac{a^2}{(2-\sqrt{2})^2} = 1 + \frac{2}{(2-\sqrt{2})^2)}$$


Multiplying by $(\sqrt{2})^2$ on both sides, we get


$$a^2 = (2-\sqrt{2})^2 + 2 = \boxed{\textbf{(B)}\ 8-4\sqrt{2}}$$


*~yingkai_0_*
## Video Solution (HOW TO THINK CREATIVELY!!!)
https://youtu.be/oRvHHywcw4w

*~Education, the Study of Everything*
## Video Solution by MathEx
https://www.youtube.com/watch?v=AKJXB07Sat0
## Video Solution by TheBeautyOfMath
https://youtu.be/VZYe3Hu88OA?t=189
## Really Good Vid Explanation
https://www.youtube.com/watch?v=AUndgrOH8U8&ab_channel=ReachTheStars
## See Also
