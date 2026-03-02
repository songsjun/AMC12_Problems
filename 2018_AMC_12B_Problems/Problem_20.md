# 2018 AMC 12B Problem 20

> This problem is the same as [2018 AMC 12B #20](https://artofproblemsolving.com/wiki/index.php/2018_AMC_12B_Problems) and [2018 AMC 10B #24](https://artofproblemsolving.com/wiki/index.php/2018_AMC_10B_Problems).
## Problem
Let $ABCDEF$ be a regular hexagon with side length $1$. Denote by $X$, $Y$, and $Z$ the midpoints of sides $\overline {AB}$, $\overline{CD}$, and $\overline{EF}$, respectively. What is the area of the convex hexagon whose interior is the intersection of the interiors of $\triangle ACE$ and $\triangle XYZ$?

$\textbf{(A)}\ \frac {3}{8}\sqrt{3} \qquad \textbf{(B)}\ \frac {7}{16}\sqrt{3} \qquad \textbf{(C)}\ \frac {15}{32}\sqrt{3} \qquad  \textbf{(D)}\ \frac {1}{2}\sqrt{3} \qquad \textbf{(E)}\ \frac {9}{16}\sqrt{3}$
## Diagram
<asy>
/* Made by MRENTHUSIASM */

> [Asymptote diagram - not rendered in Markdown]

```asy
size(200);
draw(polygon(6));
pair A, B, C, D, E, F, X, Y, Z, M, N, O, P, Q, R;
A = dir(120);
B = dir(60);
C = dir(0);
D = dir(300);
E = dir(240);
F = dir(180);
X = midpoint(A--B);
Y = midpoint(C--D);
Z = midpoint(E--F);
M = intersectionpoint(A--E,X--Z);
N = intersectionpoint(A--C,X--Y);
O = intersectionpoint(C--E,Y--Z);
P = intersectionpoint(A--C,X--Z);
Q = intersectionpoint(C--E,X--Y);
R = intersectionpoint(A--E,Y--Z);
fill(M--P--N--Q--O--R--cycle,mediumgray);
dot("$A$",A,1.5*dir(A),linewidth(4));
dot("$B$",B,1.5*dir(B),linewidth(4));
dot("$C$",C,1.5*dir(C),linewidth(4));
dot("$D$",D,1.5*dir(D),linewidth(4));
dot("$E$",E,1.5*dir(E),linewidth(4));
dot("$F$",F,1.5*dir(F),linewidth(4));
dot("$X$",X,1.5*dir(X),linewidth(4));
dot("$Y$",Y,1.5*dir(Y),linewidth(4));
dot("$Z$",Z,1.5*dir(Z),linewidth(4));
```

dot(M^^N^^O^^P^^Q^^R,linewidth(4));

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(A--C--E--cycle^^X--Y--Z--cycle);
```

</asy>
*~MRENTHUSIASM*
## Solution 1 (Area Addition)
<asy>
/* Made by MRENTHUSIASM */

> [Asymptote diagram - not rendered in Markdown]

```asy
size(200);
draw(polygon(6));
pair A, B, C, D, E, F, X, Y, Z, M, N, O, P, Q, R;
A = dir(120);
B = dir(60);
C = dir(0);
D = dir(300);
E = dir(240);
F = dir(180);
X = midpoint(A--B);
Y = midpoint(C--D);
Z = midpoint(E--F);
M = intersectionpoint(A--E,X--Z);
N = intersectionpoint(A--C,X--Y);
O = intersectionpoint(C--E,Y--Z);
P = intersectionpoint(A--C,X--Z);
Q = intersectionpoint(C--E,X--Y);
R = intersectionpoint(A--E,Y--Z);
fill(M--P--N--Q--O--R--cycle,mediumgray);
dot("$A$",A,1.5*dir(A),linewidth(4));
dot("$B$",B,1.5*dir(B),linewidth(4));
dot("$C$",C,1.5*dir(C),linewidth(4));
dot("$D$",D,1.5*dir(D),linewidth(4));
dot("$E$",E,1.5*dir(E),linewidth(4));
dot("$F$",F,1.5*dir(F),linewidth(4));
dot("$X$",X,1.5*dir(X),linewidth(4));
dot("$Y$",Y,1.5*dir(Y),linewidth(4));
dot("$Z$",Z,1.5*dir(Z),linewidth(4));
dot("$M$",M,1.5*dir(165),linewidth(4));
dot("$N$",N,1.5*dir(45),linewidth(4));
dot("$O$",O,1.5*dir(-75),linewidth(4));
dot("$P$",P,1.5*dir(105),linewidth(4));
dot("$Q$",Q,1.5*dir(-15),linewidth(4));
dot("$R$",R,1.5*dir(-135),linewidth(4));
draw(A--C--E--cycle^^X--Y--Z--cycle);
draw(M--N--O--cycle,dashed);
```

</asy>

The desired area (hexagon $MPNQOR$) consists of an equilateral triangle $(\triangle MNO)$ and three right triangles ($\triangle MPN,\triangle NQO,$ and $\triangle ORM$).

Notice that $\overline {AD}$ (not shown) and $\overline {BC}$ are parallel. $\overline {XY}$ divides transversals $\overline {AB}$ and $\overline {CD}$ into a $1:1$ ratio (This can be shown by similar triangles.). Thus, it must also divide transversal $\overline {AC}$ and transversal $\overline {CO}$ into a $1:1$ ratio. By symmetry, the same applies for $\overline {CE}$ and $\overline {EA}$ as well as $\overline {EM}$ and $\overline {AN}.$

In $\triangle ACE,$ we see that $\frac{[MNO]}{[ACE]} = \frac{1}{4}$ and $\frac{[MPN]}{[ACE]} = \frac{1}{8}.$ Our desired area becomes

$$\left(\frac{1}{4}+3 \cdot \frac{1}{8}\right) \cdot \frac{(\sqrt{3})^2 \cdot \sqrt{3}}{4} = \boxed{\textbf{(C)}\ \frac {15}{32}\sqrt{3}}.$$
## Solution 2 (Area Subtraction)
Instead of directly finding the desired hexagonal area, $\triangle XYZ$ can be found. It consists of three triangles and the desired hexagon. Given triangle rotational symmetry, the three triangles are congruent. See that $\triangle XYZ$ and $\triangle ACE$ are equilateral, so $m\angle PXN=60,$ so $m\angle AXP = \frac{180-60}{2}=60.$ As $\overline {AC}$ is a transversal running through $\overline {FC}$ (use your imagination) and $\overline {AB},$ we have $m\angle BAC=m\angle FCA = \frac{m\angle ACE}{2}=30.$

Then, $\triangle APX$ is a $30-$60-$90$ triangle. By HL congruence, $\triangle APX \cong \triangle NPX.$ Note that $AX=\frac{1}{2}.$ Then, the area of $\triangle PXN$ is $\frac{\sqrt{3}}{32}.$ There are three such triangles for a total area of $\triangle XYZ$ is $\frac{3\sqrt{3}}{32}.$ Find the side of $\triangle XYZ$ to be $\frac{3}{2},$ so the area is $\frac{9\sqrt{3}}{16}.$

The answer is

$$\frac{9\sqrt{3}}{16}-\frac{3\sqrt{3}}{32}=\boxed{\textbf{(C)}\ \frac {15}{32}\sqrt{3}}.$$


*~BJHHar*
## Solution 3 (Area Subtraction)
<asy>
/* Made by MRENTHUSIASM */

> [Asymptote diagram - not rendered in Markdown]

```asy
size(200);
draw(polygon(6));
pair A, B, C, D, E, F, X, Y, Z, M, N, O, P, Q, R;
A = dir(120);
B = dir(60);
C = dir(0);
D = dir(300);
E = dir(240);
F = dir(180);
X = midpoint(A--B);
Y = midpoint(C--D);
Z = midpoint(E--F);
M = intersectionpoint(A--E,X--Z);
N = intersectionpoint(A--C,X--Y);
O = intersectionpoint(C--E,Y--Z);
P = intersectionpoint(A--C,X--Z);
Q = intersectionpoint(C--E,X--Y);
R = intersectionpoint(A--E,Y--Z);
fill(M--P--N--Q--O--R--cycle,mediumgray);
dot("$A$",A,1.5*dir(A),linewidth(4));
dot("$B$",B,1.5*dir(B),linewidth(4));
dot("$C$",C,1.5*dir(C),linewidth(4));
dot("$D$",D,1.5*dir(D),linewidth(4));
dot("$E$",E,1.5*dir(E),linewidth(4));
dot("$F$",F,1.5*dir(F),linewidth(4));
dot("$X$",X,1.5*dir(X),linewidth(4));
dot("$Y$",Y,1.5*dir(Y),linewidth(4));
dot("$Z$",Z,1.5*dir(Z),linewidth(4));
dot("$M$",M,1.5*dir(165),linewidth(4));
dot("$N$",N,1.5*dir(45),linewidth(4));
dot("$O$",O,1.5*dir(-75),linewidth(4));
dot("$P$",P,1.5*dir(105),linewidth(4));
dot("$Q$",Q,1.5*dir(-15),linewidth(4));
dot("$R$",R,1.5*dir(-135),linewidth(4));
draw(A--C--E--cycle^^X--Y--Z--cycle);
draw(M--N--O--cycle,dashed);
```

</asy>

Now, if we look at the figure, we can see that the complement of the hexagon we are trying to find is composed of $3$ isosceles trapezoids (namely $AXZF,CYXB,$ and $EZYD$) and $3$ right triangles (namely $\triangle XPN,\triangle YQO,$ and $\triangle ZRM$).

Finding the trapezoid's area, we know that one base of each trapezoid is just the side length of the hexagon, which is $1,$ and the other base is $\frac{3}{2}$ (it is halfway in between the side and the longest diagonal, which has length $2$) with a height of $\frac{\sqrt{3}}{4}$ (by using the Pythagorean Theorem and the fact that it is an isosceles trapezoid) to give each trapezoid having an area of $\frac{5\sqrt{3}}{16}$ for a total area of $\frac{15\sqrt{3}}{16}.$ (Alternatively, we could have calculated the area of hexagon $ABCDEF$ and subtracted the area of $\triangle XYZ,$ which, as we showed before, had a side length of $\frac{3}{2}$).

Now, we need to find the area of each of the small triangles, which, if we look at the triangle that has a vertex on $X,$ is similar to the triangle with a base of $YC = \frac12.$ Using similar triangles, we calculate the base to be $\frac{1}{4}$ and the height to be $\frac{\sqrt{3}}{4}$ giving us an area of  $\frac{\sqrt{3}}{32}$ per triangle, and a total area of $\frac{3\sqrt{3}}{32}.$ Adding the two areas together, we get $\frac{15\sqrt{3}}{16} + \frac{3\sqrt{3}}{32} = \frac{33\sqrt{3}}{32}.$ Finding the total area, we get $6 \cdot 1^2 \cdot \frac{\sqrt{3}}{4}=\frac{3\sqrt{3}}{2}.$ Taking the complement, we get $\frac{3\sqrt{3}}{2} - \frac{33\sqrt{3}}{32} = \boxed{\textbf{(C)}\ \frac {15}{32}\sqrt{3}}.$
## Solution 4 (Area Subtraction)
<asy>
/* Made by MRENTHUSIASM */

> [Asymptote diagram - not rendered in Markdown]

```asy
size(200);
draw(polygon(6));
pair A, B, C, D, E, F, X, Y, Z, M, N, O, P, Q, R;
A = dir(120);
B = dir(60);
C = dir(0);
D = dir(300);
E = dir(240);
F = dir(180);
X = midpoint(A--B);
Y = midpoint(C--D);
Z = midpoint(E--F);
M = intersectionpoint(A--E,X--Z);
N = intersectionpoint(A--C,X--Y);
O = intersectionpoint(C--E,Y--Z);
P = intersectionpoint(A--C,X--Z);
Q = intersectionpoint(C--E,X--Y);
R = intersectionpoint(A--E,Y--Z);
fill(M--P--N--Q--O--R--cycle,mediumgray);
dot("$A$",A,1.5*dir(A),linewidth(4));
dot("$B$",B,1.5*dir(B),linewidth(4));
dot("$C$",C,1.5*dir(C),linewidth(4));
dot("$D$",D,1.5*dir(D),linewidth(4));
dot("$E$",E,1.5*dir(E),linewidth(4));
dot("$F$",F,1.5*dir(F),linewidth(4));
dot("$X$",X,1.5*dir(X),linewidth(4));
dot("$Y$",Y,1.5*dir(Y),linewidth(4));
dot("$Z$",Z,1.5*dir(Z),linewidth(4));
dot("$M$",M,1.5*dir(165),linewidth(4));
dot("$N$",N,1.5*dir(45),linewidth(4));
dot("$O$",O,1.5*dir(-75),linewidth(4));
dot("$P$",P,1.5*dir(105),linewidth(4));
dot("$Q$",Q,1.5*dir(-15),linewidth(4));
dot("$R$",R,1.5*dir(-135),linewidth(4));
draw(A--C--E--cycle^^X--Y--Z--cycle);
```

</asy>

We could also subtract $\triangle APM,\triangle CQN,$ and $\triangle ERO$ from $\triangle ACE.$

Since $\angle BAF = 120^{\circ}$ and $\angle BAC = \angle FAE = 30^{\circ},$ we have $\angle CAE = \angle BAF-\angle BAC-\angle FAE=60^{\circ}.$

Since $AX=BX$ and $FZ=EZ,$ we have $AF \parallel XZ,$ from which $\angle AMX= \angle FAM = 30^{\circ}.$

We can show that $\triangle APM$ is $30-$60-$90$ using a similar method, $\triangle CQN$ and $\triangle ERO$ are also $30-$60-$90.$

Since $AC=CE=AE=\sqrt{3},$ we have $[ACE]=AC^2 \cdot \frac{\sqrt{3}}{4}=3 \cdot \frac{\sqrt{3}}{4} = \frac{3 \sqrt{3}}{4}.$

Since $AX= \frac{1}{2}$ and $AP = AX \cdot \frac{\sqrt{3}}{2}= \frac{1}{2} \cdot \frac{\sqrt{3}}{2} = \frac{\sqrt{3}}{4},$ we have $PM = AP \cdot \sqrt{3} = \frac{\sqrt{3}}{4} \cdot \sqrt{3} = \frac{3}{4}.$

Note that

$$[APM]=[CQN]=[ERO]=\frac{1}{2} \cdot AP \cdot PM = \frac{1}{2} \cdot \frac{\sqrt{3}}{4} \cdot \frac{3}{4} = \frac{3 \sqrt{3}}{32}.$$


Therefore, we get


$$[PNQORM]=[ACE]-[APM]-[CQN]-[ERO]=\frac{3 \sqrt{3}}{4} - 3 \cdot \frac{3 \sqrt{3}}{32} = \frac{24 \sqrt{3}}{32} - \frac{9 \sqrt{3}}{32} = \boxed{\textbf{(C)}\ \frac {15}{32}\sqrt{3}}.$$


~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 5 (Partition the Hexagon)
We partition hexagon $ABCDEF$ into $48$ congruent $\circ\text{-}60^\circ\text{-}90^\circ$ triangles, as shown below:
<asy>
/* Made by MRENTHUSIASM */

> [Asymptote diagram - not rendered in Markdown]

```asy
size(200);
pair A, B, C, D, E, F, X, Y, Z, M, N, O, P, Q, R;
A = dir(120);
B = dir(60);
C = dir(0);
D = dir(300);
E = dir(240);
F = dir(180);
X = midpoint(A--B);
Y = midpoint(C--D);
Z = midpoint(E--F);
M = intersectionpoint(A--E,X--Z);
N = intersectionpoint(A--C,X--Y);
O = intersectionpoint(C--E,Y--Z);
P = intersectionpoint(A--C,X--Z);
Q = intersectionpoint(C--E,X--Y);
R = intersectionpoint(A--E,Y--Z);
fill(M--P--N--Q--O--R--cycle,mediumgray);
draw(A--D^^B--E^^C--F^^X--Y--Z--cycle^^midpoint(A--F)--midpoint(B--C)--midpoint(D--E)--cycle,red);
draw(A--C--E--cycle^^M--N--O--cycle^^M--midpoint(F--Z)^^M--F+1/4*(A-F)^^N--midpoint(X--B)^^N--B+1/4*(C-B)^^O--midpoint(Y--D)^^O--D+1/4*(E-D),blue);
draw(polygon(6));
dot("$A$",A,1.5*dir(A),linewidth(4));
dot("$B$",B,1.5*dir(B),linewidth(4));
dot("$C$",C,1.5*dir(C),linewidth(4));
dot("$D$",D,1.5*dir(D),linewidth(4));
dot("$E$",E,1.5*dir(E),linewidth(4));
dot("$F$",F,1.5*dir(F),linewidth(4));
dot("$X$",X,1.5*dir(X),linewidth(4));
dot("$Y$",Y,1.5*dir(Y),linewidth(4));
dot("$Z$",Z,1.5*dir(Z),linewidth(4));
```

dot(M^^N^^O^^P^^Q^^R,linewidth(4));
</asy>
Let the brackets denote areas. Note that the desired region contains $15$ of the $48$ small triangles, so the answer is

$$\frac{15}{48}[ABCDEF]=\frac{15}{48}\cdot\frac{3\sqrt3}{2}=\boxed{\textbf{(C)}\ \frac {15}{32}\sqrt{3}}.$$


*~AlexLikeMath ~MRENTHUSIASM*
## Solution 6 (Partition the Hexagon)
Dividing $\triangle MNO$ into two right triangles congruent to $\triangle PMN,$ we see that $[MPNQOR]=\dfrac{5}{8}[ACE].$ Because $[ACE] = \dfrac{1}{2}[ABCDEF],$ we have $[MPNQOR]=\dfrac{5}{16}[ABCDEF].$ From here, you should be able to tell that the answer will have a factor of $5,$ and $\boxed{\textbf{(C)}\ \frac {15}{32}\sqrt{3}}$ is the only answer that has a factor of $5.$ However, if you want to actually calculate the area, you would calculate $[ABCDEF]$ to be $6 \cdot \dfrac{\sqrt{3}}{2 \cdot 2} = \dfrac{3\sqrt{3}}{2},$ so $[MPNQOR] = \dfrac{5}{16} \cdot \dfrac{3\sqrt{3}}{2} = \frac {15}{32}\sqrt{3}.$
## Solution 7 (Trigonometry)
Notice, the area of the convex hexagon formed through the intersection of the $2$ triangles can be found by finding the area of the triangle formed by the midpoints of the sides and subtracting the smaller triangles that are formed by the region inside this triangle but outside the other triangle. First, let's find the area of the triangle formed by the midpoint of the sides. Notice, this is an equilateral triangle, thus all we need is to find the length of its side.
To do this, we look at the isosceles trapezoid outside this triangle but inside the outer hexagon. Since the interior angle of a regular hexagon is $\circ$ and the trapezoid is isosceles, we know that the angle opposite is $\circ,$ and thus the side length of this triangle is $\left(\frac{1}{2}\cos 60^\circ\right)=1+\frac{1}{2}=\frac{3}{2}.$ So the area of this triangle is $\frac{\sqrt{3}}{4}\frac{9\sqrt{3}}{16}.$

Now let's find the area of the smaller triangles. Notice, $\triangle ACE$ cuts off smaller isosceles triangles from the outer hexagon. The base of these isosceles triangles is perpendicular to the base of the isosceles trapezoid mentioned before, thus we can use trigonometric ratios to find the base and height of these smaller triangles, which are all congruent due to the rotational symmetry of a regular hexagon. The area is then $\frac{1}{2}\left(\frac{1}{2}\cos 60^\circ\right)\left(\frac{1}{2}\sin 60^\circ\right)=\frac{\sqrt{3}}{32}$ and the sum of the areas is $\cdot \frac{\sqrt{3}}{32}=\frac{3\sqrt{3}}{32}.$

Therefore, the area of the convex hexagon is $\frac{9\sqrt{3}}{16}-\frac{3\sqrt{3}}{32}=\frac{18\sqrt{3}}{32}-\frac{3\sqrt{3}}{32}=\boxed{\textbf{(C)}\ \frac {15}{32}\sqrt{3}}.$
## Solution 8 (Linear Transformation)
If we try to coordinate bash this problem, it's going to look very ugly with a lot of radicals. However, we can alter and skew the diagram in such a way that all ratios of lengths and areas stay the same while making it a lot easier to work with. Then, we can find the ratio of the area of the wanted region to the area of $ABCDEF$ then apply it to the old diagram.
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(1cm);
draw((0,0)--(4,0)--(6,3.464)--(2,3.464)--(0,0));
draw((2,0)--(1,1.732));
draw((5,1.732)--(4,3.464));
draw((1.5, 0.866)--(3, 3.464)--(4.5, 0.866)--cycle);
draw((2,0)--(2,3.464)--(5,1.732)--cycle);
```

</asy>

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(1cm);
fill((1,4)--(1,3.5)--(2,3)--cycle,red);
fill((1,1)--(1.5,1)--(1,2)--cycle,red);
fill((3,1)--(3.5,1.5)--(4,1)--cycle,red);
draw((1,0)--(1,4),gray(.7));
draw((2,0)--(2,4),gray(.7));
draw((3,0)--(3,4),gray(.7));
draw((0,1)--(4,1),gray(.7));
draw((0,2)--(4,2),gray(.7));
draw((0,3)--(4,3),gray(.7));
draw((0,0)--(4,0)--(4,4)--(0,4)--(0,0));
draw((2,0)--(0,2));
draw((4,2)--(2,4));
draw((1,1)--(1,4)--(4,1)--cycle);
draw((0,4)--(2,0)--(4,2)--cycle);
```

</asy>

The isosceles right triangle with a leg length of $3$ in the new diagram is $\triangle XYZ$ in the old diagram. We see that if we want to take the area of the new hexagon, we must subtract $\frac{3}{4}$ from the area of $\triangle XYZ$ (the red triangles), giving us $\frac{15}{4}.$ However, we need to take the ratio of this area to the area of $ABCDEF,$ which is $\frac{\frac{15}{4}}{12}=\frac{5}{16}.$ Now we know that our answer is $\frac{5}{16} \cdot \frac{3\sqrt{3}}{2}=\boxed{\textbf{(C)}\ \frac {15}{32}\sqrt{3}}.$
## Solution 9 (Midsegment Theorem)
<asy>
/* Made by MRENTHUSIASM */

> [Asymptote diagram - not rendered in Markdown]

```asy
size(200);
draw(polygon(6));
pair A, B, C, D, E, F, X, Y, Z, M, N, O, P, Q, R, G;
A = dir(120);
B = dir(60);
C = dir(0);
D = dir(300);
E = dir(240);
F = dir(180);
X = midpoint(A--B);
Y = midpoint(C--D);
Z = midpoint(E--F);
```


G = midpoint(A--D);

M = intersectionpoint(A--E,X--Z);
N = intersectionpoint(A--C,X--Y);
O = intersectionpoint(C--E,Y--Z);
P = intersectionpoint(A--C,X--Z);
Q = intersectionpoint(C--E,X--Y);
R = intersectionpoint(A--E,Y--Z);

> [Asymptote diagram - not rendered in Markdown]

```asy
fill(M--P--N--Q--O--R--cycle,mediumgray);
dot("$A$",A,1.5*dir(A),linewidth(4));
dot("$B$",B,1.5*dir(B),linewidth(4));
dot("$C$",C,1.5*dir(C),linewidth(4));
dot("$D$",D,1.5*dir(D),linewidth(4));
dot("$E$",E,1.5*dir(E),linewidth(4));
dot("$F$",F,1.5*dir(F),linewidth(4));
dot("$X$",X,1.5*dir(X),linewidth(4));
dot("$Y$",Y,1.5*dir(Y),linewidth(4));
dot("$Z$",Z,1.5*dir(Z),linewidth(4));
```


dot(O^^Q^^R,linewidth(4));

> [Asymptote diagram - not rendered in Markdown]

```asy
dot("$N$",N,1.5*dir(N),linewidth(4));
dot("$M$",M,1.5*dir(M),linewidth(4));
dot("$P$",P,1.5*dir(P),linewidth(4));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
dot("$G$",G,1.5*dir(G),linewidth(4));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
draw(A--C--E--cycle^^X--Y--Z--cycle);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
draw(A--G^^C--G);
draw(N--B);
draw(N--E--A--cycle^^M--P, red);
```


</asy>
(~MRENTHUSIASM's diagram + modifications)
### Lemma 1: $MP$ is midsegment of $\triangle ANE$.
As $ZX$ is a midsegment of trapezoid $FEBA$, we know that $FA||ZX||EB$. Furthermore, by subdividing trapezoid $FEBA$, $ZM,MP,PX$ are midsegments of $\triangle EFA, \triangle ANE, \triangle, ANB$ respectively.

### Lemma 2: $[ACE] = \frac12[ABCDEF]$
Due to radial symmetry about the center, $G$, we only have to prove $[AGC] = [CBA]$. As $\triangle AGB$ and $\triangle CBG$ are equilateral triangles, $AC$ therefore divides rhombus $ABCG$ into 2 congruent halves. $\triangle AGC$ and $\triangle CBA$ thus each contain two such congruent triangles, which means that their areas are equal.

### Lemma 3: $[AMP] = \frac1{16}[ABCDEF]$
From Lemma 1, $\triangle AMP \simeq \triangle AEN$ with a scale factor of $\frac12$, which means $[AMP] = \frac14[AEN]$. Furthermore, due to symmetry of $\triangle AEN$ and $\triangle CEN$ about $EN$, $[AEN] = \frac12[ACE]$. Therefore, $[AMP] =  \frac18[ACE]$, or (using lemma 2) $\frac1{16}[ABCDEF]$.

### Lemma 4: $[ABCDEF] = \frac{3\sqrt3}2$
Because the hexagon is regular, $[ABCDEF] = 6[ABG] = \frac{6\sqrt3}4 = \frac{3\sqrt3}2$. (For more info on where $\frac{\sqrt3}4$ came from, use the search term "area of equilateral triangle")
### Final step:
To find the area of the shaded part, we seek $[ACE] - 3[AMP]$. Using lemmas 2 and 3, the expression resolves to $\frac12[ABCDEF] - \frac1{16}[ABCDEF] = \frac5{16} \cdot \frac{3\sqrt3}2 = \boxed{\textbf{(C)}\ \frac{15}{32}\sqrt{3}}$.

~[https://artofproblemsolving.com/wiki/index.php/User:math660 math660]
## Video Solution
https://www.youtube.com/watch?v=yDbn9Mx2myw
## See Also
